-- Patrón B (docs/RLS_AUDIT.md): catálogos públicos de solo lectura —
-- legibles incluso sin sesión (anon), pero nunca escribibles por un usuario normal.
begin;
select plan(7);

select tests.clear_authentication();

select isnt(
  (select count(*)::int from public.avatars),
  0,
  'anon puede leer avatars (catálogo público, hay avatares seed)'
);

select isnt(
  (select count(*)::int from public.symptom_catalog),
  0,
  'anon puede leer symptom_catalog'
);

select isnt(
  (select count(*)::int from public.content_categories),
  0,
  'anon puede leer content_categories'
);

select isnt(
  (select count(*)::int from public.health_centers),
  0,
  'anon puede leer health_centers'
);

-- educational_content: solo status = 'published' debe ser visible para anon,
-- aunque existan artículos en draft/archived en la tabla.
select is(
  (select count(*)::int from public.educational_content where status <> 'published'),
  0,
  'anon nunca ve artículos que no estén en status=published (los draft/archived quedan filtrados por RLS)'
);

select isnt(
  (select count(*)::int from public.educational_content where status = 'published'),
  0,
  'anon sí ve los artículos publicados'
);

-- Un usuario autenticado normal no puede escribir en un catálogo (son
-- gestionados por service_role/admin, no por la app cliente).
select tests.create_supabase_user('rls_catalog_alice');
select tests.authenticate_as('rls_catalog_alice');
select throws_ok(
  $$insert into public.avatars (code, name_es) values ('hack', 'Avatar falso')$$,
  null,
  null,
  'Una usuaria autenticada normal no puede insertar en avatars'
);

select * from finish();
rollback;
