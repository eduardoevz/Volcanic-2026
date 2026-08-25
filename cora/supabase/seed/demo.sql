-- demo.sql — Fase 10: 3 cuentas demo con datos coherentes para el guion de
-- 4 minutos (docs/DEMO_SCRIPT.md, docs/PLAN_DE_IMPLEMENTACION.md §27).
-- Re-ejecutable: cada bloque usa on conflict / delete-e-reinsertar para
-- converger siempre al mismo estado final, sin duplicar filas.
--
-- Contraseña de las 3 cuentas: DemoCora2026!
--
-- Cuentas:
--   demo-adolescente@cora.test   · Adolescencia   · Nivel 2 (Brote)
--   demo-adulta@cora.test        · Adultez        · Nivel 4 (Cactus florecido) · 3 meses de ciclo
--   demo-perimenopausia@cora.test· Perimenopausia · Nivel 3 (Cactus joven)

-- ── 1. Cuentas (auth.users + auth.identities) ───────────────────────────────
-- El trigger on_auth_user_created (0002) crea automáticamente profiles,
-- user_preferences y mascot_state al insertar en auth.users — no se tocan
-- esas tablas acá, solo se actualizan después.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change, is_sso_user, is_anonymous
)
values
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'demo-adolescente@cora.test',
   crypt('DemoCora2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', false, false),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'demo-adulta@cora.test',
   crypt('DemoCora2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', false, false),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'demo-perimenopausia@cora.test',
   crypt('DemoCora2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', false, false)
on conflict (id) do nothing;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
values
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   '{"sub":"a1000000-0000-0000-0000-000000000001","email":"demo-adolescente@cora.test","email_verified":true}',
   'email', now(), now()),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
   '{"sub":"a1000000-0000-0000-0000-000000000002","email":"demo-adulta@cora.test","email_verified":true}',
   'email', now(), now()),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003',
   '{"sub":"a1000000-0000-0000-0000-000000000003","email":"demo-perimenopausia@cora.test","email_verified":true}',
   'email', now(), now())
on conflict (provider_id, provider) do nothing;

-- ── 2. Perfiles ──────────────────────────────────────────────────────────

update public.profiles set
  life_stage = 'adolescencia', display_name = 'Demo Adolescencia', birth_year = 2011,
  onboarding_completed_at = now(),
  avatar_id = (select id from public.avatars where code = 'guardabarranco')
where id = 'a1000000-0000-0000-0000-000000000001';

update public.profiles set
  life_stage = 'adultez', display_name = 'Demo Adulta', birth_year = 1997,
  onboarding_completed_at = now(),
  avatar_id = (select id from public.avatars where code = 'jaguar')
where id = 'a1000000-0000-0000-0000-000000000002';

update public.profiles set
  life_stage = 'perimenopausia', display_name = 'Demo Perimenopausia', birth_year = 1976,
  onboarding_completed_at = now(),
  avatar_id = (select id from public.avatars where code = 'lapa_roja')
where id = 'a1000000-0000-0000-0000-000000000003';

-- ── 3. Consentimiento (evita el aviso de "consentimiento pendiente") ───────

insert into public.consents (user_id, consent_type, version, accepted_at)
values
  ('a1000000-0000-0000-0000-000000000001', 'onboarding', '1.0', now()),
  ('a1000000-0000-0000-0000-000000000002', 'onboarding', '1.0', now()),
  ('a1000000-0000-0000-0000-000000000003', 'onboarding', '1.0', now())
on conflict (user_id, consent_type, version) do nothing;

-- ── 4. Ciclos y registros diarios — cuenta adulta, 3 meses coherentes ──────
-- 4 ciclos de ~28 días (el último abierto, sin cycle_length — es el que la
-- app usaría para predecir el próximo). Los 3 primeros dan predictNext()
-- suficientes datos plausibles (§14 de cycleEngine).

delete from public.cycles where user_id = 'a1000000-0000-0000-0000-000000000002';
delete from public.daily_log_symptoms where daily_log_id in (
  select id from public.daily_logs where user_id = 'a1000000-0000-0000-0000-000000000002'
);
delete from public.daily_logs where user_id = 'a1000000-0000-0000-0000-000000000002';

insert into public.cycles (user_id, start_date, end_date, period_length, cycle_length, is_predicted)
values
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '113 days', current_date - interval '109 days', 5, 28, false),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '85 days', current_date - interval '81 days', 5, 28, false),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '57 days', current_date - interval '53 days', 5, 28, false),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '29 days', current_date - interval '25 days', 5, null, false);

