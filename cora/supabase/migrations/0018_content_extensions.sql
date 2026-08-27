-- 0018_content_extensions.sql
-- Fase 18: columnas nuevas para audio educativo y catálogos multilingües.
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §29 (Fase 18). audio_path no existía
-- en el esquema real (0008_content.sql se construyó sin ella); name_mis/
-- name_myn/label_mis/label_myn dejan lista la arquitectura de miskito/
-- mayangna sin insertar contenido traducido (ver nota en docs/PROGRESO.md
-- Fase 18: sin conocimiento fiable de esas lenguas en esta sesión).

alter table public.educational_content add column audio_path text;
alter table public.avatars add column name_mis text;
alter table public.avatars add column name_myn text;
alter table public.symptom_catalog add column label_mis text;
alter table public.symptom_catalog add column label_myn text;

-- Bucket público de lectura para audio educativo, mismo criterio que
-- public-assets en §7 del plan: sin RLS de objeto compleja, solo
-- service_role escribe (ver docs/RLS_AUDIT.md Fase 18 sobre las políticas
-- temporales usadas una sola vez para subir un archivo de prueba).
insert into storage.buckets (id, name, public) values ('content-audio', 'content-audio', true);
