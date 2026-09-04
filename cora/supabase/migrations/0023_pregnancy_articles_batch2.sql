-- Fase 24 — 10 artículos nuevos de la categoría "embarazo" (14 en total con
-- los 4 de 0009_seed_content.sql). Mismo criterio editorial que esa
-- migración: toda afirmación clínica lleva fuente real (NHS/OMS), ningún
-- artículo indica dosis ni medicamentos, ninguno tiene reviewed_by_name real
-- todavía (se publican honestamente sin sello de revisión profesional).
-- URLs verificadas con WebFetch antes de escribir este archivo.

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'nauseas-y-vomitos-en-el-embarazo',
  $$Náuseas y vómitos del embarazo$$,
  $$Por qué son comunes al principio del embarazo, y cuándo dejan de ser algo normal.$$,
  $$## Qué tan común es

Las náuseas y los vómitos —conocidos popularmente como "achaques"— son muy comunes al principio del embarazo, sobre todo por las mañanas, aunque pueden aparecer a cualquier hora del día.

## Cuánto suelen durar

Generalmente empiezan en las primeras semanas y mejoran hacia las semanas 16 a 20. No aumentan el riesgo para el bebé.

## Qué puede ayudar

- Comer porciones pequeñas y frecuentes en vez de comidas grandes.
- Evitar olores o alimentos que disparen las náuseas.
- Descansar lo suficiente — el cansancio puede empeorarlas.
- Jengibre en infusión, que a algunas mujeres les ayuda.

## Cuándo consultar

Si no lográs retener comida ni líquidos durante 24 horas, sentís debilidad o mareo fuerte, tenés dolor abdominal, fiebre, vomitás con sangre, o bajás de peso, hay que consultar pronto — puede tratarse de hiperémesis gravídica, una forma más intensa que a veces requiere atención hospitalaria.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 4, 'Equipo editorial Cora', '🤢', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'salud-emocional-durante-el-embarazo',
  $$Salud emocional durante el embarazo$$,
  $$La ansiedad y la tristeza durante el embarazo son comunes y tratables — no hay nada de qué avergonzarse en pedir ayuda.$$,
  $$## No estás sola

El embarazo puede ser una etapa de mucha alegría, pero también de estrés — es común que aparezcan la ansiedad o la tristeza por primera vez, o que síntomas que ya tenías vuelvan a aparecer.

## Qué se puede sentir

Dificultad para dormir, cambios en el apetito, o sentir que cuesta más de lo normal disfrutar el día a día. Todo esto puede afectar también el vínculo que se empieza a construir con el bebé.

## Qué ayuda

- La terapia de conversación (como la terapia cognitivo-conductual) suele ayudar bastante con la ansiedad y la tristeza del embarazo.
- Mantenerse activa: la actividad física regular ayuda al ánimo y al sueño.
- Hablar con alguien de confianza sobre cómo te sentís, sin minimizarlo.
- Si ya tomás medicación para la salud mental, no la dejés por tu cuenta al quedar embarazada — conversalo primero con el personal de salud, que puede ayudarte a decidir si conviene seguir o cambiar de tratamiento.

## Cuándo buscar ayuda

Si la tristeza o la ansiedad no mejoran, o interfieren con tu día a día, contactar al personal de salud que te da seguimiento es el primer paso — hay servicios de salud mental pensados específicamente para el embarazo y el posparto.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 5, 'Equipo editorial Cora', '💛', 4, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'ejercicio-seguro-en-el-embarazo',
  $$Ejercicio seguro en el embarazo$$,
  $$Moverse durante el embarazo no es peligroso para el bebé — al contrario, ayuda. Qué se recomienda y qué evitar.$$,
  $$## No es peligroso

Hacer ejercicio durante el embarazo no pone en riesgo al bebé. Las mujeres que se mantienen activas suelen tener menos complicaciones más adelante en el embarazo y durante el parto.

## Cuánto moverse

Como referencia general, unos 30 minutos de caminata al día es una buena meta — pero cualquier cantidad de movimiento es mejor que nada. Una forma simple de medir la intensidad: si podés mantener una conversación mientras te movés, vas bien.

## Qué evitar

- Deportes de contacto (boxeo, judo, artes marciales).
- Buceo.
- Actividades con alto riesgo de caída, como montar a caballo o esquiar.
- Ejercicio en altitudes muy elevadas si no estás acostumbrada.

## Lo importante

