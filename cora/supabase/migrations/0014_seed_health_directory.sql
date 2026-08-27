-- 0014_seed_health_directory.sql
-- Fase 14: datos semilla del directorio de salud. Mismo patrón que
-- 0007_seed_symptoms.sql/0009_seed_content.sql — esquema y datos separados.
--
-- health_centers: filas marcadas is_verified = true corresponden a
-- hospitales públicos de referencia nacional de Nicaragua, verificados por
-- búsqueda web puntual contra minsa.gob.ni y directorios públicos el
-- 2026-08-27 (fuente citada en comentario sobre cada insert). El resto son
-- datos de ejemplo (is_verified = false), usados para poblar tipos y
-- departamentos que no se pudieron verificar a tiempo — honestamente
-- marcados, mismo criterio que docs/RLS_AUDIT.md y docs/PROGRESO.md ya usan
-- en el resto del proyecto.
--
-- specialists: TODAS las filas son ficticias. No se publican datos de
-- profesionales reales sin su consent_to_publish verificable (§8 del plan,
-- restricción no negociable) — como no se consiguieron consentimientos
-- reales durante esta fase, la tabla queda con perfiles de ejemplo,
-- explícitamente marcados como tales (is_verified = false en todas).

-- ── health_centers ────────────────────────────────────────────────────────

-- fuente: https://www.minsa.gob.ni/red-de-salud/hospital-con-servicios-de-referencia-nacional/hospital-bertha-calderon-roque
insert into public.health_centers (name, type, department, municipality, address, phone, is_verified, services) values
('Hospital Bertha Calderón Roque', 'hospital', 'Managua', 'Managua', 'Pista Juan Pablo II, frente al Mercado Israel Lewites', '+505 2260 1303', true, array['ginecologia', 'obstetricia', 'embarazo_alto_riesgo']);

-- fuente: https://www.minsa.gob.ni/red-de-salud/hospital-con-servicios-de-referencia-nacional/hospital-antonio-lenin-fonseca
insert into public.health_centers (name, type, department, municipality, address, phone, is_verified, services) values
('Hospital Escuela Antonio Lenín Fonseca', 'hospital', 'Managua', 'Managua', '43 Av. Suroeste, Reparto Los Arcos', '+505 2266 6543', true, array['medicina_general', 'urgencias']);

-- fuente: https://www.minsa.gob.ni/red-de-salud/hospital-con-servicios-de-referencia-nacional/hospital-manolo-morales-peralta
insert into public.health_centers (name, type, department, municipality, address, phone, is_verified, services) values
('Hospital Escuela Manolo Morales Peralta', 'hospital', 'Managua', 'Managua', 'Costado oeste del Mercado Roberto Huembes', '+505 2277 0990', true, array['medicina_general', 'urgencias']);

-- fuente: https://www.minsa.gob.ni/red-de-salud/hospital-regional/hospital-escuela-oscar-danilo-rosales (sin teléfono público verificado a tiempo)
insert into public.health_centers (name, type, department, municipality, address, phone, is_verified, services) values
('Hospital Escuela Oscar Danilo Rosales Argüello (HEODRA)', 'hospital', 'León', 'León', 'Costado este de la Catedral de León', null, true, array['medicina_general', 'ginecologia', 'urgencias']);

-- dato de ejemplo, no verificado
insert into public.health_centers (name, type, department, municipality, address, phone, is_verified, services) values
('Centro de Salud Modelo — Granada', 'centro_salud', 'Granada', 'Granada', null, null, false, array['atencion_primaria', 'planificacion_familiar']),
('Centro de Salud Modelo — Estelí', 'centro_salud', 'Estelí', 'Estelí', null, null, false, array['atencion_primaria', 'control_prenatal']),
('Clínica Modelo — Masaya', 'clinica', 'Masaya', 'Masaya', null, null, false, array['medicina_general', 'ginecologia']),
('Casa Materna Modelo — Matagalpa', 'casa_materna', 'Matagalpa', 'Matagalpa', null, null, false, array['atencion_prenatal', 'hospedaje_previo_al_parto']),
('Centro de Salud Modelo — Chinandega', 'centro_salud', 'Chinandega', 'Chinandega', null, null, false, array['atencion_primaria']),
('Casa Materna Modelo — Jinotega', 'casa_materna', 'Jinotega', 'Jinotega', null, null, false, array['atencion_prenatal', 'hospedaje_previo_al_parto']);

-- ── specialists — ficticios, ver nota arriba ─────────────────────────────

insert into public.specialists (full_name, specialty, health_center_id, phone, email, consent_to_publish, is_verified) values
('Dra. Ejemplo Martínez', 'Ginecología y obstetricia', (select id from public.health_centers where name = 'Hospital Bertha Calderón Roque'), null, null, true, false),
('Dr. Muestra López', 'Medicina familiar', (select id from public.health_centers where name = 'Centro de Salud Modelo — Estelí'), null, null, true, false),
('Dra. Referencia Gómez', 'Psicología clínica', null, null, null, true, false),
('Dra. Ilustrativa Torres', 'Obstetricia', (select id from public.health_centers where name = 'Casa Materna Modelo — Matagalpa'), null, null, true, false),
('Lic. Ejemplo Ramírez', 'Partería', (select id from public.health_centers where name = 'Casa Materna Modelo — Jinotega'), null, null, true, false),
('Dr. Modelo Sánchez', 'Ginecología', (select id from public.health_centers where name = 'Hospital Escuela Manolo Morales Peralta'), null, null, true, false);
