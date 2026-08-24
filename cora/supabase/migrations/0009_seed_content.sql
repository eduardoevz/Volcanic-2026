-- 0009_seed_content.sql
-- Fase 5: seed de 8 categorías + 25 artículos + fuentes citadas.
-- Política editorial (docs/PLAN_DE_IMPLEMENTACION.md §15): toda afirmación
-- clínica lleva fuente real (OMS/OPS, MINSA Nicaragua, ACOG, NHS, Mayo
-- Clinic); ningún artículo indica dosis ni medicamentos; ninguno tiene
-- reviewed_by_name real todavía (no hay profesional de salud disponible en
-- el equipo) — se publican honestamente sin sello de revisión; la UI
-- muestra el badge "Pendiente de revisión profesional" en su lugar.
-- URLs verificadas con WebFetch antes de escribir este archivo.

-- ── Categorías ────────────────────────────────────────────────────────────

insert into public.content_categories (slug, name_es, description_es, icon, color, sort_order) values
  ('pubertad', 'Pubertad y primera menstruación', 'Cambios del cuerpo al inicio de la adolescencia.', '🌷', '#F2C4D6', 1),
  ('ciclo', 'Ciclo menstrual', 'Cómo funciona el ciclo y sus síntomas más comunes.', '🩸', '#E8547A', 2),
  ('salud-sexual', 'Salud sexual y reproductiva', 'Prevención, anticoncepción y chequeos.', '🌺', '#C23B64', 3),
  ('embarazo', 'Embarazo', 'Cambios, controles y alimentación durante el embarazo.', '🤰', '#F4A6B7', 4),
  ('perimenopausia', 'Perimenopausia y menopausia', 'La transición hormonal después de los 40.', '🌙', '#9A6FB0', 5),
  ('bienestar-emocional', 'Bienestar emocional', 'Salud mental en las distintas etapas de la vida.', '💛', '#F2B84B', 6),
  ('nutricion-y-actividad', 'Nutrición y actividad física', 'Hábitos que acompañan el cuerpo en cada etapa.', '🥗', '#6FAE6F', 7),
  ('derechos-y-comunidad', 'Derechos y comunidad', 'A dónde acudir y qué garantiza el sistema de salud.', '🤝', '#4B8FA6', 8);

-- ── Adolescencia (6) ──────────────────────────────────────────────────────

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'tu-primera-menstruacion',
  $$Tu primera menstruación$$,
  $$Qué esperar cuando te llega el período por primera vez, y por qué no hay una edad exacta ni una forma correcta de sentir.$$,
  $$## Qué es la menstruación

La menstruación es el sangrado que ocurre una vez al mes como parte del ciclo del cuerpo que prepara el útero para un posible embarazo. Cuando no hay embarazo, el revestimiento del útero se desprende y sale por la vagina en forma de sangrado. Es un proceso normal y saludable, no una enfermedad.

## ¿Cuándo llega?

No hay una edad exacta. La mayoría de las niñas tienen su primera menstruación entre los 10 y los 15 años, aunque puede variar. Suele llegar entre dos y tres años después de que empiezan a notarse otros cambios de la pubertad, como el crecimiento del pecho.

## Qué es normal

- El sangrado puede durar entre 2 y 7 días.
- El color puede variar entre rojo brillante y marrón oscuro.
- Los primeros ciclos pueden ser irregulares — eso es normal mientras el cuerpo se ajusta.
- Sentir molestias leves en el abdomen es común.

## Cuándo buscar ayuda

Si a los 15 años todavía no ha llegado el primer período, o si el dolor es tan fuerte que impide las actividades normales, vale la pena hablar con un profesional de salud.

No hay una forma "correcta" de sentir sobre este cambio: es normal sentir curiosidad, incomodidad, o simplemente indiferencia.$$,
  (select id from public.content_categories where slug = 'pubertad'),
  array['adolescencia']::life_stage[], 0, 5, 'Equipo editorial Cora', '🌷', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'cambios-en-la-pubertad',
  $$Cambios en la pubertad$$,
  $$Los cambios físicos que trae la pubertad, y por qué cada quien los vive a su propio ritmo.$$,
  $$## Un proceso, no un evento

La pubertad es el conjunto de cambios físicos por los que el cuerpo pasa de la niñez a la adultez. No ocurre de un día para otro: suele tomar varios años.

## Cambios comunes

- Crecimiento acelerado de estatura.
- Desarrollo del pecho.
- Aparición de vello en axilas y zona genital.
- Cambios en la piel (más grasa, a veces con acné).
- Inicio de la menstruación.

## El ritmo de cada quien

La edad de inicio varía bastante de una persona a otra, y eso es normal. Compararse con compañeras que ya tuvieron estos cambios — o que todavía no los tienen — no dice nada sobre si el propio desarrollo va bien.

## Cuándo consultar

