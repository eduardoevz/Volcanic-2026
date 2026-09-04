-- Patrón C (docs/RLS_AUDIT.md): círculo familiar — has_active_grant(owner_id,
-- viewer_id, scope) es la ÚNICA vía de acceso cruzado entre usuarias, y desde
-- la Fase 26 los 3 scopes (mood_summary, care_alert, next_appointment) pasan
-- exclusivamente por RPCs agregadas de security definer — ya no hay RLS
-- directo sobre cycles/reminders/appointments. Se verifica: sin grant no hay
-- acceso, con grant el acceso queda limitado al scope otorgado, la
-- revocación es instantánea, y daily_logs (notas de síntomas crudas) NUNCA
-- se expone por esta vía sin importar el scope.
begin;
select plan(7);

select tests.create_supabase_user('rls_fam_owner');
select tests.create_supabase_user('rls_fam_viewer');
select tests.create_supabase_user('rls_fam_stranger');

-- Owner registra un daily_log de hoy con síntoma fuerte y una cita agendada
select tests.authenticate_as('rls_fam_owner');
insert into public.daily_logs (user_id, log_date, flow_level, notes)
values (tests.get_supabase_uid('rls_fam_owner'), current_date, 'medium', 'nota privada de síntomas');
insert into public.appointments (user_id, title, scheduled_at, status)
values (tests.get_supabase_uid('rls_fam_owner'), 'Control ginecológico', now() + interval '3 days', 'scheduled');

-- Sin membership/grant, care_alert y next_appointment no devuelven nada
select tests.authenticate_as('rls_fam_viewer');
select is(
  public.get_family_care_alert(tests.get_supabase_uid('rls_fam_owner')),
  false,
  'Sin grant, get_family_care_alert no expone señal del owner'
);
select is(
  public.get_family_next_appointment(tests.get_supabase_uid('rls_fam_owner')),
  null,
  'Sin grant, get_family_next_appointment no expone fecha del owner'
);

-- Owner invita al viewer y otorga únicamente el scope care_alert
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
values (:'membership_id', 'care_alert');

-- Con grant de care_alert, el viewer sí ve la señal de hoy
select tests.authenticate_as('rls_fam_viewer');
select is(
  public.get_family_care_alert(tests.get_supabase_uid('rls_fam_owner')),
  true,
  'Con grant de care_alert y síntoma fuerte hoy, get_family_care_alert devuelve true'
);

-- Pero el grant es solo de care_alert: next_appointment sigue sin datos (scope exacto, no acceso total)
select is(
  public.get_family_next_appointment(tests.get_supabase_uid('rls_fam_owner')),
  null,
  'El grant de care_alert NO da acceso a next_appointment (scope exacto, no acceso total)'
);

-- daily_logs NUNCA se expone directamente vía family sharing, sin importar el scope otorgado
select is(
  (select count(*)::int from public.daily_logs where user_id = tests.get_supabase_uid('rls_fam_owner')),
  0,
  'daily_logs (notas crudas de síntomas) nunca se expone por RLS directo vía family sharing'
);

-- Un tercero sin ninguna relación con el owner no ve nada
select tests.authenticate_as('rls_fam_stranger');
select is(
  public.get_family_care_alert(tests.get_supabase_uid('rls_fam_owner')),
  false,
  'Un tercero sin membership no ve la señal del owner aunque exista un grant activo para otra persona'
);

-- Owner revoca el grant; la revocación es instantánea
select tests.authenticate_as('rls_fam_owner');
update public.family_share_grants
set revoked_at = now()
where membership_id = :'membership_id' and scope = 'care_alert';

select tests.authenticate_as('rls_fam_viewer');
select is(
  public.get_family_care_alert(tests.get_supabase_uid('rls_fam_owner')),
  false,
  'Tras revocar el grant, el viewer deja de ver la señal del owner inmediatamente'
);

select * from finish();
rollback;
