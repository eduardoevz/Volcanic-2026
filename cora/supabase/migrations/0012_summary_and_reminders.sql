-- 0012_summary_and_reminders.sql
-- Fase 8: resumen médico compartible + recordatorios locales.
-- Ver docs/PLAN_DE_IMPLEMENTACION.md "Fase 8 — Funciones complementarias".

-- ── medical_summaries — foto fija e inmutable de un resumen ya calculado ────
-- payload guarda el resumen completo ya calculado en el cliente (rango,
-- ciclos, síntomas frecuentes, ánimo predominante) para que quede
-- reproducible aunque la usuaria edite sus logs después. Insert+select
-- únicamente, mismo patrón que ai_messages en 0011.

create table public.medical_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  payload jsonb not null,
  generated_at timestamptz not null default now()
);

create index on public.medical_summaries (user_id, generated_at desc);

alter table public.medical_summaries enable row level security;

create policy "own_select" on public.medical_summaries
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.medical_summaries
  for insert with check (auth.uid() = user_id);

grant select, insert on public.medical_summaries to authenticated;

-- ── reminders — CRUD completo, notificaciones locales ───────────────────────
-- notification_identifier guarda el id devuelto por expo-notifications para
-- poder cancelar/reprogramar la notificación local al editar o desactivar.

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  hour smallint not null check (hour between 0 and 23),
  minute smallint not null check (minute between 0 and 59),
  is_active boolean not null default true,
  notification_identifier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.reminders (user_id, created_at desc);

alter table public.reminders enable row level security;

create policy "own_select" on public.reminders
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.reminders
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.reminders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.reminders
  for delete using (auth.uid() = user_id);

create trigger set_reminders_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.reminders to authenticated;
