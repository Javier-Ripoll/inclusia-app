-- ============================================================
-- INCLUSIA – MIGRACIÓN 01: Extensiones + ENUMs + Tablas base
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ENUMs
create type user_role as enum ('professional', 'company', 'admin');
create type professional_plan as enum ('free', 'premium');
create type company_plan as enum ('basic', 'pro', 'premium');
create type offer_type as enum ('standard', 'urgent', 'substitute');
create type offer_status as enum ('active', 'covered', 'cancelled', 'expired');
create type application_status as enum ('pending', 'reviewed', 'accepted', 'rejected');
create type subscription_status as enum ('active', 'cancelled', 'past_due', 'trialing');
create type availability_type as enum ('full_time', 'part_time', 'mornings', 'afternoons', 'weekends', 'on_call');

-- PROFILES (extiende auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text,
  phone text,
  avatar_url text,
  city text,
  province text,
  postal_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFESSIONAL PROFILES
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
  featured_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFESSIONAL EDUCATION
create table professional_education (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid references professional_profiles(id) on delete cascade,
  degree text not null,
  institution text,
  year_completed int,
  certified boolean default false,
  created_at timestamptz default now()
);

-- PROFESSIONAL EXPERIENCE
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

-- COMPANY PROFILES
create table company_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references profiles(id) on delete cascade,
  plan company_plan default 'basic',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status subscription_status,
  company_name text not null,
  company_type text,
  cif text,
  website text,
  description text,
  logo_url text,
  verified boolean default false,
  parent_company_id uuid references company_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- JOB OFFERS
create table job_offers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  offer_type offer_type default 'standard',
  status offer_status default 'active',
  city text,
  province text,
  postal_code text,
  required_specializations text[] default '{}',
  required_experience_years int default 0,
  required_education text,
  availability_needed availability_type[],
  contract_type text,
  salary_min numeric,
  salary_max numeric,
  schedule text,
  is_urgent boolean default false,
  start_date date,
  end_date date,
  views_count int default 0,
  applications_count int default 0,
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- APPLICATIONS
create table applications (
  id uuid primary key default uuid_generate_v4(),
  offer_id uuid references job_offers(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  status application_status default 'pending',
  cover_letter text,
  match_score numeric,
  viewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(offer_id, professional_id)
);

-- COMPANY FAVORITES
create table company_favorites (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  notes text,
  created_at timestamptz default now(),
  unique(company_id, professional_id)
);

-- HIRING HISTORY
create table hiring_history (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  offer_id uuid references job_offers(id),
  hired_at timestamptz default now(),
  notes text
);

-- CONVERSATIONS (chat)
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company_profiles(id) on delete cascade,
  professional_id uuid references professional_profiles(id) on delete cascade,
  offer_id uuid references job_offers(id),
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(company_id, professional_id, offer_id)
);

-- MESSAGES
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- INDEXES
create index on job_offers(status, is_urgent, created_at desc);
create index on job_offers(company_id, status);
create index on applications(professional_id, status);
create index on applications(offer_id, status);
create index on notifications(user_id, read, created_at desc);
create index on messages(conversation_id, created_at);
