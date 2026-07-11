-- ============================================================
-- INCLUSIA – MIGRACIÓN 03: Triggers de notificaciones
-- ============================================================

-- Cuando un profesional aplica a una oferta → notificar a la empresa
create or replace function notify_new_application()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  offer_title text;
  company_user_id uuid;
  professional_name text;
begin
  -- Obtener título de la oferta y user_id de la empresa
  select jo.title, cp.user_id
  into offer_title, company_user_id
  from job_offers jo
  join company_profiles cp on cp.id = jo.company_id
  where jo.id = new.offer_id;

  -- Obtener nombre del profesional
  select p.full_name into professional_name
  from professional_profiles pp
  join profiles p on p.id = pp.user_id
  where pp.id = new.professional_id;

  -- Crear notificación para la empresa
  insert into notifications (user_id, type, title, body, data)
  values (
    company_user_id,
    'new_application',
    'Nueva candidatura recibida',
    coalesce(professional_name, 'Un profesional') || ' ha aplicado a "' || coalesce(offer_title, 'tu oferta') || '"',
    jsonb_build_object('offer_id', new.offer_id, 'application_id', new.id, 'href', '/dashboard/ofertas/' || new.offer_id)
  );

  return new;
end;
$$;

create trigger on_new_application
  after insert on applications
  for each row execute function notify_new_application();

-- Cuando la empresa actualiza el estado de una candidatura → notificar al profesional
create or replace function notify_application_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  professional_user_id uuid;
  offer_title text;
  notif_title text;
  notif_body text;
begin
  -- Solo notificar si el estado cambia
  if old.status = new.status then return new; end if;
  -- No notificar si vuelve a pending
  if new.status = 'pending' then return new; end if;

  -- Obtener user_id del profesional y título de la oferta
  select pp.user_id, jo.title
  into professional_user_id, offer_title
  from professional_profiles pp
  cross join job_offers jo
  where pp.id = new.professional_id and jo.id = new.offer_id;

  -- Mensaje según estado
  if new.status = 'accepted' then
    notif_title := '¡Candidatura aceptada! 🎉';
    notif_body := 'El centro ha aceptado tu candidatura para "' || coalesce(offer_title, 'la oferta') || '"';
  elsif new.status = 'rejected' then
    notif_title := 'Candidatura no seleccionada';
    notif_body := 'Tu candidatura para "' || coalesce(offer_title, 'la oferta') || '" no ha sido seleccionada esta vez';
  elsif new.status = 'reviewed' then
    notif_title := 'Tu candidatura está siendo revisada';
    notif_body := 'El centro está revisando tu candidatura para "' || coalesce(offer_title, 'la oferta') || '"';
  end if;

  insert into notifications (user_id, type, title, body, data)
  values (
    professional_user_id,
    'application_update',
    notif_title,
    notif_body,
    jsonb_build_object('offer_id', new.offer_id, 'status', new.status, 'href', '/ofertas/' || new.offer_id)
  );

  return new;
end;
$$;

create trigger on_application_status_change
  after update on applications
  for each row execute function notify_application_status_change();

-- Cuando se publica una oferta urgente → notificar a profesionales disponibles en la misma provincia
create or replace function notify_urgent_offer()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  prof_record record;
begin
  -- Solo para ofertas urgentes nuevas
  if new.is_urgent = false then return new; end if;
  if tg_op = 'UPDATE' and old.is_urgent = true then return new; end if;

  -- Notificar a profesionales disponibles (premium primero, luego free)
  for prof_record in
    select pp.user_id
    from professional_profiles pp
    join profiles p on p.id = pp.user_id
    where pp.is_available = true
      and (p.province = new.province or p.city = new.city or new.province is null)
    order by
      case when pp.plan = 'premium' then 0 else 1 end,
      pp.available_immediately desc
    limit 50
  loop
    insert into notifications (user_id, type, title, body, data)
    values (
      prof_record.user_id,
      'urgent_offer',
      '🚨 Oferta urgente en tu zona',
      new.title || (case when new.city is not null then ' · ' || new.city else '' end),
      jsonb_build_object('offer_id', new.id, 'href', '/ofertas/' || new.id)
    );
  end loop;

  return new;
end;
$$;

create trigger on_urgent_offer
  after insert or update on job_offers
  for each row execute function notify_urgent_offer();

-- Habilitar Realtime para la tabla notifications
alter publication supabase_realtime add table notifications;
