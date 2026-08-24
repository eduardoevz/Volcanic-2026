-- 0005_mascot_events_and_rpcs.sql
-- Fase 3: tabla de eventos de mascota (faltaba del §8) + RPCs de onboarding.

create table public.mascot_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  action_type text not null,
  points smallint not null,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

alter table public.mascot_events enable row level security;

create policy "own_select" on public.mascot_events
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.mascot_events
  for insert with check (auth.uid() = user_id);

grant select, insert on public.mascot_events to authenticated;

-- ── RPC: cambiar de etapa de vida ────────────────────────────────────────────
-- security invoker (default): se apoya en las políticas RLS de profiles y
-- life_stage_history sobre auth.uid(), no necesita privilegios elevados.
create or replace function public.set_life_stage(new_stage life_stage)
returns void
language plpgsql
as $$
begin
  update public.life_stage_history
  set ended_on = current_date
  where user_id = auth.uid() and ended_on is null;

  insert into public.life_stage_history (user_id, stage, started_on)
  values (auth.uid(), new_stage, current_date);

  update public.profiles
  set life_stage = new_stage
  where id = auth.uid();
end;
$$;

grant execute on function public.set_life_stage(life_stage) to authenticated;

-- ── RPC: completar el onboarding ─────────────────────────────────────────────
create or replace function public.complete_onboarding(
  p_notifications_enabled boolean,
  p_ai_share_health_context boolean,
  p_consent_version text
)
returns void
language plpgsql
as $$
declare
  v_awarded integer;
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

  -- Solo suma puntos si el evento no existía todavía (dedupe_key evita
  -- otorgarlos dos veces si esta función se reintenta).
  insert into public.mascot_events (user_id, action_type, points, dedupe_key)
  values (auth.uid(), 'onboarding_completed', 15, 'onboarding_completed')
  on conflict (user_id, dedupe_key) do nothing;

  get diagnostics v_awarded = row_count;

  if v_awarded > 0 then
    update public.mascot_state
    set points = points + 15
    where user_id = auth.uid();
  end if;
end;
$$;

grant execute on function public.complete_onboarding(boolean, boolean, text) to authenticated;
