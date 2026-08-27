-- 0017_seed_health_rights_content.sql
-- Fase 17: contenido de derechos de salud (no es trabajo de ingeniería —
-- ver docs/PLAN_DE_IMPLEMENTACION.md §29, "Fase 17"). 3 artículos nuevos en
-- la categoría ya existente 'derechos-y-comunidad' (0009_seed_content.sql),
-- complementarios al artículo general 'derechos-en-salud-en-nicaragua' ya
-- sembrado. URLs verificadas por búsqueda web el 2026-08-27, mismo estándar
-- editorial que 0009_seed_content.sql: toda afirmación lleva fuente real,
-- sin reviewed_by_name (sin profesional de salud disponible en el equipo).

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'ley-779-vida-libre-de-violencia',
  $$Ley 779: derecho a una vida libre de violencia$$,
  $$Qué protege la Ley 779 en Nicaragua y a dónde acudir para denunciar violencia contra la mujer.$$,
  $$## Un derecho respaldado por ley

La Ley 779, "Ley Integral Contra la Violencia hacia las Mujeres", establece el derecho de las mujeres a vivir libres de violencia física, psicológica, sexual y económica, tanto en espacios públicos como privados.

## Qué protege

- Sanciona la violencia física, psicológica, sexual y económica contra las mujeres.
- Protege también la integridad sexual y reproductiva.
- Reconoce que la violencia puede ocurrir dentro de la propia familia o pareja, no solo entre desconocidos.

## A dónde acudir

- La **Policía Nacional** (incluidas las comisarías de la mujer, donde existan) recibe denuncias de violencia.
- El **Ministerio Público** también puede recibir la denuncia directamente.
- Si la víctima es niña o adolescente, cualquier institución educativa, asistencial o persona que tenga conocimiento del hecho está obligada a denunciarlo dentro de las 48 horas siguientes.

## Durante el proceso

La víctima tiene derecho a hacerse acompañar por psicólogo, psicóloga, psiquiatra o cualquier persona de su confianza durante las comparecencias, para apoyo ante una posible crisis.

## Recordatorio

Nadie tiene derecho a ejercer violencia sobre otra persona. Conocer esta ley ayuda a identificar cuándo una situación es violencia, y a saber que existe una ruta real para pedir protección.$$,
  (select id from public.content_categories where slug = 'derechos-y-comunidad'),
  array['adolescencia', 'adultez', 'embarazo', 'perimenopausia', 'mayor']::life_stage[], 0, 4, 'Equipo editorial Cora', '⚖️', 3, 'published', '2026-08-27'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'derechos-laborales-embarazo-y-maternidad',
  $$Derechos laborales durante el embarazo y la maternidad$$,
  $$Qué garantiza la ley nicaragüense sobre el descanso pre y post natal, y el subsidio de maternidad.$$,
  $$## Descanso pre y post natal

El Código del Trabajo de Nicaragua garantiza a las trabajadoras embarazadas el derecho a reposo durante las **cuatro semanas anteriores al parto** y las **ocho semanas posteriores**, con goce del último o mejor salario.

## Una ampliación reciente

En abril de 2025, la Asamblea Nacional reformó la Ley de Seguridad Social para ampliar el descanso posterior al parto de ocho a **nueve semanas**, quedando un total de **13 semanas** de licencia (4 antes del parto + 9 después). El subsidio del INSS durante este período equivale al 60% del salario semanal promedio de la trabajadora.

## Casos especiales

- Si el parto ocurre antes de la fecha estimada, los días de descanso prenatal no utilizados se suman al descanso posterior al parto.
- Si el parto ocurre después de la fecha estimada, el descanso prenatal se extiende hasta el nacimiento, sin reducir el descanso posterior.

## Por qué importa conocerlo

Saber exactamente qué tiempo de descanso corresponde por ley ayuda a planificar el embarazo con la empleadora y a identificar si algo no se está cumpliendo como debería.$$,
  (select id from public.content_categories where slug = 'derechos-y-comunidad'),
  array['embarazo', 'adultez']::life_stage[], 0, 3, 'Equipo editorial Cora', '🤱', 3, 'published', '2026-08-27'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'parto-humanizado-derecho-al-acompanamiento',
  $$Parto humanizado y derecho al acompañamiento$$,
  $$Qué establece el MINSA sobre el parto humanizado, y el derecho a elegir quién acompaña durante el trabajo de parto.$$,
  $$## Qué es el parto humanizado

