import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM = 'Inclusia <hola@inclusiajobs.com>'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://inclusiajobs.com'

/* ── Shared email wrapper for consistent error handling ── */
export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  if (error) throw new Error(error.message)
}

/* ── Shared HTML shell ── */
export function emailShell({
  preheader = '',
  body,
  footer = `<p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">
    Recibes este email de <a href="${APP_URL}" style="color:#6b7280;">Inclusia</a> · Red de apoyo educativo en España.<br>
    <a href="${APP_URL}/dashboard/perfil" style="color:#6b7280;">Gestionar mi perfil</a>
  </p>`,
}: {
  preheader?: string
  body: string
  footer?: string
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td style="background:#2563eb;padding:24px 32px;border-radius:12px 12px 0 0;">
    <a href="${APP_URL}" style="text-decoration:none;display:flex;align-items:center;gap:12px;">
      <div style="width:40px;height:40px;background:white;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
        <span style="color:#2563eb;font-weight:800;font-size:20px;">I</span>
      </div>
      <span style="color:white;font-size:22px;font-weight:800;vertical-align:middle;">Inclusia</span>
    </a>
  </td></tr>
  <!-- Body -->
  <tr><td style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
    ${body}
    ${footer}
  </td></tr>
  <!-- Bottom -->
  <tr><td style="padding:16px 0;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} Inclusia · inclusiajobs.com</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}
