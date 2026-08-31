-- Eliminación de cuenta: borrar la fila de auth.users debe eliminar (por
-- cascada, vía las FKs a profiles.id) los datos personales asociados. Esto
-- corre con privilegios de servicio (no hay política RLS de "delete" para
-- auth.users desde el cliente — el borrado de cuenta real pasa por una
-- función de servicio/edge function, no por el cliente directo).
begin;
select plan(4);

select tests.create_supabase_user('rls_delete_alice');

select tests.authenticate_as('rls_delete_alice');
insert into public.daily_logs (user_id, log_date, flow_level)
values (tests.get_supabase_uid('rls_delete_alice'), '2026-01-01', 'medium');
insert into public.cycles (user_id, start_date, period_length)
values (tests.get_supabase_uid('rls_delete_alice'), '2026-01-01', 4);

select isnt(
  (select count(*)::int from public.daily_logs where user_id = tests.get_supabase_uid('rls_delete_alice')),
  0,
  'sanity check: Alice tiene un daily_log antes de borrar la cuenta'
);

-- El borrado de auth.users requiere privilegios de servicio
reset role;
delete from auth.users where id = tests.get_supabase_uid('rls_delete_alice');

select is(
  (select count(*)::int from public.profiles where id = tests.get_supabase_uid('rls_delete_alice')),
  0,
  'borrar auth.users elimina en cascada el profile asociado'
);

select is(
  (select count(*)::int from public.daily_logs where user_id = tests.get_supabase_uid('rls_delete_alice')),
  0,
  'borrar la cuenta elimina en cascada los daily_logs de la usuaria'
);

select is(
  (select count(*)::int from public.cycles where user_id = tests.get_supabase_uid('rls_delete_alice')),
  0,
  'borrar la cuenta elimina en cascada los cycles de la usuaria'
);

select * from finish();
rollback;
