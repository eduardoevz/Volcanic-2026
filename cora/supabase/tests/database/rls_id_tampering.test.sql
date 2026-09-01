-- Manipulación de identificadores: intentar escribir el user_id/owner_id de
-- OTRA persona en el payload de insert/update no debe funcionar — las
-- políticas RLS deben validar contra auth.uid(), nunca confiar en la columna
-- que manda el cliente.
begin;
select plan(6);

select tests.create_supabase_user('rls_tamper_alice');
select tests.create_supabase_user('rls_tamper_bob');

-- Bob intenta crear un daily_log poniendo el user_id de Alice en el payload
select tests.authenticate_as('rls_tamper_bob');
select throws_ok(
  format(
    $$insert into public.daily_logs (user_id, log_date, flow_level) values (%L, '2026-01-01', 'medium')$$,
    tests.get_supabase_uid('rls_tamper_alice')
  ),
  'new row violates row-level security policy for table "daily_logs"',
  'Bob no puede insertar un daily_log con el user_id de Alice en el payload'
);

-- Bob intenta crear un cycle a nombre de Alice
select throws_ok(
  format(
    $$insert into public.cycles (user_id, start_date, period_length) values (%L, '2026-01-01', 4)$$,
    tests.get_supabase_uid('rls_tamper_alice')
  ),
  'new row violates row-level security policy for table "cycles"',
  'Bob no puede insertar un cycle con el user_id de Alice'
);

-- Bob crea su propio reminder legítimamente y luego intenta reasignarlo a Alice via UPDATE
select tests.authenticate_as('rls_tamper_bob');
insert into public.reminders (user_id, title, hour, minute)
values (tests.get_supabase_uid('rls_tamper_bob'), 'Recordatorio de Bob', 9, 0);

select throws_ok(
  format(
    $$update public.reminders set user_id = %L where user_id = %L$$,
    tests.get_supabase_uid('rls_tamper_alice'),
    tests.get_supabase_uid('rls_tamper_bob')
  ),
  null,
  null,
  'Bob no puede reasignar su propio reminder al user_id de Alice vía UPDATE'
);

-- El reminder de Bob sigue siendo de Bob después del intento fallido
select is(
  (select user_id from public.reminders where title = 'Recordatorio de Bob'),
  tests.get_supabase_uid('rls_tamper_bob'),
  'el reminder de Bob sigue siendo suyo tras el intento de reasignación'
);

-- Family sharing: Bob intenta crear una membership poniéndose a sí mismo
-- como owner de la relación con Alice sin que Alice lo haya invitado.
select throws_ok(
  format(
    $$insert into public.family_circle_members (owner_id, member_user_id, invite_email, owner_display_name, status)
      values (%L, %L, 'alice@correo.com', 'Bob (falso owner)', 'accepted')$$,
    tests.get_supabase_uid('rls_tamper_alice'),
    tests.get_supabase_uid('rls_tamper_bob')
  ),
  null,
  null,
  'Bob no puede crear una family_circle_members poniendo a Alice como owner sin ser ella quien invita'
);

-- Bob intenta otorgarse a sí mismo un grant directo sin pasar por una membership válida
select throws_ok(
  $$insert into public.family_share_grants (membership_id, scope) values (gen_random_uuid(), 'cycle_dates')$$,
  null,
  null,
  'Bob no puede insertar un family_share_grant apuntando a una membership_id inventada'
);

select * from finish();
rollback;