Cada embarazo es distinto — si tenés alguna condición médica o el embarazo tiene alguna particularidad, conversá con el personal de salud sobre qué tipo de actividad es la más adecuada para vos.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 3, 'Equipo editorial Cora', '🚶‍♀️', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'sueno-y-descanso-en-el-embarazo',
  $$Sueño y descanso en el embarazo$$,
  $$Por qué cuesta más dormir bien durante el embarazo, y algunos hábitos que pueden ayudar.$$,
  $$## Al principio

Es común sentirse muy cansada en las primeras 12 semanas — los cambios hormonales pueden dejarte agotada, con náuseas y más sensible emocionalmente. Descansar todo lo que se pueda es la mejor respuesta en esta etapa.

## Más adelante

Hacia el final del embarazo, el cansancio vuelve, esta vez por el peso extra que se carga — y dormir boca abajo o boca arriba se vuelve incómodo, además de que las ganas frecuentes de orinar interrumpen el sueño.

## Qué puede ayudar

- Buscar relajarte antes de dormir — algunas técnicas de relajación que se enseñan en las clases prenatales pueden ayudar.
- Evitar café, té o bebidas con cafeína por la tarde/noche, porque dificultan conciliar el sueño.
- Mantenerte activa durante el día: el ejercicio moderado ayuda a sentirse menos cansada en general.
- Buscar una postura cómoda para dormir de lado, con almohadas de apoyo si hace falta.

Si el cansancio es extremo o te preocupa, es un buen tema para conversar en tu próximo control prenatal.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 2, 'Equipo editorial Cora', '😴', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'vacunas-recomendadas-en-el-embarazo',
  $$Vacunas recomendadas en el embarazo$$,
  $$Qué vacunas se recomiendan durante el embarazo, y por qué protegen tanto a la madre como al bebé.$$,
  $$## Por qué vacunarse durante el embarazo

Durante el embarazo el sistema inmunológico se ajusta para proteger el embarazo, lo que puede hacer que ciertas infecciones sean más riesgosas — algunas vacunas ayudan a protegerte a vos y, a través tuyo, al bebé.

## Vacunas que sí se recomiendan

- **Influenza (gripe):** reduce el riesgo de complicaciones serias durante el embarazo.
- **Tos ferina (pertussis):** el cuerpo genera anticuerpos que pasan al bebé y lo protegen en sus primeros meses de vida, cuando todavía es muy vulnerable.
- Otras vacunas según disponibilidad y recomendación del personal de salud que te atiende.

## Vacunas que se evitan

Las vacunas de virus vivos (como la triple viral/MMR o la de fiebre amarilla) generalmente no se aplican durante el embarazo — cualquier vacuna, incluidas las de viaje, conviene consultarla primero con tu personal de salud.

## Lo importante

El calendario y la disponibilidad de vacunas varía según el país y el centro de salud — tu control prenatal es el mejor lugar para preguntar cuáles te corresponden y cuándo.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 4, 'Equipo editorial Cora', '💉', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'diabetes-gestacional',
  $$Diabetes gestacional: qué es y el tamizaje$$,
  $$Azúcar alta en la sangre que aparece durante el embarazo — qué significa, quién tiene más riesgo, y cómo se detecta.$$,
  $$## Qué es

La diabetes gestacional es azúcar (glucosa) alta en la sangre que se desarrolla durante el embarazo, generalmente porque el cuerpo no logra producir suficiente insulina para las necesidades extra del embarazo. En la mayoría de los casos desaparece después del parto.

## Quién tiene más riesgo

- Tener más de 40 años.
- Tener un peso corporal considerablemente por encima del rango habitual.
- Haber tenido un bebé de más de 4.5 kg en un embarazo anterior.
- Haber tenido diabetes gestacional en un embarazo previo.
- Tener antecedentes familiares de diabetes.

## Cómo se detecta

El tamizaje habitual es una prueba de tolerancia a la glucosa, que se hace entre las semanas 24 y 28 del embarazo en quienes tienen factores de riesgo: se toma una muestra de sangre en ayunas, se toma una bebida con glucosa, y se vuelve a medir la sangre dos horas después.

## Por qué importa detectarla