Si los cambios no han comenzado en absoluto hacia los 13-14 años, es razonable comentarlo con un profesional de salud, más por tranquilidad que por alarma.$$,
  (select id from public.content_categories where slug = 'pubertad'),
  array['adolescencia']::life_stage[], 0, 4, 'Equipo editorial Cora', '🌱', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'higiene-menstrual',
  $$Higiene menstrual$$,
  $$Cómo cuidar la higiene durante el período de forma simple y segura, con las opciones disponibles.$$,
  $$## Por qué importa

Una buena higiene durante la menstruación previene molestias e infecciones, y ayuda a sentirse cómoda durante el día.

## Opciones para el manejo del sangrado

- **Toallas sanitarias:** se cambian cada 4-6 horas aproximadamente.
- **Tampones:** se cambian cada 4-8 horas; nunca se debe dejar puesto más de 8 horas.
- **Copa menstrual:** reutilizable, se vacía cada 8-12 horas.
- **Ropa interior absorbente:** una opción reutilizable adicional.

No existe una opción "correcta" — la mejor es la que resulte más cómoda y accesible para cada persona.

## Hábitos simples que ayudan

- Lavarse las manos antes y después de cambiar el producto.
- Bañarse con normalidad; el agua no interrumpe ni empeora el sangrado.
- Llevar un producto de repuesto si el ciclo es irregular.

## Cuándo buscar ayuda

Picazón intensa, mal olor fuera de lo habitual, o fiebre durante el período son razones para consultar a un profesional de salud.$$,
  (select id from public.content_categories where slug = 'pubertad'),
  array['adolescencia', 'adultez']::life_stage[], 0, 4, 'Equipo editorial Cora', '🧼', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'emociones-y-cambios-en-la-pubertad',
  $$Emociones y cambios en la pubertad$$,
  $$Por qué las emociones se sienten más intensas durante la pubertad, y qué hacer cuando abruman.$$,
  $$## El cuerpo y las emociones están conectados

Durante la pubertad, los cambios hormonales pueden hacer que las emociones se sientan más intensas o cambien con más rapidez. Esto es una respuesta biológica normal, no una señal de que algo anda mal.

## Qué es esperable sentir

- Cambios de ánimo antes del período.
- Mayor sensibilidad a comentarios o situaciones sociales.
- Momentos de irritabilidad o tristeza sin una causa clara.

## Formas de acompañar estas emociones

- Hablar con alguien de confianza sobre lo que se siente.
- Dormir lo suficiente: el descanso influye directamente en el estado de ánimo.
- Recordar que las emociones intensas pasan; no son permanentes.

## Cuándo es momento de pedir apoyo

Si la tristeza, la ansiedad o el desánimo duran semanas y afectan la vida diaria (dormir, comer, ir a la escuela), es momento de hablar con un adulto de confianza o un profesional de salud mental.$$,
  (select id from public.content_categories where slug = 'bienestar-emocional'),
  array['adolescencia']::life_stage[], 0, 3, 'Equipo editorial Cora', '💛', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'mitos-sobre-el-periodo',
  $$Mitos sobre el período$$,
  $$Ideas comunes sobre la menstruación que no tienen base médica, explicadas con claridad.$$,
  $$## Por qué existen tantos mitos

La menstruación ha sido un tema poco hablado durante generaciones, y eso dejó espacio para creencias que no tienen respaldo médico. Aclarar estos mitos ayuda a vivir el período sin miedo ni vergüenza innecesaria.

## Mitos comunes, aclarados

- **"No te podés bañar durante el período."** Falso: bañarse es seguro e higiénico, con agua fría o caliente.
- **"No podés hacer ejercicio menstruando."** Falso: la actividad física es segura y hasta puede aliviar los cólicos.
- **"El período siempre debe ser puntual y regular."** No siempre: los ciclos pueden variar, especialmente en los primeros años.
- **"Perder mucha sangre es normal."** No: un sangrado que empapa una toalla cada hora por varias horas seguidas no es normal y debe consultarse.

## La idea central

La menstruación es un proceso biológico normal, no algo sucio ni un tema del que haya que avergonzarse.$$,
  (select id from public.content_categories where slug = 'pubertad'),
  array['adolescencia', 'adultez']::life_stage[], 0, 3, 'Equipo editorial Cora', '💬', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'a-quien-pedir-ayuda',
  $$A quién pedir ayuda$$,
  $$A dónde acudir en Nicaragua cuando hay dudas sobre salud menstrual, o si algo no se siente bien.$$,
  $$## No hay que resolverlo sola

Tener dudas sobre el cuerpo, el período, o sentirse insegura es completamente normal. Pedir ayuda es un acto de cuidado, no una debilidad.

## A quién acudir

- Un **centro de salud o puesto de salud del MINSA** cercano — la atención es gratuita y universal en Nicaragua.
- Un adulto de confianza: madre, tutora, docente o personal de orientación escolar.
- El personal del servicio de salud escolar, si el centro educativo cuenta con uno.

## Si la situación involucra violencia o abuso

Si alguien se siente insegura, amenazada, o ha vivido una situación de violencia o abuso, es importante buscar ayuda de inmediato en un centro de salud o con un adulto de confianza. Nadie tiene derecho a hacer sentir insegura a otra persona sobre su cuerpo.

## Recordatorio

