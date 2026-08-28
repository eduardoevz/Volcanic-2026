-- 0020_service_role_grants.sql
-- Fase 19: primer uso real de service_role en el proyecto (embed-content y
-- send-push). Al probarlo salió un gap sistémico presente desde la 0001:
-- `service_role` tiene `rolbypassrls = true` (bypassa RLS, como se espera),
-- pero jamás tuvo GRANT de select/insert/update/delete en NINGUNA tabla —
-- bypassrls no sustituye al grant de tabla, son dos capas independientes.
-- Causa raíz confirmada con pg_default_acl: los defaults de privilegios de
-- `public` para objetos creados por el rol `postgres` (el que corre las
-- migraciones) solo incluyen Dxtm (delete/truncate/references/trigger) para
-- anon/authenticated/service_role — nunca arwd completo. Cada migración
-- anterior compensó esto a mano con `grant select ... to anon, authenticated`,
-- pero ninguna mencionaba service_role porque nada lo había necesitado hasta
-- ahora (Fase 15/18 ya documentaron "sin service_role disponible en esta
-- sesión" como limitación, no como ausencia de grant).

grant all on all tables in schema public to service_role;

-- Para que las tablas de fases futuras no repitan este mismo gap sin que
-- nadie lo note hasta la primera vez que alguien use service_role sobre
-- ellas.
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
