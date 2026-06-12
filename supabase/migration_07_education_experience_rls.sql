-- ============================================================
-- RLS policies for professional_education and professional_experience
-- ============================================================

alter table professional_education enable row level security;
alter table professional_experience enable row level security;

-- ---- professional_education ----

-- Owner can read their own
create policy "education_select_own"
  on professional_education for select
  using (
    professional_id in (
      select id from professional_profiles where user_id = auth.uid()
    )
  );

-- Public can read all (for /profesionales/[id] profile pages)
create policy "education_select_public"
  on professional_education for select
  using (true);

-- Owner can insert
create policy "education_insert_own"
  on professional_education for insert
  with check (
    professional_id in (
      select id from professional_profiles where user_id = auth.uid()
    )
  );

-- Owner can delete
create policy "education_delete_own"
  on professional_education for delete
  using (
    professional_id in (
      select id from professional_profiles where user_id = auth.uid()
    )
  );

-- ---- professional_experience ----

create policy "experience_select_public"
  on professional_experience for select
  using (true);

create policy "experience_insert_own"
  on professional_experience for insert
  with check (
    professional_id in (
      select id from professional_profiles where user_id = auth.uid()
    )
  );

create policy "experience_delete_own"
  on professional_experience for delete
  using (
    professional_id in (
      select id from professional_profiles where user_id = auth.uid()
    )
  );
