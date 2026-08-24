-- 0010_mascot_leveling.sql
-- Fase 6: la mascota sube de nivel de verdad. Hasta esta migración, las tres
-- RPCs que otorgan puntos (complete_onboarding, upsert_daily_log,
-- mark_article_read) solo sumaban mascot_state.points pero nunca recalculaban
-- mascot_state.level — quedaba fijo en 1 para siempre. Tampoco existía un
-- tope diario de puntos (§16 del plan pide 30/día).
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §16, §20 (Fase 6).

-- ── level_for_points — espejo server-side de los 5 umbrales de §16 ─────────

create or replace function public.level_for_points(p_points integer)
returns smallint
language sql
immutable
as $$
  select case
    when p_points >= 280 then 5
    when p_points >= 140 then 4
    when p_points >= 60 then 3
    when p_points >= 20 then 2
    else 1
  end;
$$;

grant execute on function public.level_for_points(integer) to authenticated, anon;

-- ── award_mascot_points — RPC genérica: idempotencia + tope diario + nivel ─
-- Reemplaza la lógica duplicada que vivía inline en las 3 RPCs de fases
-- anteriores (0005, 0006, 0008). security definer porque necesita actualizar
-- mascot_state de forma consistente aunque las funciones que la llaman
-- corran con privilegios de invoker; sigue usando auth.uid(), nunca un
-- user_id recibido por parámetro.

create or replace function public.award_mascot_points(
  p_action text,
  p_points smallint,
  p_dedupe_key text
)
returns public.mascot_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_awarded integer;
  v_today_points integer;
  v_capped_points integer;
  v_state public.mascot_state;
begin
  -- 1. Idempotencia: si el dedupe_key ya existe, no se otorga nada de nuevo.
  insert into public.mascot_events (user_id, action_type, points, dedupe_key)
  values (auth.uid(), p_action, p_points, p_dedupe_key)
  on conflict (user_id, dedupe_key) do nothing;

  get diagnostics v_awarded = row_count;

  if v_awarded = 0 then
    select * into v_state from public.mascot_state where user_id = auth.uid();
    return v_state;
  end if;

  -- 2. Tope diario de 30 puntos. El evento ya quedó registrado tal cual (para
  -- que no se reintente), pero lo que se suma a mascot_state.points se
  -- recorta para no superar 30 puntos acumulados en el día.
  select coalesce(sum(points), 0) into v_today_points
  from public.mascot_events
  where user_id = auth.uid() and created_at::date = current_date;

  v_capped_points := greatest(0, least(p_points, 30 - (v_today_points - p_points)));

  -- 3. Nivel recalculado, nunca decrece. last_evolved_at solo cambia si el
  -- nivel efectivamente sube.
  update public.mascot_state
  set points = points + v_capped_points,
      level = greatest(level, public.level_for_points(points + v_capped_points)),
      last_evolved_at = case
        when public.level_for_points(points + v_capped_points) > level then now()
        else last_evolved_at
      end,
      updated_at = now()
  where user_id = auth.uid()
  returning * into v_state;

  return v_state;
end;
$$;

grant execute on function public.award_mascot_points(text, smallint, text) to authenticated;

-- ── Backfill: recalcula el nivel de toda cuenta creada antes de esta
-- migración a partir de sus puntos ya acumulados (el bug las afectaba a
-- todas por igual).

update public.mascot_state
set level = public.level_for_points(points)
where level < public.level_for_points(points);

-- ── Las 3 RPCs existentes pasan a delegar en award_mascot_points en vez de
-- duplicar el insert/update. No se editan los archivos 0005/0006/0008
-- (regla de docs/CONVENCIONES.md); se reemplaza la función aquí.

create or replace function public.complete_onboarding(
  p_notifications_enabled boolean,
  p_ai_share_health_context boolean,
  p_consent_version text
)
returns void
language plpgsql
as $$
begin
  update public.user_preferences
  set notifications_enabled = p_notifications_enabled,
      ai_share_health_context = p_ai_share_health_context
  where user_id = auth.uid();

  insert into public.consents (user_id, consent_type, version)
  values (auth.uid(), 'onboarding', p_consent_version)
  on conflict (user_id, consent_type, version) do nothing;

  update public.profiles
  set onboarding_completed_at = now()
  where id = auth.uid();

  perform public.award_mascot_points('onboarding_completed', 15::smallint, 'onboarding_completed');
end;
$$;

grant execute on function public.complete_onboarding(boolean, boolean, text) to authenticated;

create or replace function public.upsert_daily_log(
  p_log_date date,
  p_flow_level flow_level,
  p_mood mood,
  p_energy_level smallint,
  p_sleep_hours numeric,
  p_notes text,
  p_symptoms jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_log_id uuid;
begin
  insert into public.daily_logs
    (user_id, log_date, flow_level, mood, energy_level, sleep_hours, notes)
  values
    (auth.uid(), p_log_date, p_flow_level, p_mood, p_energy_level, p_sleep_hours, p_notes)
  on conflict (user_id, log_date) do update
    set flow_level = excluded.flow_level,
        mood = excluded.mood,
        energy_level = excluded.energy_level,
        sleep_hours = excluded.sleep_hours,
        notes = excluded.notes
  returning id into v_log_id;

  delete from public.daily_log_symptoms where daily_log_id = v_log_id;

  insert into public.daily_log_symptoms (daily_log_id, symptom_id, intensity)
  select v_log_id, (elem ->> 'symptom_id')::uuid, (elem ->> 'intensity')::smallint
  from jsonb_array_elements(p_symptoms) as elem;

  perform public.award_mascot_points('daily_log', 10::smallint, 'daily_log:' || p_log_date::text);

  return v_log_id;
end;
$$;

grant execute on function public.upsert_daily_log(date, flow_level, mood, smallint, numeric, text, jsonb)
  to authenticated;

create or replace function public.mark_article_read(p_article_id uuid)
returns void
language plpgsql
as $$
begin
  perform public.award_mascot_points('article_read', 5::smallint, 'article_read:' || p_article_id::text);
end;
$$;

grant execute on function public.mark_article_read(uuid) to authenticated;
