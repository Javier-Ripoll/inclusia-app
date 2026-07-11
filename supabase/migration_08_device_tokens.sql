-- ============================================================
-- INCLUSIA – MIGRACIÓN 08: Device tokens para push notifications (APNs)
-- ============================================================
-- Usado por inclusiaApp (móvil) para registrar el token APNs de cada
-- dispositivo. Un usuario puede tener varios dispositivos, de ahí tabla
-- propia en vez de una columna en profiles. La columna `environment`
-- distingue sandbox (builds de Xcode) de production (TestFlight/App
-- Store), ya que APNs tiene endpoints distintos para cada uno.

create table device_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  token text not null,
  environment text not null default 'production',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, token)
);

alter table device_tokens enable row level security;

create policy "device_tokens_manage_own"
  on device_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
