-- 0004_grants.sql
-- Los privilegios de tabla (GRANT) son un requisito previo a RLS: sin ellos,
-- Postgres rechaza la operación antes de siquiera evaluar las políticas.
-- Las tablas de 0002_profiles.sql solo heredaron REFERENCES/TRIGGER/TRUNCATE
-- por los privilegios por defecto del proyecto; faltaba otorgar explícitamente
-- select/insert/update/delete a los roles de PostgREST. RLS sigue siendo la
-- que decide qué filas se ven, esto solo habilita el acceso a nivel de tabla.

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.life_stage_history to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.consents to authenticated;
grant select, insert, update, delete on public.mascot_state to authenticated;

grant select on public.avatars to anon, authenticated;