Hacer preguntas sobre el cuerpo y la salud es parte normal de crecer. Un buen profesional de salud nunca hará sentir mal a alguien por preguntar.$$,
  (select id from public.content_categories where slug = 'derechos-y-comunidad'),
  array['adolescencia']::life_stage[], 0, 4, 'Equipo editorial Cora', '🤝', 3, 'published', '2026-08-01'
);

-- ── Adultez (7) ───────────────────────────────────────────────────────────

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'fases-del-ciclo-menstrual',
  $$Fases del ciclo menstrual$$,
  $$Las cuatro fases del ciclo menstrual explicadas de forma simple, mes a mes.$$,
  $$## Un ciclo, cuatro fases

El ciclo menstrual promedio dura entre 21 y 35 días, contados desde el primer día de un período hasta el primer día del siguiente. Tiene cuatro fases que se repiten.

## Las fases

- **Menstrual (días 1-5 aprox.):** el revestimiento del útero se desprende; es el sangrado.
- **Folicular:** el cuerpo prepara un nuevo óvulo; suele coincidir en parte con el sangrado y continúa después.
- **Ovulación:** se libera un óvulo, generalmente hacia la mitad del ciclo; es el momento de mayor fertilidad.
- **Lútea:** el cuerpo se prepara para un posible embarazo; si no ocurre, comienza un nuevo ciclo.

## Por qué varía de persona a persona

La duración exacta de cada fase varía bastante. Ningún ciclo es "el normal" — lo útil es conocer el propio patrón habitual para notar cuando algo cambia.$$,
  (select id from public.content_categories where slug = 'ciclo'),
  array['adultez']::life_stage[], 0, 4, 'Equipo editorial Cora', '🩸', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'sintomas-comunes-del-ciclo',
  $$Síntomas comunes del ciclo$$,
  $$Los síntomas físicos y emocionales más comunes durante el ciclo, y qué puede ayudar a aliviarlos.$$,
  $$## Síntomas frecuentes

Muchas personas notan cambios físicos y emocionales en distintos momentos del ciclo, especialmente en los días previos al período (síndrome premenstrual) y durante el sangrado.

## Los más comunes

- Cólicos o dolor abdominal bajo.
- Hinchazón y sensibilidad en el pecho.
- Cambios de energía y de ánimo.
- Dolor de cabeza o de espalda baja.
- Cambios en el apetito.

## Qué puede ayudar

- Calor local (una bolsa de agua caliente) sobre el abdomen para los cólicos.
- Actividad física suave, como caminar.
- Dormir lo suficiente.
- Reducir la cafeína en los días de mayores molestias.

## Cuándo consultar

Un dolor tan intenso que impide las actividades diarias mes tras mes no es algo que deba simplemente "aguantarse" — vale la pena consultarlo con un profesional de salud.$$,
  (select id from public.content_categories where slug = 'ciclo'),
  array['adultez', 'adolescencia']::life_stage[], 0, 4, 'Equipo editorial Cora', '🌡️', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'salud-sexual-y-prevencion',
  $$Salud sexual y prevención$$,
  $$Información general sobre salud sexual y prevención de infecciones de transmisión sexual.$$,
  $$## Salud sexual como parte de la salud general

La salud sexual incluye el bienestar físico y emocional relacionado con la sexualidad, así como la prevención de infecciones de transmisión sexual (ITS) y de embarazos no planeados.

## Prevención

- El uso correcto y constante del condón reduce significativamente el riesgo de ITS y de embarazo.
- Hacerse pruebas de detección periódicas es parte del cuidado preventivo, especialmente si hay más de una pareja sexual.
- Hablar abiertamente con la pareja sobre salud sexual reduce riesgos para ambas personas.

## Señales que ameritan consulta

- Molestias, secreciones inusuales o dolor en el área genital.
- Dudas sobre una posible exposición a una ITS.

## Dónde atenderse

Los centros de salud del MINSA ofrecen atención y orientación en salud sexual y reproductiva de forma gratuita.

Este artículo es educativo: cualquier duda específica debe consultarse con un profesional de salud.$$,
  (select id from public.content_categories where slug = 'salud-sexual'),
  array['adultez', 'adolescencia']::life_stage[], 16, 4, 'Equipo editorial Cora', '🌺', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'autoexamen-de-mama',
  $$Autoexamen de mama$$,
  $$Cómo hacer el autoexamen de mama y por qué es una herramienta útil de detección temprana.$$,
  $$## Por qué conocer el propio cuerpo importa

El autoexamen de mama ayuda a familiarizarse con la apariencia y textura normal del pecho, para poder notar cambios con más facilidad. No reemplaza los chequeos médicos, pero es un hábito simple y útil.

## Cómo hacerlo

- Elegir un momento del mes, idealmente unos días después del período, cuando el pecho está menos sensible.
- Observar frente al espejo buscando cambios visibles de tamaño, forma o piel.
- Palpar todo el pecho y la zona de la axila con las yemas de los dedos, en movimientos circulares.

## Qué buscar

- Bultos nuevos que no desaparecen.
- Cambios en la piel (hoyuelos, enrojecimiento).
- Cambios en el pezón o secreción inusual.