Con seguimiento y los ajustes que indique el personal de salud, la mayoría de los embarazos con diabetes gestacional llegan bien a término — por eso el control prenatal regular es tan importante.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 4, 'Equipo editorial Cora', '🩸', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'preeclampsia-senales-de-alerta',
  $$Preeclampsia: señales que no hay que ignorar$$,
  $$Una complicación del embarazo relacionada con la presión arterial — qué señales buscar y cuándo pedir ayuda de inmediato.$$,
  $$## Qué es

La preeclampsia es una complicación que puede aparecer desde la semana 20 del embarazo en adelante (aunque en raras ocasiones puede aparecer antes, o incluso después del parto), caracterizada por presión arterial alta junto con proteína en la orina.

## Señales de alerta

- Dolor de cabeza fuerte que no mejora con analgésicos comunes.
- Cambios en la visión: ver borroso, luces o destellos.
- Dolor en la parte alta del abdomen.
- Hinchazón repentina de cara, manos o pies.
- Acidez/ardor persistente que no se quita.

## Qué hacer

Si estás embarazada o diste a luz hace pocas semanas y notás cualquiera de estas señales, hay que llamar de inmediato a tu maternidad o acudir a un centro de salud — no esperar a la próxima cita.

## Sobre el tratamiento

No existe una cura para la preeclampsia en sí, pero sí hay formas de manejarla: el personal de salud arma un plan de seguimiento con controles y, si hace falta, medicación para reducir riesgos — por eso detectarla a tiempo es tan importante.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 5, 'Equipo editorial Cora', '⚠️', 4, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'preparacion-para-la-lactancia',
  $$Preparación para la lactancia$$,
  $$Qué recomiendan la OMS y UNICEF sobre la lactancia, y algunas ideas para prepararte antes de que nazca el bebé.$$,
  $$## Qué recomiendan OMS y UNICEF

La recomendación es iniciar la lactancia dentro de la primera hora después del nacimiento, darle solo pecho (lactancia exclusiva) durante los primeros 6 meses, y seguir con pecho hasta los 2 años o más mientras se van incorporando alimentos complementarios adecuados desde los 6 meses.

## Por qué importa

La lactancia exclusiva durante los primeros 6 meses, seguida de continuar dando pecho, podría prevenir cientos de miles de muertes infantiles cada año a nivel mundial — aun así, a nivel global, menos de la mitad de los bebés reciben lactancia exclusiva en ese período, así que no lograrlo del todo también es común y no es un fracaso.

## Prepararte antes de que nazca

- Informarte sobre técnicas de agarre y postura — muchos centros de salud ofrecen orientación antes o justo después del parto.
- Preguntar en tu control prenatal qué apoyo de lactancia está disponible en el lugar donde vas a dar a luz.
- Saber que es normal necesitar ayuda al principio — pedir apoyo a personal de salud no es señal de que algo esté mal.

## Lo importante

Cada bebé y cada cuerpo son distintos — si la lactancia se complica, hay apoyo disponible, y las decisiones sobre alimentación siempre se toman junto con el personal de salud.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 3, 'Equipo editorial Cora', '🤱', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'plan-de-parto',
  $$Plan de parto: qué es y por qué armarlo$$,
  $$Un plan de parto ayuda a comunicar tus preferencias para el trabajo de parto y el nacimiento — qué incluir y por qué mantenerlo flexible.$$,
  $$## Qué es

Un plan de parto es un documento donde anotás qué te gustaría que pase durante el trabajo de parto, el nacimiento y después — no es obligatorio tenerlo, pero si querés hacer uno, el personal de salud que te acompaña puede ayudarte.

## Cuándo armarlo

Se recomienda empezar a pensarlo alrededor de las semanas 30 a 35 del embarazo, aunque podés empezar antes si querés.

## Qué incluir

- Dónde te gustaría dar a luz (según lo que esté disponible: en casa, en una unidad de partería, o en un hospital).
- Si querés que alguien te acompañe durante el parto, como tu pareja o un familiar.
- Preferencias sobre manejo del dolor.
- Uso de algún recurso especial, como una tina para el parto en agua, si está disponible.
- Preferencias sobre lactancia y sobre procedimientos para el bebé recién nacido.

## Mantenerlo flexible

El parto no siempre sigue el plan tal cual — a veces hay que hacer cambios de último momento por la seguridad tuya o del bebé. El personal de salud te va a acompañar para tomar esas decisiones en el momento, y podés cambiar de opinión sobre tus preferencias en cualquier momento.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 3, 'Equipo editorial Cora', '📝', 3, 'published', '2026-09-04'
);

