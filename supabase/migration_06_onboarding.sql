-- Track whether a user has completed onboarding
alter table profiles
  add column if not exists onboarding_completed boolean default false;

-- Mark existing users as already onboarded so they don't get redirected
update profiles set onboarding_completed = true where created_at < now();
