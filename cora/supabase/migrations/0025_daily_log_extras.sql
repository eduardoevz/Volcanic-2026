-- 0025_daily_log_extras.sql
-- Agrega registro de relaciones sexuales y marca explícita de inicio/fin de
-- periodo a daily_logs. period_start/period_end son informativos: los ciclos
-- siguen infiriéndose desde flow_level (detectCycles en cycleEngine.ts, §14);
-- estas columnas solo permiten a la usuaria marcar el borde del periodo
-- cuando el nivel de flujo por sí solo resulta ambiguo.

alter table public.daily_logs
  add column sexual_activity boolean,
  add column period_start boolean not null default false,
  add column period_end boolean not null default false;

-- create or replace no reemplaza esta función: al agregar parámetros nuevos
-- Postgres la trataría como un overload distinto y dejaría la firma vieja de
-- 7 argumentos activa en paralelo, lo que causa ambigüedad en llamadas RPC
-- por nombre. Se elimina explícitamente antes de recrearla.
drop function if exists public.upsert_daily_log(date, flow_level, mood, smallint, numeric, text, jsonb);

create or replace function public.upsert_daily_log(
  p_log_date date,
  p_flow_level flow_level,
  p_mood mood,
  p_energy_level smallint,
  p_sleep_hours numeric,
  p_notes text,
  p_symptoms jsonb default '[]'::jsonb,
  p_sexual_activity boolean default null,
  p_period_start boolean default false,
  p_period_end boolean default false
)
returns uuid
language plpgsql
as $$
declare
  v_log_id uuid;
  v_awarded integer;
begin
  insert into public.daily_logs
    (user_id, log_date, flow_level, mood, energy_level, sleep_hours, notes,
     sexual_activity, period_start, period_end)
  values
    (auth.uid(), p_log_date, p_flow_level, p_mood, p_energy_level, p_sleep_hours, p_notes,
     p_sexual_activity, p_period_start, p_period_end)
  on conflict (user_id, log_date) do update
    set flow_level = excluded.flow_level,
        mood = excluded.mood,
        energy_level = excluded.energy_level,
        sleep_hours = excluded.sleep_hours,
        notes = excluded.notes,
        sexual_activity = excluded.sexual_activity,
        period_start = excluded.period_start,
        period_end = excluded.period_end
  returning id into v_log_id;

  delete from public.daily_log_symptoms where daily_log_id = v_log_id;

  insert into public.daily_log_symptoms (daily_log_id, symptom_id, intensity)
  select v_log_id, (elem ->> 'symptom_id')::uuid, (elem ->> 'intensity')::smallint
  from jsonb_array_elements(p_symptoms) as elem;

  -- Idempotente: registrar el mismo día dos veces no debe otorgar puntos dos
  -- veces (mismo patrón que complete_onboarding en 0005).
  insert into public.mascot_events (user_id, action_type, points, dedupe_key)
  values (auth.uid(), 'daily_log', 10, 'daily_log:' || p_log_date::text)
  on conflict (user_id, dedupe_key) do nothing;

  get diagnostics v_awarded = row_count;

  if v_awarded > 0 then
    update public.mascot_state
    set points = points + 10
    where user_id = auth.uid();
  end if;

  return v_log_id;
end;
$$;

grant execute on function public.upsert_daily_log(
  date, flow_level, mood, smallint, numeric, text, jsonb, boolean, boolean, boolean
) to authenticated;
