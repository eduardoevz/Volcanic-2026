-- 0026_family_scopes_redesign.sql
-- Rediseña los scopes del círculo familiar: de acceso RLS directo a tablas
-- crudas (cycle_dates, reminders, appointments-con-notas) a señales agregadas
-- con un propósito explícito, siguiendo el patrón ya usado por mood_summary
-- (RPC security definer, nunca lectura directa). Motivo: un experto señaló
-- que compartir fechas exactas de periodo o notas clínicas con la familia
-- (especialmente una pareja) no tiene un "para qué" claro y puede sentirse
-- como vigilancia. Ver docs/PLAN_DE_IMPLEMENTACION.md §8 y docs/RLS_AUDIT.md
-- — esta sigue siendo la RLS de mayor riesgo del proyecto.
--
-- Seguro de aplicar sin migración de datos: family_circle_members y
-- family_share_grants están en 0 filas en producción a la fecha de esta
-- migración (feature sin usuarias reales todavía).

-- ── 1. Quitar primero todo lo que depende del tipo share_scope ─────────────
-- (las 3 políticas RLS crudas y la función has_active_grant, que se
-- recrea más abajo ya apuntando al tipo nuevo).

drop policy "family_shared_select" on public.cycles;
drop policy "family_shared_select" on public.reminders;
drop policy "family_shared_select" on public.appointments;
drop function public.has_active_grant(uuid, uuid, public.share_scope);

-- ── 2. Recrear el enum share_scope con los 3 valores nuevos ────────────────

create type public.share_scope_v2 as enum ('mood_summary', 'care_alert', 'next_appointment');

alter table public.family_share_grants
  alter column scope type public.share_scope_v2
  using scope::text::public.share_scope_v2;

drop type public.share_scope;
alter type public.share_scope_v2 rename to share_scope;

-- ── 3. Recrear has_active_grant (misma lógica, ahora sobre el tipo nuevo) ──

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

-- ── 4. care_alert — booleano de "hoy", nunca dice cuál fue la señal ─────────

create or replace function public.get_family_care_alert(p_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_grant(p_owner_id, auth.uid(), 'care_alert')
    and exists (
      select 1
      from public.daily_logs dl
      where dl.user_id = p_owner_id
        and dl.log_date = current_date
        and (
          (dl.flow_level is not null and dl.flow_level <> 'none')
          or dl.mood in ('low', 'difficult')
          or exists (
            select 1
            from public.daily_log_symptoms dls
            where dls.daily_log_id = dl.id and dls.intensity >= 2
          )
        )
    );
$$;

grant execute on function public.get_family_care_alert(uuid) to authenticated;

-- ── 5. next_appointment — solo la fecha, sin título/especialista/notas ─────

create or replace function public.get_family_next_appointment(p_owner_id uuid)
returns date
language sql
stable
security definer
set search_path = public
as $$
  select a.scheduled_at::date
  from public.appointments a
  where a.user_id = p_owner_id
    and a.status = 'scheduled'
    and a.scheduled_at >= now()
    and public.has_active_grant(p_owner_id, auth.uid(), 'next_appointment')
  order by a.scheduled_at asc
  limit 1;
$$;

grant execute on function public.get_family_next_appointment(uuid) to authenticated;