## Qué hacer si se nota algo

Encontrar un cambio no significa automáticamente que haya un problema grave, pero sí es motivo para consultar a un profesional de salud para una evaluación.$$,
  (select id from public.content_categories where slug = 'salud-sexual'),
  array['adultez', 'mayor']::life_stage[], 18, 4, 'Equipo editorial Cora', '🎗️', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'nutricion-y-ciclo',
  $$Nutrición y ciclo$$,
  $$Cómo la alimentación puede influir en la energía y los síntomas durante el ciclo menstrual.$$,
  $$## Alimentación y ciclo

Lo que se come no cambia el ciclo en sí, pero puede influir en la energía, el ánimo y algunos síntomas como los cólicos o la hinchazón.

## Hábitos que pueden ayudar

- Mantener comidas regulares evita bajones de energía.
- Incluir alimentos ricos en hierro (frijoles, carnes, vegetales de hoja verde) es útil, especialmente durante el sangrado.
- Beber suficiente agua ayuda a reducir la hinchazón.
- Reducir el exceso de sal y azúcar en los días previos al período puede aliviar molestias.

## No hay alimentos "prohibidos"

No existe evidencia de que algún alimento deba evitarse por completo durante la menstruación. Una alimentación variada y equilibrada es lo que más beneficia al cuerpo en general.$$,
  (select id from public.content_categories where slug = 'nutricion-y-actividad'),
  array['adultez']::life_stage[], 0, 3, 'Equipo editorial Cora', '🥗', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'cuando-consultar-a-un-profesional',
  $$Cuándo consultar a un profesional$$,
  $$Señales del ciclo que ameritan una consulta médica, explicadas con claridad.$$,
  $$## La mayoría de los ciclos son normales

La mayor parte de las variaciones del ciclo no son motivo de preocupación. Pero hay señales que sí ameritan una consulta.

## Señales para consultar

- Sangrado que empapa una toalla o tampón cada hora durante varias horas seguidas.
- Períodos que duran más de 7 días de forma habitual.
- Ausencia de menstruación por 3 meses o más, sin estar embarazada.
- Dolor tan intenso que impide las actividades normales.
- Sangrado entre períodos, de forma repetida.

## Por qué no hay que esperar

Detectar temprano un problema facilita tratarlo. Consultar no significa que algo esté necesariamente mal — es parte del cuidado normal de la salud.

## Dónde acudir

Los centros y puestos de salud del MINSA brindan atención gratuita y son un buen primer paso.$$,
  (select id from public.content_categories where slug = 'ciclo'),
  array['adultez']::life_stage[], 0, 3, 'Equipo editorial Cora', '🏥', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'anticoncepcion-informacion-general',
  $$Anticoncepción: información general$$,
  $$Un panorama general de los métodos anticonceptivos disponibles, sin reemplazar la consulta médica.$$,
  $$## Qué es la anticoncepción

La anticoncepción son los métodos que permiten decidir si y cuándo tener hijos, y cuántos. Elegir un método es una decisión personal que idealmente se conversa con un profesional de salud.

## Tipos generales de métodos

- **De barrera** (como el condón): también ayudan a prevenir infecciones de transmisión sexual.
- **Hormonales** (pastillas, inyectables, implantes): requieren indicación y seguimiento de un profesional de salud.
- **Dispositivos intrauterinos:** de larga duración, colocados por personal médico.
- **Métodos permanentes:** para quienes ya decidieron no tener más hijos.

## Cómo elegir

No existe un método "mejor" para todas las personas — depende de la salud de cada quien, sus planes de vida y sus preferencias. Un profesional de salud puede ayudar a evaluar las opciones según cada caso.

Este artículo es educativo y general; no sustituye una consulta médica para elegir un método específico.$$,
  (select id from public.content_categories where slug = 'salud-sexual'),
  array['adultez', 'adolescencia']::life_stage[], 16, 3, 'Equipo editorial Cora', '🌺', 3, 'published', '2026-08-01'
);

-- ── Embarazo (4) ──────────────────────────────────────────────────────────

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'cambios-trimestre-a-trimestre',
  $$Cambios trimestre a trimestre$$,
  $$Qué esperar del cuerpo en cada trimestre del embarazo, en términos generales.$$,
  $$## El embarazo en tres etapas

El embarazo dura aproximadamente 40 semanas, divididas en tres trimestres, cada uno con cambios propios.

## Primer trimestre (semanas 1-12)

El cuerpo empieza a producir las hormonas del embarazo. Son comunes las náuseas, el cansancio y la sensibilidad en el pecho.

## Segundo trimestre (semanas 13-27)

Suele ser la etapa de mayor energía. El abdomen crece de forma visible y pueden empezar a sentirse los movimientos del bebé.

## Tercer trimestre (semanas 28-40)

El cuerpo se prepara para el parto. Son comunes la fatiga, el dolor de espalda y la dificultad para dormir por el tamaño del abdomen.

## Lo importante