-- Días de sangrado de los 4 ciclos (flujo descendente día a día, como un
-- período real) + un puñado de registros de ánimo/energía entre medio para
-- que "Últimos 30 días" y la biblioteca de síntomas tengan contenido real.
insert into public.daily_logs (user_id, log_date, flow_level, mood, energy_level, sleep_hours, notes)
values
  -- Ciclo 1
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '113 days', 'medium', 'low', 2, 6.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '112 days', 'heavy', 'difficult', 2, 6.0, 'Cólicos fuertes hoy'),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '111 days', 'medium', 'neutral', 3, 7.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '110 days', 'light', 'good', 4, 7.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '109 days', 'spotting', 'good', 4, 7.5, null),
  -- Ciclo 2
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '85 days', 'medium', 'low', 2, 6.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '84 days', 'heavy', 'difficult', 2, 6.0, 'Dolor de cabeza también'),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '83 days', 'medium', 'neutral', 3, 7.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '82 days', 'light', 'good', 4, 7.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '81 days', 'spotting', 'good', 4, 8.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '70 days', 'none', 'great', 5, 8.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '63 days', 'none', 'good', 4, 7.0, null),
  -- Ciclo 3
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '57 days', 'medium', 'low', 2, 6.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '56 days', 'heavy', 'difficult', 2, 6.0, 'Cólicos e hinchazón'),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '55 days', 'medium', 'neutral', 3, 7.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '54 days', 'light', 'good', 4, 7.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '53 days', 'spotting', 'good', 4, 7.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '42 days', 'none', 'great', 5, 8.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '35 days', 'none', 'good', 4, 7.0, null),
  -- Ciclo 4 (el más reciente, todavía "abierto")
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '29 days', 'medium', 'low', 2, 6.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '28 days', 'heavy', 'difficult', 2, 6.0, 'Cólicos fuertes de nuevo'),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '27 days', 'medium', 'neutral', 3, 7.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '26 days', 'light', 'good', 4, 7.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '25 days', 'spotting', 'good', 4, 7.5, null),
  -- Últimas semanas (para que "Últimos 30 días" se vea vivo en la demo)
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '18 days', 'none', 'great', 5, 8.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '11 days', 'none', 'good', 4, 7.5, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '5 days', 'none', 'neutral', 3, 7.0, null),
  ('a1000000-0000-0000-0000-000000000002', current_date - interval '2 days', 'none', 'good', 4, 7.5, 'Todo tranquilo')
on conflict (user_id, log_date) do nothing;

-- Síntomas asociados a los días con dolor (cólicos + dolor de cabeza).
insert into public.daily_log_symptoms (daily_log_id, symptom_id, intensity)
select dl.id, sc.id, 2
from public.daily_logs dl
join public.symptom_catalog sc on sc.code = 'cramps'
where dl.user_id = 'a1000000-0000-0000-0000-000000000002'
  and dl.flow_level in ('medium', 'heavy')
on conflict do nothing;

insert into public.daily_log_symptoms (daily_log_id, symptom_id, intensity)
select dl.id, sc.id, 2
from public.daily_logs dl
join public.symptom_catalog sc on sc.code = 'headache'
where dl.user_id = 'a1000000-0000-0000-0000-000000000002'
  and dl.notes ilike '%dolor de cabeza%'
on conflict do nothing;

-- Un puñado de registros livianos para las otras dos cuentas — no es el
-- foco del guion de seguimiento, pero evita que sus calendarios se vean
-- completamente vacíos si alguien navega ahí durante la demo.
insert into public.daily_logs (user_id, log_date, flow_level, mood, energy_level, sleep_hours, notes)
values
  ('a1000000-0000-0000-0000-000000000001', current_date - interval '3 days', 'light', 'good', 4, 8.0, null),
  ('a1000000-0000-0000-0000-000000000001', current_date - interval '1 days', 'none', 'great', 5, 8.0, null),
  ('a1000000-0000-0000-0000-000000000003', current_date - interval '20 days', 'spotting', 'neutral', 3, 6.5, 'Sofocos por la noche'),
  ('a1000000-0000-0000-0000-000000000003', current_date - interval '4 days', 'none', 'low', 2, 6.0, 'Sofocos otra vez')
on conflict (user_id, log_date) do nothing;

-- ── 5. Puntos y nivel de la pitahaya (narrativa del guion) ─────────────────
-- Se insertan directamente en mascot_events (no vía la RPC, que depende de
-- auth.uid()) y se fija mascot_state al resultado final — mismo cálculo
-- que produciría award_mascot_points().

insert into public.mascot_events (user_id, action_type, points, dedupe_key)
values
  ('a1000000-0000-0000-0000-000000000001', 'onboarding_completed', 15, 'demo:onboarding_completed'),
  ('a1000000-0000-0000-0000-000000000001', 'daily_log', 10, 'demo:daily_log:1')
on conflict (user_id, dedupe_key) do nothing;

insert into public.mascot_events (user_id, action_type, points, dedupe_key)
values
  ('a1000000-0000-0000-0000-000000000002', 'onboarding_completed', 15, 'demo:onboarding_completed'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:1'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:2'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:3'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:4'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:5'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:6'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:7'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:8'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:9'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:10'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:11'),
  ('a1000000-0000-0000-0000-000000000002', 'daily_log', 10, 'demo:daily_log:12'),
  ('a1000000-0000-0000-0000-000000000002', 'article_read', 5, 'demo:article_read:1')
on conflict (user_id, dedupe_key) do nothing;

insert into public.mascot_events (user_id, action_type, points, dedupe_key)
values
  ('a1000000-0000-0000-0000-000000000003', 'onboarding_completed', 15, 'demo:onboarding_completed'),
  ('a1000000-0000-0000-0000-000000000003', 'daily_log', 10, 'demo:daily_log:1'),
  ('a1000000-0000-0000-0000-000000000003', 'daily_log', 10, 'demo:daily_log:2'),
  ('a1000000-0000-0000-0000-000000000003', 'daily_log', 10, 'demo:daily_log:3'),
  ('a1000000-0000-0000-0000-000000000003', 'article_read', 5, 'demo:article_read:1'),
  ('a1000000-0000-0000-0000-000000000003', 'article_read', 5, 'demo:article_read:2'),
  ('a1000000-0000-0000-0000-000000000003', 'article_read', 5, 'demo:article_read:3')
on conflict (user_id, dedupe_key) do nothing;

update public.mascot_state ms set
  points = totals.points,
  level = public.level_for_points(totals.points),
  last_evolved_at = now()
from (
  select user_id, sum(points)::int as points
  from public.mascot_events
  where user_id in (
    'a1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000003'
  )
  group by user_id
) as totals
where ms.user_id = totals.user_id;
