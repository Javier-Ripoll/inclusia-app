-- ============================================================
-- INCLUSIA – MIGRACIÓN 04: Chat en tiempo real
-- ============================================================

-- RLS para conversations
create policy "Conversation participants see own conversations"
  on conversations for select
  using (
    company_id in (select id from company_profiles where user_id = auth.uid())
    or
    professional_id in (select id from professional_profiles where user_id = auth.uid())
  );

create policy "Companies create conversations"
  on conversations for insert
  with check (
    company_id in (select id from company_profiles where user_id = auth.uid())
  );

create policy "Update last_message_at"
  on conversations for update
  using (
    company_id in (select id from company_profiles where user_id = auth.uid())
    or
    professional_id in (select id from professional_profiles where user_id = auth.uid())
  );

-- Habilitar Realtime para messages y conversations
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