Cada embarazo es distinto. Los controles prenatales regulares son la mejor forma de dar seguimiento a estos cambios de forma segura.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 4, 'Equipo editorial Cora', '🤰', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'senales-de-alerta-en-el-embarazo',
  $$Señales de alerta en el embarazo$$,
  $$Señales durante el embarazo que requieren atención médica inmediata.$$,
  $$## Por qué conocerlas importa

La mayoría de los embarazos avanzan sin complicaciones, pero reconocer señales de alerta a tiempo puede salvar vidas.

## Señales que requieren atención inmediata

- Sangrado vaginal abundante.
- Dolor de cabeza muy fuerte que no mejora.
- Hinchazón repentina de cara, manos o pies.
- Visión borrosa o ver luces.
- Fiebre alta.
- Disminución notable de los movimientos del bebé.
- Dolor abdominal intenso.

## Qué hacer

Ante cualquiera de estas señales, se debe acudir de inmediato al centro de salud u hospital más cercano — no esperar a la siguiente cita programada.

## El contexto en cifras

Según la OMS, más de 700 mujeres mueren cada día en el mundo por causas prevenibles relacionadas con el embarazo y el parto — la gran mayoría de esas muertes se puede evitar con atención oportuna.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 5, 'Equipo editorial Cora', '🚨', 4, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'controles-prenatales-en-nicaragua',
  $$Controles prenatales en Nicaragua$$,
  $$Qué son los controles prenatales, por qué son gratuitos en Nicaragua, y con qué frecuencia se recomienda asistir.$$,
  $$## Qué son los controles prenatales

Son las consultas periódicas durante el embarazo donde personal de salud revisa el estado de la madre y el bebé, y detecta a tiempo cualquier complicación.

## Disponibilidad en Nicaragua

El Ministerio de Salud (MINSA) garantiza acceso gratuito y universal a los servicios de salud, incluyendo los controles prenatales, en los centros y puestos de salud de todo el país.

## Qué incluye una consulta típica

- Medición de peso y presión arterial.
- Revisión del crecimiento del embarazo.
- Escucha de los latidos del bebé.
- Espacio para resolver dudas y síntomas.

## Frecuencia recomendada

En términos generales, se recomienda iniciar los controles lo antes posible al confirmar el embarazo, y mantener consultas regulares durante toda la gestación según indique el personal de salud.

## Por qué no saltarse ninguna

Cada control es una oportunidad de detectar a tiempo señales de alerta antes de que se conviertan en una emergencia.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 5, 'Equipo editorial Cora', '🏥', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'alimentacion-en-el-embarazo',
  $$Alimentación en el embarazo$$,
  $$Principios generales de una alimentación saludable durante el embarazo.$$,
  $$## Comer por dos no significa el doble

Un mito común es que hay que "comer por dos" durante el embarazo. En realidad, las necesidades de energía aumentan solo moderadamente; lo que más importa es la calidad de la alimentación.

## Principios generales

- Incluir variedad: frutas, verduras, granos integrales, proteínas y lácteos.
- Los alimentos ricos en hierro y ácido fólico (vegetales de hoja verde, frijoles) son especialmente importantes.
- Mantenerse hidratada durante todo el día.
- Reducir alimentos ultraprocesados y con exceso de azúcar o sal.

## Precauciones básicas

Evitar alimentos crudos o mal cocidos (carnes, huevos, pescado) y lácteos no pasteurizados reduce el riesgo de infecciones que pueden afectar el embarazo.

Cada embarazo tiene necesidades particulares — el personal de salud que da seguimiento al control prenatal puede orientar sobre necesidades específicas.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 3, 'Equipo editorial Cora', '🥗', 3, 'published', '2026-08-01'
);

-- ── Perimenopausia (4) ────────────────────────────────────────────────────

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'que-es-la-perimenopausia',
  $$Qué es la perimenopausia$$,
  $$Qué es la perimenopausia, cuándo suele comenzar y qué cambios trae.$$,
  $$## Una transición, no un evento único

La perimenopausia es la etapa de transición antes de la menopausia, en la que los niveles hormonales empiezan a cambiar y los períodos se vuelven irregulares hasta detenerse por completo.

## Cuándo suele ocurrir

Generalmente comienza entre los 40 y los 50 años, aunque puede variar. Puede durar varios años antes de llegar a la menopausia (definida como 12 meses seguidos sin período).

## Cambios comunes

- Períodos más irregulares, más cortos o más largos.
- Sofocos y sudoración nocturna.
- Cambios en el sueño y el ánimo.
- Sequedad vaginal.

## No es una enfermedad

Es una etapa natural del cuerpo. Existen formas de manejar las molestias, y un profesional de salud puede orientar sobre las opciones disponibles según cada caso.$$,
  (select id from public.content_categories where slug = 'perimenopausia'),
  array['perimenopausia']::life_stage[], 0, 4, 'Equipo editorial Cora', '🌙', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'sofocos-y-sueno',
  $$Sofocos y sueño$$,
  $$Por qué ocurren los sofocos en la perimenopausia y qué puede ayudar a dormir mejor.$$,
  $$## Qué son los sofocos

