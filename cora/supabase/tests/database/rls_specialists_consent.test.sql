-- specialists es la excepción al patrón B (catálogo público): contiene datos
-- de contacto de una persona real, así que cada fila exige
-- consent_to_publish = true además de estar en la tabla — no basta con "estar
-- publicada", como en educational_content.
begin;
select plan(3);

select tests.clear_authentication();

select is(
  (select count(*)::int from public.specialists where consent_to_publish = false),
  0,
  'anon nunca ve specialists con consent_to_publish = false, aunque existan en la tabla'
);

-- Si hay al menos un specialist con consentimiento, debe ser visible
select ok(
  (select count(*)::int from public.specialists) =
  (select count(*)::int from public.specialists where consent_to_publish = true),
  'todo lo que anon ve en specialists tiene consent_to_publish = true (ninguna fila sin consentimiento se filtra)'
);

-- Un usuario autenticado normal no puede cambiar el consentimiento de otra persona
select tests.create_supabase_user('rls_spec_alice');
select tests.authenticate_as('rls_spec_alice');
select throws_ok(
  $$update public.specialists set consent_to_publish = true$$,
  null,
  null,
  'una usuaria autenticada normal no puede modificar el consentimiento de un specialist'
);

select * from finish();
rollback;
