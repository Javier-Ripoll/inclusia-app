-- Stripe fields on professional_profiles
alter table professional_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

-- Stripe fields on company_profiles
alter table company_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;