Los sofocos son sensaciones repentinas de calor, a veces acompañadas de sudoración y enrojecimiento, causadas por los cambios hormonales de la perimenopausia. Pueden ocurrir también de noche, afectando el sueño.

## Qué puede ayudar

- Usar ropa ligera y en capas, fácil de quitar.
- Mantener la habitación fresca al dormir.
- Evitar disparadores comunes como el alcohol, la cafeína y las comidas picantes en la noche.
- Técnicas de respiración lenta cuando comienza un sofoco.

## Sobre el sueño

Los sofocos nocturnos son una de las causas más comunes de sueño interrumpido en esta etapa. Mantener una rutina de sueño constante y un ambiente fresco y oscuro puede ayudar.

## Cuándo consultar

Si los sofocos son muy frecuentes o afectan seriamente la calidad de vida, existen opciones de manejo que un profesional de salud puede evaluar.$$,
  (select id from public.content_categories where slug = 'perimenopausia'),
  array['perimenopausia']::life_stage[], 0, 4, 'Equipo editorial Cora', '🔥', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'salud-osea-en-la-perimenopausia',
  $$Salud ósea en la perimenopausia$$,
  $$Por qué la salud ósea cobra más importancia en esta etapa, y hábitos que ayudan a cuidarla.$$,
  $$## Por qué importa ahora

La disminución de estrógeno durante la perimenopausia y la menopausia acelera la pérdida de densidad ósea, lo que aumenta el riesgo de fracturas con el tiempo.

## Hábitos que fortalecen los huesos

- Consumir suficiente calcio: lácteos, vegetales de hoja verde, y otros alimentos fortificados.
- La exposición moderada al sol ayuda al cuerpo a producir vitamina D.
- El ejercicio con peso corporal (caminar, subir escaleras) ayuda a mantener la densidad ósea.
- Evitar el tabaco, que acelera la pérdida ósea.

## Chequeos recomendados

Conversar con un profesional de salud sobre la salud ósea en esta etapa es una buena práctica, especialmente si hay antecedentes familiares de osteoporosis.$$,
  (select id from public.content_categories where slug = 'perimenopausia'),
  array['perimenopausia', 'mayor']::life_stage[], 0, 3, 'Equipo editorial Cora', '🦴', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'bienestar-emocional-en-la-perimenopausia',
  $$Bienestar emocional en la perimenopausia$$,
  $$Cómo los cambios hormonales pueden afectar el ánimo en la perimenopausia, y qué ayuda a sobrellevarlo.$$,
  $$## Una conexión real

Los cambios hormonales de la perimenopausia pueden afectar el estado de ánimo, generando irritabilidad, ansiedad o tristeza en algunas personas. No es "solo psicológico" — tiene una base física real.

## Qué puede ayudar

- Mantener una rutina de sueño y actividad física regular.
- Hablar abiertamente sobre lo que se siente, con personas de confianza.
- Dedicar tiempo a actividades que generen bienestar.

## Cuándo buscar apoyo profesional

Si la tristeza o la ansiedad son persistentes, intensas, o afectan la vida diaria de forma importante, buscar apoyo de un profesional de salud mental es una decisión válida y recomendable — no una señal de debilidad.$$,
  (select id from public.content_categories where slug = 'bienestar-emocional'),
  array['perimenopausia']::life_stage[], 0, 3, 'Equipo editorial Cora', '💛', 3, 'published', '2026-08-01'
);

-- ── Adultez mayor (2) ─────────────────────────────────────────────────────

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'prevencion-y-chequeos',
  $$Prevención y chequeos$$,
  $$Chequeos de salud preventivos recomendados en la adultez mayor.$$,
  $$## La prevención no tiene edad límite

Los chequeos regulares ayudan a detectar a tiempo condiciones que, atendidas temprano, tienen mejores resultados.

## Chequeos a considerar

- Control de presión arterial.
- Exámenes de detección de cáncer de mama, según indicación médica.
- Control de glucosa y salud cardiovascular.
- Revisión de la vista y del oído.
- Salud ósea.

## Por qué no postergarlos

Muchas condiciones no dan síntomas en etapas tempranas. Un chequeo regular es una de las formas más simples de cuidar la salud a largo plazo.

## Dónde atenderse

Los centros de salud del MINSA ofrecen atención preventiva gratuita para la población.$$,
  (select id from public.content_categories where slug = 'nutricion-y-actividad'),
  array['mayor']::life_stage[], 0, 4, 'Equipo editorial Cora', '🩺', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'actividad-fisica-y-bienestar',
  $$Actividad física y bienestar$$,
  $$Por qué mantenerse activa en la adultez mayor beneficia el cuerpo y el ánimo.$$,
  $$## Moverse a cualquier edad

La actividad física regular reduce el riesgo de enfermedades cardiovasculares, fortalece los huesos y músculos, y mejora el ánimo — beneficios que no desaparecen con la edad.

## Tipos de actividad recomendados

- Caminar a paso constante, varias veces por semana.
- Ejercicios suaves de fuerza, como levantar objetos livianos.
- Actividades de equilibrio, útiles para prevenir caídas.
- Actividades sociales que incluyan movimiento, como el baile.

