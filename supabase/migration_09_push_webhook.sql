-- ============================================================
-- INCLUSIA – MIGRACIÓN 09: Webhook de push notifications
-- ============================================================
-- Dispara la Edge Function send-push-notification cada vez que se inserta
-- una fila en `notifications`, usando pg_net directamente (en vez del
-- helper de Database Webhooks del Dashboard, que requiere el schema
-- supabase_functions ya inicializado — no lo estaba en este proyecto).

create extension if not exists pg_net;

create or replace function public.notify_push_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://yhpofgoaijopclicdeth.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := jsonb_build_object('type', 'INSERT', 'table', 'notifications', 'record', row_to_json(new))
  );
  return new;
end;
$$;

create trigger push_on_new_notification
  after insert on notifications
  for each row execute function public.notify_push_on_insert();
