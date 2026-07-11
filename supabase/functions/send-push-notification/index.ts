// Supabase Edge Function: send-push-notification
//
// Triggered by a Database Webhook on INSERT into `notifications`. Looks up
// this user's registered APNs device tokens and sends a push via Apple's
// HTTP/2 API, signing a fresh ES256 JWT with the APNs Auth Key (.p8) on
// every invocation (no external dependencies — uses Deno's Web Crypto API).
//
// Required secrets (Dashboard → Edge Functions → send-push-notification →
// Secrets, or project-wide Edge Function secrets):
//   APNS_KEY_ID       - the Key ID shown when you created the .p8 key
//   APNS_TEAM_ID      - your Apple Developer Team ID
//   APNS_PRIVATE_KEY  - the full contents of the .p8 file, including the
//                       -----BEGIN/END PRIVATE KEY----- lines
//   APNS_BUNDLE_ID    - Javier.inclusiaApp
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by
// Supabase to every Edge Function — no need to set them manually.

const APNS_KEY_ID = Deno.env.get("APNS_KEY_ID")!;
const APNS_TEAM_ID = Deno.env.get("APNS_TEAM_ID")!;
const APNS_PRIVATE_KEY_PEM = Deno.env.get("APNS_PRIVATE_KEY")!;
const APNS_BUNDLE_ID = Deno.env.get("APNS_BUNDLE_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

let cachedKey: CryptoKey | null = null;
async function importAPNsKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(APNS_PRIVATE_KEY_PEM),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  return cachedKey;
}

/// Builds a fresh APNs auth JWT (ES256). Apple recommends reusing a token
/// for up to ~55 minutes, but signing fresh per-invocation is simpler and
/// well within Apple's rate limits for this app's notification volume.
async function buildAPNsJWT(): Promise<string> {
  const header = { alg: "ES256", kid: APNS_KEY_ID };
  const payload = { iss: APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importAPNsKey();
  // Web Crypto's ECDSA signature is the raw (r||s) format, which is exactly
  // what JWS ES256 expects — no DER conversion needed.
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encoder.encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
}

interface DeviceToken {
  id: string;
  token: string;
  environment: "sandbox" | "production";
}

async function fetchDeviceTokens(userId: string): Promise<DeviceToken[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/device_tokens?user_id=eq.${userId}&select=id,token,environment`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  if (!response.ok) return [];
  return await response.json();
}

async function deleteDeviceToken(id: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/device_tokens?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
}

async function sendPush(jwt: string, deviceToken: DeviceToken, notification: NotificationRecord): Promise<void> {
  const host = deviceToken.environment === "sandbox"
    ? "https://api.sandbox.push.apple.com"
    : "https://api.push.apple.com";

  const payload = {
    aps: {
      alert: { title: notification.title, body: notification.body ?? "" },
      sound: "default",
    },
    offer_id: notification.data?.offer_id ?? null,
    type: notification.type,
  };

  const response = await fetch(`${host}/3/device/${deviceToken.token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": APNS_BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
    },
    body: JSON.stringify(payload),
  });

  // 410 Gone (or 400 BadDeviceToken) means the token is no longer valid —
  // clean it up so we stop trying.
  if (response.status === 410) {
    await deleteDeviceToken(deviceToken.id);
  } else if (response.status === 400) {
    const body = await response.json().catch(() => ({}));
    if (body.reason === "BadDeviceToken") await deleteDeviceToken(deviceToken.id);
  }
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const notification: NotificationRecord | undefined = payload.record;
    if (!notification?.user_id) {
      return new Response(JSON.stringify({ skipped: "no user_id on record" }), { status: 200 });
    }

    const tokens = await fetchDeviceTokens(notification.user_id);
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ skipped: "no device tokens for user" }), { status: 200 });
    }

    const jwt = await buildAPNsJWT();
    await Promise.all(tokens.map((token) => sendPush(jwt, token, notification)));

    return new Response(JSON.stringify({ sent: tokens.length }), { status: 200 });
  } catch (error) {
    console.error("send-push-notification error:", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
