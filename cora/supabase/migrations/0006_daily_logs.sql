-- 0006_daily_logs.sql
-- Fase 4: seguimiento diario, síntomas, ciclos + RPC de guardado idempotente.
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §8, §14, §20 (Fase 4).

-- ── Catálogo público de síntomas ─────────────────────────────────────────────

create table public.symptom_catalog (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label_es text not null,
  category symptom_category not null,
  applicable_stages life_stage[] not null,
  icon text,
  sort_order smallint not null default 0,
  is_active boolean not null default true
);

alter table public.symptom_catalog enable row level security;

create policy "public_read_active" on public.symptom_catalog
  for select using (is_active = true);

grant select on public.symptom_catalog to anon, authenticated;

-- ── daily_logs — tabla raíz del seguimiento ─────────────────────────────────

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  flow_level flow_level,
  mood mood,
  energy_level smallint check (energy_level between 1 and 5),
  sleep_hours numeric(3, 1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index on public.daily_logs (user_id, log_date desc);

alter table public.daily_logs enable row level security;

create policy "own_select" on public.daily_logs
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.daily_logs
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.daily_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.daily_logs
  for delete using (auth.uid() = user_id);

create trigger set_daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.daily_logs to authenticated;

-- ── daily_log_symptoms — puente N:M con intensidad ──────────────────────────

create table public.daily_log_symptoms (
  daily_log_id uuid not null references public.daily_logs (id) on delete cascade,
  symptom_id uuid not null references public.symptom_catalog (id),
  intensity smallint not null check (intensity between 1 and 3),
  primary key (daily_log_id, symptom_id)
);

alter table public.daily_log_symptoms enable row level security;

-- No tiene user_id propio: la propiedad se verifica a través de daily_logs.
create policy "own_select" on public.daily_log_symptoms
  for select using (
    exists (
      select 1 from public.daily_logs
      where daily_logs.id = daily_log_symptoms.daily_log_id
        and daily_logs.user_id = auth.uid()
    )
  );
create policy "own_insert" on public.daily_log_symptoms
  for insert with check (
    exists (
      select 1 from public.daily_logs
      where daily_logs.id = daily_log_symptoms.daily_log_id
        and daily_logs.user_id = auth.uid()
    )
  );
create policy "own_delete" on public.daily_log_symptoms
  for delete using (
    exists (
      select 1 from public.daily_logs
      where daily_logs.id = daily_log_symptoms.daily_log_id
        and daily_logs.user_id = auth.uid()
    )
  );

grant select, insert, delete on public.daily_log_symptoms to authenticated;

-- ── cycles — tabla derivada, se reescribe entera desde el cliente ──────────
-- Solo se guardan filas con is_predicted = false; la predicción es efímera
-- (predictNext() en cycleEngine.ts) y nunca se persiste como fila.

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date,
  period_length smallint,
  cycle_length smallint,
  is_predicted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, start_date)
);

create index on public.cycles (user_id, start_date desc);

alter table public.cycles enable row level security;

create policy "own_select" on public.cycles
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.cycles
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.cycles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.cycles
  for delete using (auth.uid() = user_id);

create trigger set_cycles_updated_at
  before update on public.cycles
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.cycles to authenticated;

-- ── RPC: guardar el registro diario de forma idempotente ────────────────────

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
  v_awarded integer;
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

grant execute on function public.upsert_daily_log(date, flow_level, mood, smallint, numeric, text, jsonb)
  to authenticated;
