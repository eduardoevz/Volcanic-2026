-- 0002_profiles.sql
-- Fase 2: identidad y perfil (profiles, user_preferences, consents, life_stage_history,
-- mascot_state, avatars) + RLS + trigger de creación automática de perfil.
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §7-8-9.

-- ── Catálogo público ─────────────────────────────────────────────────────────

create table public.avatars (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_es text not null,
  species_scientific text,
  habitat_es text,
  fun_fact_es text,
  conservation_status text,
  image_path text,
  sort_order smallint not null default 0,
  is_active boolean not null default true
);

alter table public.avatars enable row level security;

create policy "public_read_active" on public.avatars
  for select using (is_active = true);

-- ── Identidad y perfil ───────────────────────────────────────────────────────

-- Nota: life_stage es NULLABLE aquí a propósito, aunque el diseño de datos del §8
-- lo describe como NOT NULL. El trigger on_auth_user_created crea la fila de
-- profiles en el mismo instante del registro, antes de que exista el onboarding
-- (Fase 3) donde la usuaria recién elige su etapa. El gate de navegación usa
-- onboarding_completed_at, no life_stage, así que esto no afecta el flujo real.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birth_year smallint check (birth_year between 1920 and 2020),
  life_stage life_stage,
  avatar_id uuid references public.avatars (id),
  locale text not null default 'es',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.profiles enable row level security;

create policy "own_select" on public.profiles
  for select using (auth.uid() = id);
create policy "own_insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "own_delete" on public.profiles
  for delete using (auth.uid() = id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Historial de etapa de vida ───────────────────────────────────────────────

create table public.life_stage_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stage life_stage not null,
  started_on date not null default current_date,
  ended_on date,
  created_at timestamptz not null default now()
);

create index on public.life_stage_history (user_id, started_on desc);

alter table public.life_stage_history enable row level security;

create policy "own_select" on public.life_stage_history
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.life_stage_history
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.life_stage_history
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.life_stage_history
  for delete using (auth.uid() = user_id);

-- ── Preferencias ─────────────────────────────────────────────────────────────

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  notifications_enabled boolean not null default true,
  reminder_time time,
  ai_share_health_context boolean not null default false,
  week_starts_on smallint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "own_select" on public.user_preferences
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.user_preferences
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.user_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.user_preferences
  for delete using (auth.uid() = user_id);

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ── Consentimientos ──────────────────────────────────────────────────────────

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  consent_type text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, consent_type, version)
);

alter table public.consents enable row level security;

create policy "own_select" on public.consents
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.consents
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.consents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.consents
  for delete using (auth.uid() = user_id);

-- ── Mascota (solo el estado; la evolución real es Fase 6) ───────────────────

create table public.mascot_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  level smallint not null default 1 check (level between 1 and 5),
  points integer not null default 0,
  stage_variant life_stage,
  last_evolved_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.mascot_state enable row level security;

create policy "own_select" on public.mascot_state
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.mascot_state
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.mascot_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.mascot_state
  for delete using (auth.uid() = user_id);

create trigger set_mascot_state_updated_at
  before update on public.mascot_state
  for each row execute function public.set_updated_at();

-- ── Trigger: crear profile + user_preferences + mascot_state al registrarse ──

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);
  insert into public.mascot_state (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