## Cómo empezar con seguridad

No hace falta empezar con actividades intensas. Lo importante es la constancia: un poco de movimiento todos los días es mejor que una actividad intensa ocasional.

Ante cualquier condición de salud existente, es recomendable consultar con un profesional de salud antes de empezar una nueva rutina de actividad física.$$,
  (select id from public.content_categories where slug = 'nutricion-y-actividad'),
  array['mayor']::life_stage[], 0, 3, 'Equipo editorial Cora', '🚶', 3, 'published', '2026-08-01'
);

-- ── Transversal (2) ───────────────────────────────────────────────────────

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'derechos-en-salud-en-nicaragua',
  $$Derechos en salud en Nicaragua$$,
  $$Qué garantiza el sistema de salud en Nicaragua, y por qué conocer estos derechos importa.$$,
  $$## Un derecho, no un favor

El acceso a la salud es un derecho. En Nicaragua, el Ministerio de Salud (MINSA) garantiza el acceso gratuito y universal a los servicios de salud pública para toda la población.

## Qué esto significa en la práctica

- Cualquier persona puede acudir a un centro o puesto de salud público sin costo.
- La atención incluye consultas generales, control prenatal, planificación familiar y atención de emergencias, entre otros servicios.
- Toda persona tiene derecho a recibir información clara sobre su propia salud.

## Sobre la violencia y el abuso

Nadie tiene derecho a ejercer violencia física, sexual o psicológica sobre otra persona. Existen rutas de atención y protección disponibles a través del sistema de salud y otras instituciones del Estado.

## Por qué conocer estos derechos importa

Conocerlos ayuda a buscar ayuda con más confianza y a exigir un trato digno en cualquier servicio de salud.$$,
  (select id from public.content_categories where slug = 'derechos-y-comunidad'),
  array['adolescencia', 'adultez', 'embarazo', 'perimenopausia', 'mayor']::life_stage[], 0, 3, 'Equipo editorial Cora', '🤝', 3, 'published', '2026-08-01'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'salud-mental-cuando-buscar-apoyo',
  $$Salud mental: cuándo buscar apoyo$$,
  $$Señales de que es momento de buscar apoyo de salud mental, en cualquier etapa de la vida.$$,
  $$## La salud mental es parte de la salud

Así como el cuerpo puede enfermarse, la mente también puede pasar por momentos difíciles. Buscar apoyo para la salud mental es tan válido como buscarlo para cualquier otra condición de salud.

## Señales para prestar atención

- Tristeza, ansiedad o irritabilidad que duran semanas.
- Cambios notables en el sueño o el apetito.
- Pérdida de interés en actividades que antes generaban disfrute.
- Dificultad para concentrarse en las tareas diarias.
- Pensamientos de que la vida no vale la pena vivirse.

## Qué hacer

Hablar con alguien de confianza es un buen primer paso. Los centros de salud también pueden orientar sobre los servicios de salud mental disponibles.

## Un dato importante

Según la OMS, más de mil millones de personas en el mundo viven con alguna condición de salud mental — buscar ayuda es común y no hay nada de qué avergonzarse.$$,
  (select id from public.content_categories where slug = 'bienestar-emocional'),
  array['adolescencia', 'adultez', 'embarazo', 'perimenopausia', 'mayor']::life_stage[], 0, 4, 'Equipo editorial Cora', '🧠', 3, 'published', '2026-08-01'
);

-- ── Fuentes citadas (≥1 por artículo, URLs verificadas con WebFetch) ──────

