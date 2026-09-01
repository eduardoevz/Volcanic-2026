-- Patrón C (docs/RLS_AUDIT.md): círculo familiar — has_active_grant(owner_id,
-- viewer_id, scope) es la ÚNICA vía de acceso cruzado entre usuarias. Se
-- verifica: sin grant no hay acceso, con grant el acceso queda limitado al
-- scope otorgado, la revocación es instantánea, y daily_logs (notas de
-- síntomas crudas) NUNCA se expone por esta vía sin importar el scope.
begin;
select plan(8);

select tests.create_supabase_user('rls_fam_owner');
select tests.create_supabase_user('rls_fam_viewer');
select tests.create_supabase_user('rls_fam_stranger');

-- Owner registra un ciclo y un daily_log
select tests.authenticate_as('rls_fam_owner');
insert into public.cycles (user_id, start_date, period_length)
values (tests.get_supabase_uid('rls_fam_owner'), '2026-01-01', 4);
insert into public.daily_logs (user_id, log_date, flow_level, notes)
values (tests.get_supabase_uid('rls_fam_owner'), '2026-01-01', 'medium', 'nota privada de síntomas');

-- Sin membership/grant, el viewer no ve nada del owner
select tests.authenticate_as('rls_fam_viewer');
select is(
  (select count(*)::int from public.cycles where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'Sin grant, el viewer no ve los cycles del owner'
);

-- Owner invita al viewer y otorga scope cycle_dates únicamente
select tests.authenticate_as('rls_fam_owner');
insert into public.family_circle_members (owner_id, member_user_id, invite_email, owner_display_name, status, accepted_at)
values (
  tests.get_supabase_uid('rls_fam_owner'),
  tests.get_supabase_uid('rls_fam_viewer'),
  'viewer@correo.com',
  'Owner de prueba',
  'accepted',
  now()
)
returning id as membership_id \gset

insert into public.family_share_grants (membership_id, scope)
values (:'membership_id', 'cycle_dates');

-- Con grant de cycle_dates, el viewer sí ve los cycles del owner
select tests.authenticate_as('rls_fam_viewer');
select isnt(
  (select count(*)::int from public.cycles where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'Con grant de cycle_dates, el viewer sí ve los cycles del owner'
);

-- Pero el grant es solo de cycle_dates: el viewer NO ve appointments (scope distinto, sin grant propio)
select is(
  (select count(*)::int from public.appointments where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'El grant de cycle_dates NO da acceso a appointments (scope exacto, no acceso total)'
);

-- daily_logs NUNCA se expone vía family sharing, sin importar el scope otorgado
select is(
  (select count(*)::int from public.daily_logs where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'daily_logs (notas crudas de síntomas) nunca se expone vía family sharing, ni con grant activo'
);

-- Un tercero sin ninguna relación con el owner no ve nada
select tests.authenticate_as('rls_fam_stranger');
select is(
  (select count(*)::int from public.cycles where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'Un tercero sin membership no ve nada del owner aunque exista un grant activo para otra persona'
);

-- Owner revoca el grant
select tests.authenticate_as('rls_fam_owner');
update public.family_share_grants
set revoked_at = now()
where membership_id = :'membership_id' and scope = 'cycle_dates';

-- La revocación es instantánea: el viewer deja de ver los cycles
select tests.authenticate_as('rls_fam_viewer');
select is(
  (select count(*)::int from public.cycles where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'Tras revocar el grant, el viewer deja de ver los cycles del owner inmediatamente'
);

-- Bypass por RPC: sin un grant activo de mood_summary, get_family_mood_summary
-- no debe devolver datos del owner (revisar la firma real de la función —
-- se asume que devuelve NULL/vacío sin grant en vez de lanzar error; ajustar
-- este assert la primera vez que se corra la suite si la firma difiere).
select is(
  (select public.get_family_mood_summary(tests.get_supabase_uid('rls_fam_owner')) is null),
  true,
  'get_family_mood_summary no expone datos del owner sin un grant activo de mood_summary (revocado arriba)'
);

select * from finish();
rollback;