El Ministerio de Salud (MINSA) tiene una normativa específica (Normativa 042) que establece cómo debe ser la atención respetuosa durante el trabajo de parto, el parto y el postparto en los servicios de salud públicos.

## Qué garantiza

- Respeto a la privacidad durante el trabajo de parto y el parto.
- Libertad de posición y movimiento de la mujer durante el trabajo de parto — no hay una única postura obligatoria.
- El derecho a elegir con quién acompañarse (la pareja, un familiar, o quien la mujer prefiera) durante el proceso.
- El respeto a la decisión de la mujer si prefiere no tener acompañante.
- El contacto inmediato entre la madre y el recién nacido después del parto, cuando la condición de ambos lo permite.

## Control prenatal integral y gratuito

El sistema de salud público garantiza el acceso a control prenatal integral, incluyendo diagnóstico, tratamiento y seguimiento a lo largo del embarazo, sin costo.

## Por qué conocer esto importa

Saber que el acompañamiento y el trato respetuoso durante el parto son parte de una normativa oficial — no un favor del personal de salud — ayuda a pedirlos con confianza en cualquier centro de atención.$$,
  (select id from public.content_categories where slug = 'derechos-y-comunidad'),
  array['embarazo']::life_stage[], 0, 3, 'Equipo editorial Cora', '🫂', 3, 'published', '2026-08-27'
);

-- ── Fuentes citadas (2 por artículo, URLs verificadas 2026-08-27) ──────────

insert into public.content_sources (content_id, label, organization, url, published_year, sort_order) values
  ((select id from public.educational_content where slug = 'ley-779-vida-libre-de-violencia'), 'Texto de la Ley 779', 'UNICEF Nicaragua', 'https://www.unicef.org/nicaragua/media/686/file/Ley%20integral%20contra%20la%20violencia%20hacia%20las%20mujeres%20y%20de%20reformas%20a%20la%20ley%20641.pdf', 2012, 1),
  ((select id from public.educational_content where slug = 'ley-779-vida-libre-de-violencia'), 'Mecanismos de denuncia para la mujer', 'Ministerio de la Mujer (MINIM)', 'https://www.minim.gob.ni/storage/documents/WHkzsDUji5U9wHk730FOOMQxvza7cxJsyElOqsxZ.pdf', 2026, 2),

  ((select id from public.educational_content where slug = 'derechos-laborales-embarazo-y-maternidad'), 'Reforman Ley de Seguridad Social: aumenta a 13 semanas el descanso por maternidad', 'La Mesa Redonda', 'https://www.lamesaredonda.net/destacados/95308-reforman-ley-de-seguridad-social-en-nicaragua-aumenta-a-13-semanas-el-descanso-por-maternidad/', 2025, 1),
  ((select id from public.educational_content where slug = 'derechos-laborales-embarazo-y-maternidad'), 'Aprobamos reforma que amplía subsidio por maternidad', 'Asamblea Nacional de Nicaragua', 'https://noticias.asamblea.gob.ni/aprobamos-reformas-que-amplian-subsidio-por-maternidad/', 2025, 2),

  ((select id from public.educational_content where slug = 'parto-humanizado-derecho-al-acompanamiento'), 'Normativa 042 — Norma de Humanización del Parto Institucional', 'MINSA Nicaragua', 'https://www.minsa.gob.ni/sites/default/files/2023-02/Normativa%20-%20042%20''Norma%20de%20Humanizaci%C3%B3n%20del%20Parto%20Instituciona''l.pdf', 2015, 1),
  ((select id from public.educational_content where slug = 'parto-humanizado-derecho-al-acompanamiento'), 'Normativa 011 — Normas y protocolos para la atención prenatal, parto y puerperio', 'MINSA Nicaragua', 'https://www.minsa.gob.ni/sites/default/files/publicaciones/Normativa%20%20011%20%E2%80%9CNormas%20y%20protocolos%20para%20la%20atenci%C3%B3n%20prenatal,%20parto,%20reci%C3%A9n%20nacido%20a%20y%20puerperio%20de%20bajo%20riesgo%E2%80%9D.pdf', 2015, 2);
