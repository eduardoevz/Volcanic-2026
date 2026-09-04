-- Fase 24 — CORA-13x. "Mini expediente médico" opcional, capturado en el
-- onboarding (paso saltable) y editable después desde Perfil. 1:1 con
-- profiles, mismo espíritu que pregnancies/user_preferences. Todos los
-- campos son texto libre y nullable a propósito: la usuaria puede no
-- completar nada, y no se inserta una fila vacía por default — solo existe
-- fila cuando la usuaria guardó algo.

create table public.medical_background (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  allergies text,
  family_history text,
  chronic_conditions text,
  current_medications text,
  blood_type text check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  updated_at timestamptz not null default now()
);

create trigger set_medical_background_updated_at
  before update on public.medical_background
  for each row execute function public.set_updated_at();

alter table public.medical_background enable row level security;

-- Patrón A — privado por usuaria, mismo criterio que pregnancies/daily_logs.
create policy own_select on public.medical_background
  for select using (auth.uid() = user_id);

create policy own_insert on public.medical_background
  for insert with check (auth.uid() = user_id);

create policy own_update on public.medical_background
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy own_delete on public.medical_background
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.medical_background to authenticated;
