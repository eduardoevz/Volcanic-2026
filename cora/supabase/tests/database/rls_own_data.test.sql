-- Patrón A (docs/RLS_AUDIT.md): tablas privadas "own_*" — una usuaria solo
-- puede leer/escribir sus propias filas, nunca las de otra.
begin;
select plan(10);

select tests.create_supabase_user('rls_own_alice');
select tests.create_supabase_user('rls_own_bob');

-- Alice crea su propio daily_log
select tests.authenticate_as('rls_own_alice');
insert into public.daily_logs (user_id, log_date, flow_level)
values (tests.get_supabase_uid('rls_own_alice'), '2026-01-01', 'medium');

-- Alice ve su propio registro
select is(
  (select count(*)::int from public.daily_logs where user_id = tests.get_supabase_uid('rls_own_alice')),
  1,
  'Alice ve su propio daily_log'
);

-- Bob no ve el daily_log de Alice
select tests.authenticate_as('rls_own_bob');
select is(
  (select count(*)::int from public.daily_logs where user_id = tests.get_supabase_uid('rls_own_alice')),
  0,
  'Bob no ve el daily_log de Alice'
);

-- Bob no puede insertar un daily_log a nombre de Alice
select throws_ok(
  format(
    $$insert into public.daily_logs (user_id, log_date, flow_level) values (%L, '2026-01-02', 'light')$$,
    tests.get_supabase_uid('rls_own_alice')
  ),
  'new row violates row-level security policy for table "daily_logs"',
  'Bob no puede insertar un daily_log a nombre de Alice'
);

-- Mismo patrón sobre cycles
select tests.authenticate_as('rls_own_alice');
insert into public.cycles (user_id, start_date, period_length)
values (tests.get_supabase_uid('rls_own_alice'), '2026-01-01', 4);

select tests.authenticate_as('rls_own_bob');
select is(
  (select count(*)::int from public.cycles where user_id = tests.get_supabase_uid('rls_own_alice')),
  0,
  'Bob no ve los cycles de Alice'
);

-- Mismo patrón sobre reminders
select tests.authenticate_as('rls_own_alice');
insert into public.reminders (user_id, title, hour, minute)
values (tests.get_supabase_uid('rls_own_alice'), 'Tomar pastilla', 8, 0);

select tests.authenticate_as('rls_own_bob');
select is(
  (select count(*)::int from public.reminders where user_id = tests.get_supabase_uid('rls_own_alice')),
  0,
  'Bob no ve los reminders de Alice'
);

select throws_ok(
  format(
    $$update public.reminders set title = 'hackeado' where user_id = %L$$,
    tests.get_supabase_uid('rls_own_alice')
  ),
  null,
  null,
  'Bob no puede modificar un reminder de Alice (0 filas afectadas o error RLS)'
);

-- Mismo patrón sobre appointments
select tests.authenticate_as('rls_own_alice');
insert into public.appointments (user_id, title, scheduled_at)
values (tests.get_supabase_uid('rls_own_alice'), 'Control ginecológico', now() + interval '3 days');

select tests.authenticate_as('rls_own_bob');
select is(
  (select count(*)::int from public.appointments where user_id = tests.get_supabase_uid('rls_own_alice')),
  0,
  'Bob no ve las appointments de Alice'
);

-- Mismo patrón sobre profiles
select is(
  (select display_name from public.profiles where id = tests.get_supabase_uid('rls_own_alice')),
  null,
  'Bob no puede leer el perfil de Alice (RLS filtra la fila, no expone display_name)'
);

-- Alice sigue viendo su propio perfil
select tests.authenticate_as('rls_own_alice');
select isnt(
  (select count(*)::int from public.profiles where id = tests.get_supabase_uid('rls_own_alice')),
  0,
  'Alice sí ve su propio perfil'
);

-- anon (sin sesión) no ve ningún daily_log de nadie
select tests.clear_authentication();
select is(
  (select count(*)::int from public.daily_logs),
  0,
  'Un visitante anónimo no ve ningún daily_log'
);

select * from finish();
rollback;
