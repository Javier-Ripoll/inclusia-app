-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";
create extension if not exists "postgis";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('professional', 'company', 'admin');
create type professional_plan as enum ('free', 'premium');
create type company_plan as enum ('basic', 'pro', 'premium');
create type offer_type as enum ('standard', 'urgent', 'substitute');
create type offer_status as enum ('active', 'covered', 'cancelled', 'expired');
create type application_status as enum ('pending', 'reviewed', 'accepted', 'rejected');
create type subscription_status as enum ('active', 'cancelled', 'past_due', 'trialing');
create type availability_type as enum ('full_time', 'part_time', 'mornings', 'afternoons', 'weekends', 'on_call');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text,
  phone text,
  avatar_url text,
  city text,
  province text,
  postal_code text,
  location geography(Point, 4326),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PROFESSIONAL PROFILES
-- ============================================================
create table professional_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references profiles(id) on delete cascade,
  plan professional_plan default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status subscription_status,
  bio text,
  cv_url text,
  years_experience int default 0,
  is_available boolean default true,
  available_immediately boolean default false,
  availabilities availability_type[] default '{}',
  specializations text[] default '{}',
  languages text[] default '{"Castellano"}',
  profile_embedding vector(1536),
  featured_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Professional specializations (normalized)
create table professional_specializations (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid references professional_profiles(id) on delete cascade,
  specialization text not null,
  unique(professional_id, specialization)
);

-- Education records
create table professional_education (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid references professional_profiles(id) on delete cascade,
  degree text not null,
  institution text,
  year_completed int,
  certified boolean default false,
  created_at timestamptz default now()
);

-- Experience records
create table professional_experience (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid references professional_profiles(id) on delete cascade,
  position text not null,
  company text,
  start_date date,
  end_date date,
  is_current boolean default false,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- COMPANY PROFILES
-- ============================================================
create table company_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references profiles(id) on delete cascade,
  plan company_plan default 'basic',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status subscription_status,
  company_name text not null,
  company_type text, -- centro educativo, asociación, empresa, administración
  cif text,
  website text,
  description text,
  logo_url text,
  verified boolean default false,
  -- Multi-center support (premium)
  parent_company_id uuid references company_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- JOB OFFERS
-- ============================================================
create table job_offers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  offer_type offer_type default 'standard',
  status offer_status default 'active',
  -- Location
  city text,
  province text,
  postal_code text,
  location geography(Point, 4326),
  -- Requirements
  required_specializations text[] default '{}',
  required_experience_years int default 0,
  required_education text,
  availability_needed availability_type[],
  -- Conditions
  contract_type text,
  salary_min numeric,
  salary_max numeric,
  schedule text,
  -- Urgency
  is_urgent boolean default false,
  start_date date,
  end_date date,
  -- AI
  offer_embedding vector(1536),
  -- Stats
  views_count int default 0,
  applications_count int default 0,
  -- Timestamps
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
create table applications (
  id uuid primary key default uuid_generate_v4(),
  offer_id uuid references job_offers(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  status application_status default 'pending',
  cover_letter text,
  match_score numeric, -- AI compatibility score 0-100
  viewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(offer_id, professional_id)
);

-- ============================================================
-- FAVORITES (company saves professionals)
-- ============================================================
create table company_favorites (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  notes text,
  created_at timestamptz default now(),
  unique(company_id, professional_id)
);

-- ============================================================
-- HIRING HISTORY
-- ============================================================
create table hiring_history (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  offer_id uuid references job_offers(id),
  hired_at timestamptz default now(),
  notes text
);

-- ============================================================
-- CHAT
-- ============================================================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  offer_id uuid references job_offers(id),
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(company_id, professional_id, offer_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null, -- 'new_offer', 'urgent_offer', 'application_update', 'message', 'match'
  title text not null,
  body text,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on job_offers using gist(location);
create index on profiles using gist(location);
create index on job_offers(status, is_urgent, created_at desc);
create index on job_offers(company_id, status);
create index on applications(professional_id, status);
create index on applications(offer_id, status);
create index on notifications(user_id, read, created_at desc);
create index on messages(conversation_id, created_at);

-- Vector indexes for AI matching
create index on professional_profiles using ivfflat(profile_embedding vector_cosine_ops);
create index on job_offers using ivfflat(offer_embedding vector_cosine_ops);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
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

-- Profiles: users see their own, companies see professional profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Professional profiles: public read for basic info, private write
create policy "Professional profiles are publicly readable" on professional_profiles for select using (true);
create policy "Professionals manage own profile" on professional_profiles for all using (
  user_id = (select id from profiles where id = auth.uid())
);

-- Company profiles: public read, private write
create policy "Company profiles are publicly readable" on company_profiles for select using (true);
create policy "Companies manage own profile" on company_profiles for all using (
  user_id = (select id from profiles where id = auth.uid())
);

-- Job offers: active offers are public
create policy "Active offers are publicly readable" on job_offers for select using (status = 'active');
create policy "Companies manage own offers" on job_offers for all using (
  company_id = (select id from company_profiles where user_id = auth.uid())
);

-- Applications
create policy "Professionals see own applications" on applications for select using (
  professional_id = (select id from professional_profiles where user_id = auth.uid())
);
create policy "Companies see applications to their offers" on applications for select using (
  offer_id in (select id from job_offers where company_id = (select id from company_profiles where user_id = auth.uid()))
);
create policy "Professionals create applications" on applications for insert with check (
  professional_id = (select id from professional_profiles where user_id = auth.uid())
);
create policy "Companies update application status" on applications for update using (
  offer_id in (select id from job_offers where company_id = (select id from company_profiles where user_id = auth.uid()))
);

-- Notifications: users see own
create policy "Users see own notifications" on notifications for all using (user_id = auth.uid());

-- Messages
create policy "Conversation participants see messages" on messages for select using (
  conversation_id in (
    select c.id from conversations c
    join professional_profiles pp on pp.id = c.professional_id
    join company_profiles cp on cp.id = c.company_id
    where pp.user_id = auth.uid() or cp.user_id = auth.uid()
  )
);
create policy "Conversation participants send messages" on messages for insert with check (sender_id = auth.uid());

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- AI matching: find best professionals for an offer
create or replace function match_professionals_for_offer(
  offer_id uuid,
  match_count int default 20
)
returns table (
  professional_id uuid,
  match_score float
)
language sql
as $$
  select
    pp.id as professional_id,
    1 - (pp.profile_embedding <=> jo.offer_embedding) as match_score
  from professional_profiles pp
  cross join job_offers jo
  where jo.id = match_professionals_for_offer.offer_id
    and pp.profile_embedding is not null
    and jo.offer_embedding is not null
    and pp.is_available = true
  order by match_score desc
  limit match_count;
$$;

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger professional_profiles_updated_at before update on professional_profiles for each row execute function update_updated_at();
create trigger company_profiles_updated_at before update on company_profiles for each row execute function update_updated_at();
create trigger job_offers_updated_at before update on job_offers for each row execute function update_updated_at();
create trigger applications_updated_at before update on applications for each row execute function update_updated_at();
