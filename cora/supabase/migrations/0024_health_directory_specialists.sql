-- Fase 25 — completa el directorio de salud (Fase 14, 0013/0014). Los 6
-- especialistas semilla usaban nombres placeholder deliberados ("Dra. Ejemplo
-- Martínez", "Lic. Ejemplo Ramírez"...) y no tenían teléfono/correo. Esta
-- migración NO edita 0013/0014 retroactivamente (docs/CONVENCIONES.md) — es
-- una migración de datos nueva.
--
-- Seguimos siendo honestos: TODOS los especialistas de esta tabla son
-- FICTICIOS (mismo criterio que 0014, líneas 14-18) — no se publican datos de
-- profesionales reales sin su consent_to_publish verificable. Lo que cambia
-- acá es que los nombres/correos/teléfonos ficticios ahora suenan realistas
-- (apellidos nicaragüenses comunes) en vez de usar la palabra "Ejemplo" en el
-- nombre — consent_to_publish se mantiene en true porque siguen siendo datos
-- de ejemplo generados por el equipo, no de personas reales. Los correos
-- usan el dominio inventado "ejemplo.ni", que no resuelve a nada real y nunca
-- se confunde con un dominio de gobierno (@minsa.gob.ni) ni uno público real.

alter table public.specialists add column title text;
comment on column public.specialists.title is 'Cargo/puesto dentro del centro (ej. "Jefa del Servicio de Ginecología"), distinto de specialty (la especialidad clínica).';

-- ── Actualiza los 6 especialistas ya sembrados en 0014 ───────────────────────

update public.specialists set
  full_name = 'Dra. María Auxiliadora Martínez Rugama',
  title = 'Jefa del Servicio de Ginecología',
  phone = '+505 8123 4501',
  email = 'maria.martinez@bertha-calderon.ejemplo.ni'
where full_name = 'Dra. Ejemplo Martínez';

update public.specialists set
  full_name = 'Dr. Denis Fabricio López Selva',
  title = 'Médico de Familia',
  phone = '+505 8123 4502',
  email = 'denis.lopez@cs-esteli.ejemplo.ni'
where full_name = 'Dr. Muestra López';

update public.specialists set
  full_name = 'Dra. Auxiliadora Elizabeth Gómez Estrada',
  title = 'Psicóloga Clínica Independiente',
  phone = '+505 8234 5601',
  email = 'auxiliadora.gomez@consulta.ejemplo.ni'
where full_name = 'Dra. Referencia Gómez';

update public.specialists set
  full_name = 'Dra. Concepción del Rosario Torres Alemán',
  title = 'Médica Obstetra',
  phone = '+505 8234 5602',
  email = 'concepcion.torres@casa-materna-matagalpa.ejemplo.ni'
where full_name = 'Dra. Ilustrativa Torres';

update public.specialists set
  full_name = 'Lic. Scarleth Massiel Ramírez Pastora',
  title = 'Partera Certificada',
  phone = '+505 8345 6701',
  email = 'scarleth.ramirez@casa-materna-jinotega.ejemplo.ni'
where full_name = 'Lic. Ejemplo Ramírez';

update public.specialists set
  full_name = 'Dr. Ramón Antonio Sánchez Zeledón',
  title = 'Médico Ginecólogo',
  phone = '+505 8345 6702',
  email = 'ramon.sanchez@manolo-morales.ejemplo.ni'
where full_name = 'Dr. Modelo Sánchez';

-- ── Especialistas nuevos — mínimo 2 por centro ───────────────────────────────

insert into public.specialists (full_name, title, specialty, health_center_id, phone, email, consent_to_publish, is_verified) values
('Dr. Carlos Alberto Baltodano Meza', 'Médico Obstetra', 'Obstetricia', (select id from public.health_centers where name = 'Hospital Bertha Calderón Roque'), '+505 8456 7801', 'carlos.baltodano@bertha-calderon.ejemplo.ni', true, false),

('Dra. Yessenia del Carmen Membreño Vado', 'Médica Internista', 'Medicina interna', (select id from public.health_centers where name = 'Hospital Escuela Antonio Lenín Fonseca'), '+505 8456 7802', 'yessenia.membreno@antonio-lenin-fonseca.ejemplo.ni', true, false),
('Dr. Erick Javier Munguía Estrada', 'Jefe de Urgencias', 'Medicina de urgencias', (select id from public.health_centers where name = 'Hospital Escuela Antonio Lenín Fonseca'), '+505 8567 8901', 'erick.munguia@antonio-lenin-fonseca.ejemplo.ni', true, false),

('Dra. Doris Elena Somarriba Cardenal', 'Médica Ginecóloga', 'Ginecología', (select id from public.health_centers where name = 'Hospital Escuela Manolo Morales Peralta'), '+505 8567 8902', 'doris.somarriba@manolo-morales.ejemplo.ni', true, false),

('Dra. Karla Vanessa Tijerino Argüello', 'Médica Ginecóloga', 'Ginecología', (select id from public.health_centers where name = 'Hospital Escuela Oscar Danilo Rosales Argüello (HEODRA)'), '+505 8678 9001', 'karla.tijerino@heodra.ejemplo.ni', true, false),
('Dr. Julio César Suazo Ortez', 'Médico General', 'Medicina general', (select id from public.health_centers where name = 'Hospital Escuela Oscar Danilo Rosales Argüello (HEODRA)'), '+505 8678 9002', 'julio.suazo@heodra.ejemplo.ni', true, false),

('Lic. Fátima Rosibel Talavera Guevara', 'Enfermera Obstetra', 'Enfermería obstétrica', (select id from public.health_centers where name = 'Centro de Salud Modelo — Granada'), '+505 8789 0101', 'fatima.talavera@cs-granada.ejemplo.ni', true, false),
('Dr. Nestor Iván Blandón Corea', 'Médico de Atención Primaria', 'Medicina familiar', (select id from public.health_centers where name = 'Centro de Salud Modelo — Granada'), '+505 8789 0102', 'nestor.blandon@cs-granada.ejemplo.ni', true, false),

('Dra. Marlene Auxiliadora Chavarría Espinoza', 'Médica de Control Prenatal', 'Control prenatal', (select id from public.health_centers where name = 'Centro de Salud Modelo — Estelí'), '+505 8890 1201', 'marlene.chavarria@cs-esteli.ejemplo.ni', true, false),

('Dra. Xiomara Isabel Narváez Peralta', 'Médica Ginecóloga', 'Ginecología', (select id from public.health_centers where name = 'Clínica Modelo — Masaya'), '+505 8890 1202', 'xiomara.narvaez@clinica-masaya.ejemplo.ni', true, false),
('Dr. Freddy Antonio Vílchez Miranda', 'Médico General', 'Medicina general', (select id from public.health_centers where name = 'Clínica Modelo — Masaya'), '+505 8901 2301', 'freddy.vilchez@clinica-masaya.ejemplo.ni', true, false),

('Lic. Perla Anielka Cerda Delgadillo', 'Partera Comunitaria', 'Partería', (select id from public.health_centers where name = 'Casa Materna Modelo — Matagalpa'), '+505 8901 2302', 'perla.cerda@casa-materna-matagalpa.ejemplo.ni', true, false),

('Dr. Wilber Ernesto Rocha Duarte', 'Médico General', 'Medicina general', (select id from public.health_centers where name = 'Centro de Salud Modelo — Chinandega'), '+505 8012 3401', 'wilber.rocha@cs-chinandega.ejemplo.ni', true, false),
('Dra. Lesbia Noelia Aráuz Bermúdez', 'Médica de Atención Primaria', 'Atención primaria', (select id from public.health_centers where name = 'Centro de Salud Modelo — Chinandega'), '+505 8012 3402', 'lesbia.arauz@cs-chinandega.ejemplo.ni', true, false),

('Dr. Norvin Alexander Guevara Rugama', 'Médico Obstetra', 'Obstetricia', (select id from public.health_centers where name = 'Casa Materna Modelo — Jinotega'), '+505 8100 2200', 'norvin.guevara@casa-materna-jinotega.ejemplo.ni', true, false);
