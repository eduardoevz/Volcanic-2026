-- 0015_family_circle.sql
-- Fase 15: círculo de acompañamiento familiar con permisos granulares.
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §8, §29 (Fase 15). Esta es la primera
-- RLS del proyecto que permite leer datos de OTRA usuaria: sin una fila
-- activa en family_share_grants, un familiar no ve absolutamente nada — el
-- acceso nunca es implícito.

-- ── family_circle_members ────────────────────────────────────────────────

create table public.family_circle_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  member_user_id uuid references public.profiles (id) on delete cascade,
  invite_email text not null,
  owner_display_name text not null,
  relationship text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index on public.family_circle_members (owner_id);
create index on public.family_circle_members (member_user_id) where member_user_id is not null;

-- Parcial: permite reinvitar el mismo correo después de revocar (no choca
-- con filas ya revocadas).
create unique index family_circle_members_owner_email_uq
  on public.family_circle_members (owner_id, lower(invite_email))
  where status in ('pending', 'accepted');

alter table public.family_circle_members enable row level security;

create policy "owner_select" on public.family_circle_members
  for select using (owner_id = auth.uid());
create policy "member_select" on public.family_circle_members
  for select using (member_user_id = auth.uid());

create policy "owner_insert" on public.family_circle_members
  for insert with check (owner_id = auth.uid() and status = 'pending' and member_user_id is null);

-- El owner administra su fila pero NUNCA puede auto-aceptar directamente
-- (status='accepted' solo lo escribe accept_family_invite, más abajo).
create policy "owner_update" on public.family_circle_members
  for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and status <> 'accepted');

grant select, insert, update on public.family_circle_members to authenticated;
-- Sin grant de delete ni política de update para member_user_id a propósito:
-- "salir del círculo" pasa por leave_family_circle() (RPC), nunca por una
-- política de update directa para el miembro. Una política con with check
-- acotado solo a (member_user_id, status) no fijaría qué OTRAS columnas
-- cambian en la misma sentencia (owner_id, invite_email,
-- owner_display_name quedarían sin pin) — la misma trampa que
-- docs/CONVENCIONES.md ya señala sobre with check en update.

-- ── family_share_grants ──────────────────────────────────────────────────

create table public.family_share_grants (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.family_circle_members (id) on delete cascade,
  scope public.share_scope not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (membership_id, scope)
);

create index on public.family_share_grants (membership_id);

alter table public.family_share_grants enable row level security;

create policy "owner_select" on public.family_share_grants
  for select using (
    exists (select 1 from public.family_circle_members m where m.id = membership_id and m.owner_id = auth.uid())
  );
create policy "member_select" on public.family_share_grants
  for select using (
    exists (select 1 from public.family_circle_members m where m.id = membership_id and m.member_user_id = auth.uid())
  );
create policy "owner_insert" on public.family_share_grants
  for insert with check (
    exists (
      select 1 from public.family_circle_members m
      where m.id = membership_id and m.owner_id = auth.uid() and m.status = 'accepted'
    )
  );
create policy "owner_update" on public.family_share_grants
  for update using (
    exists (select 1 from public.family_circle_members m where m.id = membership_id and m.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.family_circle_members m where m.id = membership_id and m.owner_id = auth.uid())
  );

grant select, insert, update on public.family_share_grants to authenticated;

-- ── RPCs de transición de estado (security definer, search_path fijo) ─────

create or replace function public.accept_family_invite(p_membership_id uuid)
returns public.family_circle_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.family_circle_members;
  v_email text := auth.jwt() ->> 'email';
begin
  if v_email is null then
    raise exception 'No autenticado';
  end if;

  update public.family_circle_members
  set member_user_id = auth.uid(),
      status = 'accepted',
      accepted_at = now()
  where id = p_membership_id
    and status = 'pending'
    and lower(invite_email) = lower(v_email)
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Invitación no válida, ya usada, o no coincide con tu correo';
  end if;

  return v_row;
end;
$$;

grant execute on function public.accept_family_invite(uuid) to authenticated;

create or replace function public.leave_family_circle(p_membership_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.family_circle_members
  set status = 'revoked'
  where id = p_membership_id
    and member_user_id = auth.uid()
    and status = 'accepted';
end;
$$;

grant execute on function public.leave_family_circle(uuid) to authenticated;

-- ── has_active_grant — función reusable ──────────────────────────────────

create or replace function public.has_active_grant(
  p_owner_id uuid,
  p_viewer_id uuid,
  p_scope public.share_scope
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_circle_members m
    join public.family_share_grants g on g.membership_id = m.id
    where m.owner_id = p_owner_id
      and m.member_user_id = p_viewer_id
      and m.status = 'accepted'
      and g.scope = p_scope
      and g.revoked_at is null
  );
$$;

grant execute on function public.has_active_grant(uuid, uuid, public.share_scope) to authenticated;

-- ── Políticas aditivas sobre cycles/reminders (no tocan las own_* existentes) ─

create policy "family_shared_select" on public.cycles
  for select using (public.has_active_grant(user_id, auth.uid(), 'cycle_dates'));

create policy "family_shared_select" on public.reminders
  for select using (public.has_active_grant(user_id, auth.uid(), 'reminders'));

-- ── mood_summary — agregado vía RPC, nunca lectura directa de daily_logs ──

create or replace function public.get_family_mood_summary(
  p_owner_id uuid,
  p_days integer default 30
)
returns table (mood public.mood, day_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select mood, count(*)::integer as day_count
  from public.daily_logs
  where user_id = p_owner_id
    and mood is not null
    and log_date >= (current_date - p_days)
    and public.has_active_grant(p_owner_id, auth.uid(), 'mood_summary')
  group by mood
  order by day_count desc, mood;
$$;

grant execute on function public.get_family_mood_summary(uuid, integer) to authenticated;
