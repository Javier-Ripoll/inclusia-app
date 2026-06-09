-- ============================================================
-- INCLUSIA – MIGRACIÓN 02: RLS + Triggers + Auth hook
-- ============================================================

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table professional_profiles enable row level security;
alter table company_profiles enable row level security;
alter table job_offers enable row level security;
alter table applications enable row level security;
alter table company_favorites enable row level security;
alter table hiring_history enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- PROFILES
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- PROFESSIONAL PROFILES: lectura pública, escritura propia
create policy "Professional profiles are publicly readable"
  on professional_profiles for select using (true);
create policy "Professionals manage own profile"
  on professional_profiles for all
  using (user_id = auth.uid());

-- COMPANY PROFILES: lectura pública, escritura propia
create policy "Company profiles are publicly readable"
  on company_profiles for select using (true);
create policy "Companies manage own profile"
  on company_profiles for all
  using (user_id = auth.uid());

-- JOB OFFERS: activas son públicas
create policy "Active offers are publicly readable"
  on job_offers for select using (status = 'active');
create policy "Companies manage own offers"
  on job_offers for all
  using (company_id in (select id from company_profiles where user_id = auth.uid()));

-- APPLICATIONS
create policy "Professionals see own applications"
  on applications for select
  using (professional_id in (select id from professional_profiles where user_id = auth.uid()));
create policy "Companies see applications to their offers"
  on applications for select
  using (offer_id in (
    select id from job_offers where company_id in (
      select id from company_profiles where user_id = auth.uid()
    )
  ));
create policy "Professionals create applications"
  on applications for insert
  with check (professional_id in (select id from professional_profiles where user_id = auth.uid()));
create policy "Companies update application status"
  on applications for update
  using (offer_id in (
    select id from job_offers where company_id in (
      select id from company_profiles where user_id = auth.uid()
    )
  ));

-- NOTIFICATIONS
create policy "Users manage own notifications"
  on notifications for all using (user_id = auth.uid());

-- MESSAGES
create policy "Conversation participants see messages"
  on messages for select
  using (
    conversation_id in (
      select c.id from conversations c
      join professional_profiles pp on pp.id = c.professional_id
      join company_profiles cp on cp.id = c.company_id
      where pp.user_id = auth.uid() or cp.user_id = auth.uid()
    )
  );
create policy "Conversation participants send messages"
  on messages for insert with check (sender_id = auth.uid());

-- FAVORITES
create policy "Companies manage own favorites"
  on company_favorites for all
  using (company_id in (select id from company_profiles where user_id = auth.uid()));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger professional_profiles_updated_at
  before update on professional_profiles
  for each row execute function update_updated_at();

create trigger company_profiles_updated_at
  before update on company_profiles
  for each row execute function update_updated_at();

create trigger job_offers_updated_at
  before update on job_offers
  for each row execute function update_updated_at();

create trigger applications_updated_at
  before update on applications
  for each row execute function update_updated_at();

-- ============================================================
-- AUTH HOOK: crea perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  user_role_val user_role;
  company_name_val text;
begin
  -- Leer el rol de los metadatos del usuario
  user_role_val := coalesce(
    (new.raw_user_meta_data->>'role')::user_role,
    'professional'
  );

  -- Crear perfil base
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    user_role_val,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );

  -- Crear perfil específico según rol
  if user_role_val = 'professional' then
    insert into public.professional_profiles (user_id)
    values (new.id);

  elsif user_role_val = 'company' then
    company_name_val := coalesce(
      new.raw_user_meta_data->>'company_name',
      'Mi Centro'
    );
    insert into public.company_profiles (user_id, company_name)
    values (new.id, company_name_val);
  end if;

  return new;
end;
$$;

-- Trigger que llama al hook al crear usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