insert into public.content_sources (content_id, label, organization, url, published_year, sort_order) values
  ((select id from public.educational_content where slug = 'tu-primera-menstruacion'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 1),
  ((select id from public.educational_content where slug = 'cambios-en-la-pubertad'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 1),
  ((select id from public.educational_content where slug = 'cambios-en-la-pubertad'), 'Sexual and reproductive health', 'PAHO/OPS', 'https://www.paho.org/en/topics/sexual-and-reproductive-health', 2026, 2),
  ((select id from public.educational_content where slug = 'higiene-menstrual'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 1),
  ((select id from public.educational_content where slug = 'emociones-y-cambios-en-la-pubertad'), 'Mental health: strengthening our response', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response', 2026, 1),
  ((select id from public.educational_content where slug = 'mitos-sobre-el-periodo'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 1),
  ((select id from public.educational_content where slug = 'a-quien-pedir-ayuda'), 'Sitio oficial', 'MINSA Nicaragua', 'https://www.minsa.gob.ni/', 2026, 1),
  ((select id from public.educational_content where slug = 'a-quien-pedir-ayuda'), 'Violence against women', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women', 2026, 2),
  ((select id from public.educational_content where slug = 'fases-del-ciclo-menstrual'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 1),
  ((select id from public.educational_content where slug = 'sintomas-comunes-del-ciclo'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 1),
  ((select id from public.educational_content where slug = 'sintomas-comunes-del-ciclo'), 'Physical activity', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/physical-activity', 2024, 2),
  ((select id from public.educational_content where slug = 'salud-sexual-y-prevencion'), 'Sexual and reproductive health', 'PAHO/OPS', 'https://www.paho.org/en/topics/sexual-and-reproductive-health', 2026, 1),
  ((select id from public.educational_content where slug = 'salud-sexual-y-prevencion'), 'Family planning/contraception', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception', 2025, 2),
  ((select id from public.educational_content where slug = 'autoexamen-de-mama'), 'Breast cancer', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/breast-cancer', 2026, 1),
  ((select id from public.educational_content where slug = 'nutricion-y-ciclo'), 'Healthy diet', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', 2026, 1),
  ((select id from public.educational_content where slug = 'cuando-consultar-a-un-profesional'), 'Sitio oficial', 'MINSA Nicaragua', 'https://www.minsa.gob.ni/', 2026, 1),
  ((select id from public.educational_content where slug = 'cuando-consultar-a-un-profesional'), 'Periods', 'NHS', 'https://www.nhs.uk/conditions/periods/', 2026, 2),
  ((select id from public.educational_content where slug = 'anticoncepcion-informacion-general'), 'Family planning/contraception', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception', 2025, 1),
  ((select id from public.educational_content where slug = 'anticoncepcion-informacion-general'), 'Contraception', 'NHS', 'https://www.nhs.uk/conditions/contraception/', 2026, 2),
  ((select id from public.educational_content where slug = 'cambios-trimestre-a-trimestre'), 'Keeping well in pregnancy', 'NHS', 'https://www.nhs.uk/pregnancy/keeping-well/', 2026, 1),
  ((select id from public.educational_content where slug = 'senales-de-alerta-en-el-embarazo'), 'Maternal mortality', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/maternal-mortality', 2026, 1),
  ((select id from public.educational_content where slug = 'senales-de-alerta-en-el-embarazo'), 'Maternal health', 'PAHO/OPS', 'https://www.paho.org/en/topics/maternal-health', 2026, 2),
  ((select id from public.educational_content where slug = 'controles-prenatales-en-nicaragua'), 'Sitio oficial', 'MINSA Nicaragua', 'https://www.minsa.gob.ni/', 2026, 1),
  ((select id from public.educational_content where slug = 'controles-prenatales-en-nicaragua'), 'Maternal health', 'PAHO/OPS', 'https://www.paho.org/en/topics/maternal-health', 2026, 2),
  ((select id from public.educational_content where slug = 'alimentacion-en-el-embarazo'), 'Healthy diet', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', 2026, 1),
  ((select id from public.educational_content where slug = 'alimentacion-en-el-embarazo'), 'Keeping well in pregnancy', 'NHS', 'https://www.nhs.uk/pregnancy/keeping-well/', 2026, 2),
  ((select id from public.educational_content where slug = 'que-es-la-perimenopausia'), 'Menopause', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/menopause', 2026, 1),
  ((select id from public.educational_content where slug = 'que-es-la-perimenopausia'), 'Menopause', 'NHS', 'https://www.nhs.uk/conditions/menopause/', 2026, 2),
  ((select id from public.educational_content where slug = 'sofocos-y-sueno'), 'Menopause', 'NHS', 'https://www.nhs.uk/conditions/menopause/', 2026, 1),
  ((select id from public.educational_content where slug = 'salud-osea-en-la-perimenopausia'), 'Healthy diet', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', 2026, 1),
  ((select id from public.educational_content where slug = 'salud-osea-en-la-perimenopausia'), 'Physical activity', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/physical-activity', 2024, 2),
  ((select id from public.educational_content where slug = 'bienestar-emocional-en-la-perimenopausia'), 'Mental health: strengthening our response', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response', 2026, 1),
  ((select id from public.educational_content where slug = 'bienestar-emocional-en-la-perimenopausia'), 'Menopause', 'NHS', 'https://www.nhs.uk/conditions/menopause/', 2026, 2),
  ((select id from public.educational_content where slug = 'prevencion-y-chequeos'), 'Healthy aging', 'PAHO/OPS', 'https://www.paho.org/en/topics/healthy-aging', 2026, 1),
  ((select id from public.educational_content where slug = 'prevencion-y-chequeos'), 'Breast cancer', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/breast-cancer', 2026, 2),
  ((select id from public.educational_content where slug = 'actividad-fisica-y-bienestar'), 'Physical activity', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/physical-activity', 2024, 1),
  ((select id from public.educational_content where slug = 'actividad-fisica-y-bienestar'), 'Healthy aging', 'PAHO/OPS', 'https://www.paho.org/en/topics/healthy-aging', 2026, 2),
  ((select id from public.educational_content where slug = 'derechos-en-salud-en-nicaragua'), 'Sitio oficial', 'MINSA Nicaragua', 'https://www.minsa.gob.ni/', 2026, 1),
  ((select id from public.educational_content where slug = 'derechos-en-salud-en-nicaragua'), 'Violence against women', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women', 2026, 2),
  ((select id from public.educational_content where slug = 'salud-mental-cuando-buscar-apoyo'), 'Mental health: strengthening our response', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response', 2026, 1);