insert into public.educational_content
  (slug, title, summary, body_md, category_id, life_stages, min_age, importance, author_name, cover_emoji, reading_minutes, status, published_at)
values (
  'cuidados-en-el-posparto-inmediato',
  $$Cuidados en el posparto inmediato$$,
  $$Qué esperar de tu cuerpo y tus emociones en los primeros días después del parto, y cuándo pedir ayuda.$$,
  $$## Recuperación física

Vas a sangrar después del parto — al principio puede ser bastante, y vas a necesitar toallas de alta absorción. Después de un parto vaginal es normal sentir molestia por unos días, pero en general se puede retomar la actividad normal con relativa rapidez.

## Qué revisa el personal de salud

Después de dar a luz, el equipo de salud controla que te estés recuperando bien: temperatura, pulso, presión arterial, y que el útero se esté encogiendo de vuelta a su tamaño normal.

## Tus emociones

Sentirte llorosa, sensible o ansiosa durante la primera semana es normal. Si esos sentimientos aparecen más tarde o duran más de dos semanas después del parto, puede ser una señal de depresión posparto — vale la pena hablarlo pronto con tu partera o médico/a.

## Cuándo pedir ayuda con urgencia

Buscá atención de inmediato si tenés sangrado abundante repentino con mareo o palpitaciones fuertes, o señales de infección (fiebre, dolor abdominal que empeora, mal olor en el sangrado). El sangrado normal suele parar entre las 6 y 8 semanas después del parto, pero puede durar un poco más — si te preocupa, consultalo.$$,
  (select id from public.content_categories where slug = 'embarazo'),
  array['embarazo']::life_stage[], 0, 4, 'Equipo editorial Cora', '🌸', 4, 'published', '2026-09-04'
);

-- ── Fuentes citadas (URLs verificadas con WebFetch) ───────────────────────

insert into public.content_sources (content_id, label, organization, url, published_year, sort_order) values
  ((select id from public.educational_content where slug = 'nauseas-y-vomitos-en-el-embarazo'), 'Vomiting and morning sickness', 'NHS', 'https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/vomiting-and-morning-sickness/', 2026, 1),
  ((select id from public.educational_content where slug = 'salud-emocional-durante-el-embarazo'), 'Mental health in pregnancy', 'NHS', 'https://www.nhs.uk/pregnancy/keeping-well/mental-health/', 2026, 1),
  ((select id from public.educational_content where slug = 'ejercicio-seguro-en-el-embarazo'), 'Exercise in pregnancy', 'NHS', 'https://www.nhs.uk/pregnancy/keeping-well/exercise/', 2026, 1),
  ((select id from public.educational_content where slug = 'sueno-y-descanso-en-el-embarazo'), 'Tiredness and sleep problems in pregnancy', 'NHS', 'https://www.nhs.uk/pregnancy/common-symptoms/tiredness/', 2026, 1),
  ((select id from public.educational_content where slug = 'vacunas-recomendadas-en-el-embarazo'), 'Vaccinations in pregnancy', 'NHS', 'https://www.nhs.uk/pregnancy/keeping-well/vaccinations/', 2026, 1),
  ((select id from public.educational_content where slug = 'diabetes-gestacional'), 'Gestational diabetes', 'NHS', 'https://www.nhs.uk/conditions/gestational-diabetes/', 2026, 1),
  ((select id from public.educational_content where slug = 'preeclampsia-senales-de-alerta'), 'Pre-eclampsia', 'NHS', 'https://www.nhs.uk/conditions/pre-eclampsia/', 2026, 1),
  ((select id from public.educational_content where slug = 'preeclampsia-senales-de-alerta'), 'Maternal mortality', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/maternal-mortality', 2026, 2),
  ((select id from public.educational_content where slug = 'preparacion-para-la-lactancia'), 'Infant and young child feeding', 'OMS/WHO', 'https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding', 2025, 1),
  ((select id from public.educational_content where slug = 'plan-de-parto'), 'What to include in your birth plan', 'NHS', 'https://www.nhs.uk/pregnancy/labour-and-birth/preparing-for-the-birth/how-to-make-a-birth-plan/', 2026, 1),
  ((select id from public.educational_content where slug = 'cuidados-en-el-posparto-inmediato'), 'Early days', 'NHS', 'https://www.nhs.uk/pregnancy/labour-and-birth/after-the-birth/early-days/', 2026, 1);
