-- 0016_pregnancy_and_appointments.sql
-- Fase 16: seguimiento de embarazo (pregnancies) + agenda de citas médicas
-- (appointments). Ver docs/PLAN_DE_IMPLEMENTACION.md §8, §29 (Fase 16).
-- appointments reactiva el scope 'appointments' de family_share_grants,
-- que quedó excluido a propósito en Fase 15 por no existir esta tabla.

-- ── pregnancies — RLS patrón A, mismo estilo que cycles ─────────────────────

create table public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lmp_date date not null,
  due_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'ended')),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.pregnancies (user_id, status);

alter table public.pregnancies enable row level security;

create policy "own_select" on public.pregnancies
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.pregnancies
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.pregnancies
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.pregnancies
  for delete using (auth.uid() = user_id);

create trigger set_pregnancies_updated_at
  before update on public.pregnancies
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.pregnancies to authenticated;

-- ── appointments — RLS patrón A + patrón C (grant familiar) ────────────────

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  specialist_name text,
  location text,
  scheduled_at timestamptz not null,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notification_identifier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.appointments (user_id, scheduled_at);

alter table public.appointments enable row level security;

create policy "own_select" on public.appointments
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.appointments
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.appointments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.appointments
  for delete using (auth.uid() = user_id);

-- Reactiva el scope 'appointments' definido en share_scope desde 0001_init.sql.
-- has_active_grant ya existe desde 0015_family_circle.sql, se reusa sin cambios.
create policy "family_shared_select" on public.appointments
  for select using (public.has_active_grant(user_id, auth.uid(), 'appointments'));

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.appointments to authenticated;
