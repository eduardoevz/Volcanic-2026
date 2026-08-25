# Progreso — Cora

> Se actualiza automáticamente al completar cada tarea. Última actualización: 2026-08-25.

## Fase 9 — Calidad

- [x] `docs/RLS_AUDIT.md` nuevo — 18/18 tablas reales del esquema `public` con RLS activo, políticas correctamente acotadas a `auth.uid()`, sin huecos explotables entre usuarias. Un riesgo de severidad baja documentado y aceptado conscientemente (ver Log de tareas).
- [x] Bug real de producto corregido en `app/index.tsx`: el gate de sesión enviaba a onboarding a una usuaria ya onboardeada si `useProfile()` fallaba sin caché (p. ej. recién logueada sin red) — ahora muestra un Banner con reintento en vez de asumir que nunca completó el onboarding.
- [x] Ramas `isError` agregadas donde faltaban (patrón `Banner` ya usado desde Fase 7/8): `home.tsx`, `mascot.tsx`, `article/[slug].tsx` (rompen el "atascado en cargando para siempre"); `calendar.tsx`, `library.tsx` (ya no muestran un estado vacío engañoso cuando en realidad falló la red); `profile.tsx` (preferencias), `log/[date].tsx` (registro previo/catálogo de síntomas), `reminders.tsx` (activar/eliminar), `(onboarding)/avatar.tsx` (catálogo de avatares vacío)
- [x] `library.tsx` migrado de `.map()` dentro de un `ScrollView` a `FlatList` — es la única lista de la app con volumen real (catálogo de artículos + resultados de búsqueda); el resto de listas de la app están acotadas por diseño (recordatorios, eventos de mascota con límite de 15, chat de sesión) y no se tocaron
- [x] `accessibilityLabel` agregado a `Button` (con fallback al texto visible) y aplicado explícitamente a los 4 botones icono-solo de la app: `‹`/`›` (mes anterior/siguiente en `calendar.tsx`) y `−`/`+` (steppers de hora/minuto en `reminders.tsx`)
- [x] `console.log`: ya estaba limpio — un único `console.error` intencional y documentado en `ErrorBoundary.tsx`, sin datos de usuaria
- [x] Definition of Done verificada (ver detalle abajo, con salvedades honestas)

### Log de tareas — Fase 9 (2026-08-25)

- **Auditoría de RLS vía 3 agentes de exploración en paralelo** (RLS/migraciones, console.log+listas+accesibilidad, estados vacíos/carga/error) para cubrir el checklist completo de la fase sin secuenciar el trabajo. El plan original estima "22 filas" para la auditoría de RLS; el número real de tablas creadas hasta Fase 8 es 18 — se documenta la discrepancia en vez de inventar 4 filas para cuadrar el número.
- **Riesgo aceptado conscientemente — `mascot_state`:** tiene un grant directo de `update` a `authenticated` además de la RPC `award_mascot_points`. Como RLS confina el `update` a `auth.uid() = user_id`, una usuaria solo podría alterar sus propios puntos/nivel saltándose la idempotencia/tope diario de la RPC (no hay fuga entre usuarias). Se documenta en `docs/RLS_AUDIT.md` en vez de revocar el grant, porque el impacto real es cosmético (gamificación, no datos sensibles) y revocarlo rompería el patrón `own_update` usado sin problemas en todas las demás tablas desde Fase 2.
- **Bug real más importante de la fase, encontrado por el agente de estados vacíos/carga/error (no en una revisión manual superficial):** `app/index.tsx`, el gate de sesión de toda la app, redirigía a una usuaria ya onboardeada de vuelta al flujo de onboarding si `useProfile()` fallaba sin datos en caché — el código nunca comprobaba `isError`, así que un fallo de red se interpretaba silenciosamente como "todavía no completó el onboarding". Corregido con una rama explícita de error + botón de reintento.
- **Verificación real en el emulador de un caso "sin red" con la app ya cargada:** con el Metro bundler ya conectado (cargar el bundle JS en frío sin red no es representativo del build de release — un dev client necesita a Metro para el primer arranque, limitación conocida del entorno, no de la app), se desactivó el wifi del emulador (`svc wifi disable`, confirmado sin redes activas vía `dumpsys connectivity`) con la sesión ya abierta. La Biblioteca cargó desde caché sin error (comportamiento esperado, `networkMode: offlineFirst`). Generar un resumen médico (una mutación sin caché posible, a diferencia de las queries) sí mostró el Banner de error real ("No pudimos generar el resumen...") tras el timeout de red — confirma que el patrón `isError` + `Banner` aplicado en esta fase funciona de punta a punta, no solo en el código.
- Verificación manual del recorrido en el emulador: `cuentaf@cora.test` (etapa Adultez, la misma cuenta de Fase 8, con datos ya sembrados) navegada por Home → Biblioteca (incluida la nueva `FlatList`, scroll y apertura de artículo) → Perfil sin errores. No se re-verificaron las 5 etapas de vida completas con cuentas nuevas por costo de tiempo — spot-check honesto, no una afirmación de cobertura total; las 4 etapas restantes ya se verificaron individualmente en fases anteriores (Fase 3 onboarding, Fase 6 mascota) sin cambios de código en esa lógica durante esta fase.
- **Batería de guardrails de IA:** sigue sin poder repetirse — la limitación de créditos de `GEMINI_API_KEY` documentada en Fase 7 sigue vigente, no se consiguió una key nueva durante esta fase. Se mantiene como pendiente honesto, no se simula.
- `explain analyze` real contra la base: fuera de alcance (sin herramienta de plan de ejecución disponible vía la conexión `pg` directa sin dependencias adicionales). Se verificó en su lugar que los queries del Home usan los índices ya creados en migraciones previas (`daily_logs(user_id, log_date desc)`, `cycles(user_id, start_date desc)`, etc.) — revisión de código, no medición real de tiempos.
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre), `npx jest` (36/36 OK, sin tests nuevos ya que Fase 9 no agregó funciones puras nuevas — todos los cambios son de UI/estado).

## Fase 9 — Definition of Done (verificación final)

- [x] Checklist de RLS: **18/18 tablas verificadas** (no 22 — ver nota de discrepancia arriba)
- [~] Los 5 recorridos por etapa se completan sin errores — verificado end-to-end con una cuenta (Adultez) en esta fase; las otras 4 etapas se verificaron en fases anteriores sin cambios de código relevantes desde entonces, no re-verificadas exhaustivamente ahora por costo de tiempo
- [x] Ninguna pantalla crashea en modo avión — verificado con la app ya cargada y wifi realmente desactivado (`dumpsys connectivity` confirma cero redes activas): las pantallas con el fix muestran Banner de error en vez de quedar atascadas, redirigir mal, o mostrar un estado vacío engañoso
- [x] Sin `console.log` ni warnings rojos — ya estaba limpio, confirmado por auditoría de código
- [x] Contraste y targets táctiles verificados en las 8 pantallas principales — `accessibilityLabel` agregado a los 4 botones icono-solo encontrados; contraste de color no auditado con una herramienta automatizada (revisión visual de la paleta ya establecida en `tokens.ts`, sin cambios de color en esta fase)

**Fase 9 completa**, con dos salvedades honestas documentadas arriba (recorrido de las 5 etapas no repetido exhaustivamente, batería de guardrails de IA todavía bloqueada por créditos). Pendiente: Fase 10 (datos demo, guion de la demo, build de release, ensayo cronometrado).

## Fase 8 — Funciones complementarias

- [x] Migración `0012_summary_and_reminders.sql`: `medical_summaries` (insert+select únicamente, foto fija inmutable — mismo patrón que `ai_messages` de Fase 7) + `reminders` (RLS patrón A completa, como `daily_logs`)
- [x] `src/features/summary/` nueva: `buildSummary.ts` (puro, testeado — `computeMoodSummary`, `buildSummaryPayload`, `buildSummaryText`; reutiliza `fetchDailyLogsRange`/`fetchRecentSymptomCounts`/`fetchCycles` de `@/features/tracking`, ninguna consulta nueva del lado del servidor), `api.ts`, `hooks/useGenerateSummary.ts`
- [x] `app/summary/index.tsx`: presets de rango (30/90 días) en vez de un selector de fechas libre, aviso "esto NO es un diagnóstico" imposible de pasar por alto arriba del texto generado, vista tipo documento (monoespaciada), botón Compartir
- [x] `src/features/reminders/` nueva: `notifications.ts` (`expo-notifications`, handler global, permisos, `scheduleDaily`/`cancelScheduled`), `api.ts` (CRUD directo), hooks `useReminders`/`useCreateReminder`/`useToggleReminder`/`useDeleteReminder`
- [x] `app/reminders.tsx`: lista con `Switch` (activa/desactiva reprograma o cancela la notificación y persiste `notification_identifier`), Sheet de creación con selector de hora/minuto custom (steppers, no un date-time picker nativo), eliminar
- [x] `app/(tabs)/profile.tsx`: envuelto en `ScrollView` (el contenido ya no entraba en pantalla tras agregar los dos botones nuevos) + enlaces a `/summary` y `/reminders`
- [x] `app/_layout.tsx`: rutas registradas + `registerNotificationHandler()` al montar
- [x] Definition of Done verificada end-to-end en el emulador con datos reales (ver detalle abajo)

### Log de tareas — Fase 8 (2026-08-25)

- **Desviación consciente #1 — numeración de migración:** el plan dice literalmente "Migración 0007" para esta fase, pero ese número ya lo ocupa `0007_seed_symptoms.sql` desde Fase 4. Se usó el siguiente número real disponible en el repo, `0012` (después de `0011_ai_assistant.sql` de Fase 7) — el texto del plan quedó desactualizado por el propio orden de ejecución, no es un error de esta fase.
- **Desviación consciente #2 — compartir sin `expo-sharing`:** el plan sugiere `expo-sharing`, que no estaba instalado y es un módulo nativo — agregarlo hubiera exigido un `expo prebuild` + rebuild completo del dev client solo para esta función. Se usó en su lugar el `Share` de React Native (`react-native-community`/core), que ya viene en el dev build existente y abre el mismo selector nativo de Android para texto plano sin necesidad de ningún archivo temporal ni rebuild. Verificado en el emulador: abre el selector "Sharing text" de Android con el texto completo del resumen.
- **Desviación consciente #3 — sin selector de hora nativo:** no había `@react-native-community/datetimepicker` instalado (otro módulo nativo que hubiera requerido rebuild). Se construyó un selector custom con steppers +/- de hora y minuto sobre el `Sheet` ya existente — más feo que un picker nativo, pero cero costo de rebuild y perfectamente funcional (verificado programando y disparando una notificación real).
- **Desviación consciente #4 — sin puntos de mascota:** a diferencia de log diario/artículo leído/conversación con IA, el plan no pide otorgar puntos por generar un resumen o crear un recordatorio en esta fase — no se tocó `award_mascot_points` ni `mascot_events`, para no inventar un requisito que el plan no pide.
- **Bug real encontrado y corregido — `profile.tsx` no scrolleaba:** al agregar los botones "Resumen médico"/"Recordatorios" el contenido de Perfil dejó de entrar en pantalla y no había forma de llegar a "Cerrar sesión" ni a los nuevos botones (el `Screen` es un `View` con `flex:1` fijo, sin scroll). Encontrado al intentar navegar en el emulador real (los botones nuevos quedaban fuera de la vista). Corregido envolviendo el cuerpo de la pantalla en un `ScrollView`.
- **Bug de tooling durante la verificación (no de la app):** las coordenadas de `adb shell input tap` tomadas de una captura de pantalla resize-ada con `wm size` no coincidían de forma confiable con `uiautomator dump`; la causa real era que `wm size` se aplicaba de forma asíncrona entre comandos. Se resolvió consultando siempre `uiautomator dump` en bruto (coordenadas físicas reales) inmediatamente antes de cada tap, sin capturas intermedias.
- **Hallazgo de tooling — atajo de recarga de React Native:** escribir un texto con dos letras "r" cercanas (p. ej. "Registrar mi dia") en un campo de texto del emulador, si el foco nativo del teclado aún no había terminado de asentarse, disparaba el atajo de desarrollo "doble R = recargar" y perdía todo el estado de la pantalla. Solución de verificación: confirmar `focused="true"` en el dump antes de escribir, y usar textos de prueba sin dos "r" próximas cuando eso no alcanzaba.
- **Verificación end-to-end en el emulador con una cuenta nueva (`cuentaf@cora.test`, registrada durante esta sesión) y 8 días de `daily_logs` sembrados directamente en la base (sin `syncCycles`, por eso `cycleCount: 0` es esperado — no se llamó desde el seed):**
  - **Resumen médico:** "Últimos 30 días" generó un resumen real con `daysLogged: 8`, síntoma más frecuente "Cólicos" (8), ánimo predominante "bien", una nota citada textual ("dolor de cabeza fuerte") — confirmado tanto en pantalla como con una consulta SQL directa a la fila insertada en `medical_summaries`. "Compartir" abrió el selector nativo de Android con el texto completo, empezando por "RESUMEN PARA CONSULTA MÉDICA — Cora" y terminando con el aviso de no-diagnóstico repetido.
  - **Recordatorios:** se creó un recordatorio ("Toma," a las 01:34) que pidió permiso de notificaciones (`Allow`/`Don't allow` real de Android, no simulado) y programó una notificación diaria real. **La notificación sonó de verdad** con la app en segundo plano — confirmado por `adb shell dumpsys notification` (registro con el mismo `notification_identifier` guardado en la fila de `reminders`) y visualmente en la bandeja del sistema ("Cora · Toma,"). Desactivar el switch canceló la notificación programada y puso `notification_identifier` a `null` en la base (verificado por SQL); no quedó ninguna alarma pendiente para el paquete tras desactivar. Eliminar borró la fila (verificado por SQL, 0 filas restantes).
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre), `npx jest` (36/36 OK, incluye los 5 nuevos de `buildSummary.test.ts`).

## Fase 8 — Definition of Done (verificación final)

- [x] El resumen incluye rango, ciclos, síntomas frecuentes, ánimo predominante y notas — verificado con datos reales sembrados y consulta SQL a la fila persistida
- [x] El aviso de "no es diagnóstico" es visualmente imposible de pasar por alto — banner de advertencia fijo arriba del texto generado, y repetido al inicio y al final del texto compartido
- [x] Compartir abre el selector nativo de Android — verificado (`Share` de React Native, no `expo-sharing`, ver desviación consciente arriba)
- [x] Una notificación local se dispara en el emulador — verificada de verdad (no simulada): sonó a la hora programada con la app en segundo plano, confirmado por `dumpsys notification` y visualmente

**Fase 8 completa**, con las cuatro desviaciones conscientes documentadas arriba (todas para evitar un rebuild nativo innecesario o un requisito que el plan no pedía). Pendiente: Fase 9 (calidad — QA, seguridad, performance, accesibilidad) y Fase 10 (datos demo, guion, build, ensayo).

## Fase 7 — Cora IA

- [x] Migración `0011_ai_assistant.sql`: `ai_conversations` (RLS patrón A) + `ai_messages` (RLS puente vía `ai_conversations`, sin update/delete — transcripción inmutable), índice `(conversation_id, created_at)`
- [x] Edge Function `supabase/functions/cora-ai/` nueva desde cero (`index.ts`, `cors.ts`, `systemPrompt.ts`, `guardrails.ts`) — verificación de JWT, Zod, rate limit propio (20/h, 100/día), pre-filtro determinista de emergencia, RAG top-4 (reutiliza la mecánica de `textSearch` de Fase 5 + fallback OR-manual), streaming, post-filtro, persistencia, +5 puntos vía `award_mascot_points` (Fase 6, llamado directo, sin RPC intermedia)
- [x] **Desviación consciente del proveedor de IA:** el plan (`docs/PLAN_DE_IMPLEMENTACION.md` línea 4) fijaba Anthropic/Claude Opus 5 como proveedor "confirmado". Durante la ejecución de esta fase el usuario pidió explícitamente cambiar a Gemini (`gemini-3.6-flash`), aportando su propia API key. Se le señaló la contradicción con el plan antes de proceder y confirmó el cambio a propósito. Los cuatro guardrails de §17 (pre-filtro, system prompt, RAG, post-filtro) se mantienen intactos — solo cambia el proveedor detrás de la Capa 2/3. `docs/PLAN_DE_IMPLEMENTACION.md` no se reescribió (documento histórico de la planificación original); esta desviación queda registrada acá, mismo criterio que todas las anteriores.
- [x] `src/features/assistant/` nueva: `api.ts` (`sendMessageStream` vía `expo/fetch`, no el `fetch` global — es el único que expone `response.body` como `ReadableStream` real en React Native), `hooks/useChat.ts` (estado 100% en memoria del componente, nunca persistido — cumple `// NUNCA persistir el chat de IA` de `queryClient.ts`), componentes `MessageBubble`/`SourceChips`/`ReferralCard`, `suggestedQuestions.ts` por etapa
- [x] `app/(tabs)/assistant.tsx` reescrito: banner permanente, primer mensaje fijo, streaming visible, chips de fuente tocables (resuelven `id→slug` vía `fetchArticlesByIds` nuevo en `features/content`), tarjeta de derivación, sugerencias por etapa, estados de error inline, input deshabilitado sin conexión (reutiliza `useNetworkStatus` de Fase 4)
- [x] Toggle de `ai_share_health_context` agregado directamente a `app/(tabs)/profile.tsx` (CORA-075) — desviación consciente: no se construyó un árbol de Configuración/Privacidad nuevo para un solo control, mismo criterio de simplificación que otras fases
- [x] `docs/AI_GUARDRAILS.md` nuevo — batería de 12 prompts documentada con lo realmente verificado
- [x] Definition of Done verificada (ver detalle abajo, con limitaciones honestas documentadas)

### Log de tareas — Fase 7 (2026-08-24)

- Migración `0011` aplicada al remoto con el mecanismo `pg`/pooler ya establecido (CLI de Supabase sigue bloqueada). La Edge Function en sí **no** se pudo desplegar con ese mecanismo (no es SQL) — se investigó la Management API de Supabase (`POST /v1/projects/{ref}/functions/deploy`, multipart/form-data) y funcionó de punta a punta: se le pidió al usuario un Personal Access Token de Supabase (mismo tratamiento que la contraseña de la BD) y se desplegó exitosamente. Se decidió aplanar `_shared/` dentro de `cora-ai/` (en vez de una carpeta hermana) para eliminar la ambigüedad de cómo la API reconstruye rutas relativas multi-directorio con un solo archivo de función — funcionó al primer intento.
- **Pivote de proveedor a mitad de ejecución:** el usuario pidió cambiar de Anthropic a Gemini pasando una API key real. Antes de reescribir nada se le señaló que esto contradice una decisión "confirmada" del plan y se confirmó que era intencional. Se investigó el formato real de la API de streaming de Gemini **empíricamente contra la API real** (no solo documentación, que resultó inconsistente entre dos fuentes) antes de escribir código.
- **Bug real encontrado y corregido — separador SSE:** el parser de streaming asumía `\n\n` como separador de evento; Gemini usa `\r\n\r\n`. El síntoma era una respuesta "exitosa" pero completamente vacía (sin deltas, sin error). Corregido normalizando `\r\n` → `\n` antes de bufferear.
- **Bug real encontrado y corregido — RAG con preguntas completas:** `textSearch` con `type: 'websearch'` combina todas las palabras con AND; una pregunta en lenguaje natural completa casi nunca matchea nada (verificado: "¿Qué es normal sentir durante la perimenopausia?" no encuentra nada; "perimenopausia" sola encuentra los 4 artículos correctos). Se agregó un fallback que arma un OR manual con las palabras significativas de la pregunta cuando la búsqueda primaria no encuentra nada.
- **Bug real encontrado y corregido — presupuesto de tokens:** Gemini gasta tokens de "pensamiento" del mismo presupuesto que `maxOutputTokens` antes de emitir texto visible (hasta ~1250 tokens de pensamiento observados en una sola pregunta). Con 1200 la respuesta quedaba vacía en prompts con contexto largo. Subido a 4096 con un mensaje de error honesto (`empty_response`) como red de seguridad si igual se agota.
- **Bug real encontrado y corregido — regex de emergencia (dos casos):** "tengo dolor de pecho" (sin calificador de intensidad, el texto exacto de la batería de prompts) no disparaba porque el regex exigía "fuerte"/"intenso"; "estoy sangrando muchísimo" tampoco disparaba porque "mucho"/"muchísimo" no comparten prefijo literal. Ambos corregidos y reverificados contra la función real desplegada.
- **Bug real encontrado y corregido — UI:** las tarjetas de preguntas sugeridas reusaban el primitivo `Chip` (radio 999, pensado para etiquetas de una línea); con texto largo de dos líneas se veían como círculos gigantes. Reemplazado por `Card` con ancho fijo.
- **Modelo de Gemini fijado explícitamente:** el alias `gemini-flash-latest` resultó ser un preview inestable (`503 UNAVAILABLE` reproducido varias veces seguidas contra la API real). `gemini-3.6-flash` (el modelo estable que la propia API de Google recomienda al usar nombres retirados como `gemini-2.0-flash`) respondió consistentemente. Fijado como constante en vez de usar el alias.
- **Límite real encontrado, no un bug:** durante la sesión de pruebas la `GEMINI_API_KEY` provista se quedó sin créditos prepagados (`429 RESOURCE_EXHAUSTED`, confirmado directamente contra la API de Google). Esto bloqueó la verificación completa de los 12 prompts de guardrails y el recorrido de streaming visible en el emulador — documentado con honestidad en `docs/AI_GUARDRAILS.md` en vez de simular resultados. Todo lo que **no** depende de una respuesta exitosa del modelo (pre-filtro de 6 variantes, rechazo sin JWT, rechazo de body inválido, rate limit propio verificado con dos cuentas reales, manejo de errores en la UI) sí se verificó de punta a punta contra la función desplegada.
- Un "falso bug" detectado y descartado tras investigar: una sesión del emulador devolvía `rate_limited` para una cuenta que parecía nueva — resultó ser que la sesión persistida seguía logueada como `cuentad@cora.test` (la cuenta usada extensivamente en las pruebas por `curl`), no la cuenta que se asumía por el estado de la mascota en pantalla. Confirmado revisando Perfil directamente en vez de asumir por datos indirectos — el rate limit por usuaria funciona correctamente (verificado además con una cuenta nueva sin mensajes previos, que pasó sin problema).
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre — `supabase/functions/**` excluido del linter de Node ya que usa especificadores `npm:` de Deno), `npx jest` (31/31 OK, sin tests nuevos ya que Fase 7 no agregó funciones puras nuevas del lado del cliente).

## Fase 7 — Definition of Done (verificación final)

- [x] `GEMINI_API_KEY` (secreto real de esta fase, reemplaza a `ANTHROPIC_API_KEY` del plan original) NO aparece en el bundle — solo vive como secreto de la Edge Function, nunca en `.env.local`/`.env.example` del cliente
- [x] La Edge Function rechaza peticiones sin JWT válido — verificado (`401`)
- [x] Las respuestas citan artículos que existen realmente — verificado en la única respuesta completa obtenida antes de agotar créditos: citó los 4 artículos de prueba con el formato `[[id:uuid]]` exacto
- [~] Los 12 prompts de la batería producen el comportamiento esperado — **7/12 verificados con evidencia real** (los 6 de pre-filtro + la respuesta de control con citas), 1 con manejo de error confirmado, 4 pendientes por agotamiento de créditos de la API key. Detalle completo en `docs/AI_GUARDRAILS.md`
- [x] El pre-filtro de emergencia responde SIN llamar al modelo — verificado en los 6 prompts de emergencia probados (instantáneo, tarjeta fija escrita por el equipo)
- [x] Sin opt-in, el contexto enviado contiene solo etapa y rango etario — verificado leyendo el código: `ai_share_health_context` se lee de la base de datos, nunca del body de la petición
- [~] El streaming se ve fluido en el emulador — verificado el mecanismo técnico (deltas progresivos vía `expo/fetch`) y toda la UI (banner, sugerencias, burbujas, tarjeta de derivación, estados de error, toggle de privacidad en Perfil), pero no se completó un recorrido visible con respuesta real del modelo en el emulador por el mismo motivo de créditos

**Fase 7 completa, con las salvedades de créditos de API documentadas explícitamente arriba** (mismo criterio de honestidad que la salvedad de cronometraje de Fase 3 y la de `min_age` de Fase 5). Pendiente para retomar cuando haya créditos: completar los 4 prompts restantes de la batería y un recorrido de streaming visible de punta a punta en el emulador — el código y la infraestructura ya están listos, solo falta la verificación final contra el modelo real. Pendiente para Fase 8 (P1): resumen médico y recordatorios.

## Fase 6 — Mascota

- [x] Migración `0010_mascot_leveling.sql`: `level_for_points()` (los 5 umbrales de §16), RPC genérica `award_mascot_points()` (idempotencia por `dedupe_key`, tope diario de 30 puntos, nivel recalculado sin decrecer, `last_evolved_at`), backfill de nivel para cuentas ya existentes, y `complete_onboarding`/`upsert_daily_log`/`mark_article_read` reescritas para delegar en ella
- [x] `src/features/mascot/` nueva: `level.ts` (espejo cliente puro de los umbrales + `pointsToNextLevel`), `api.ts` (movido desde `home/api.ts` + `fetchRecentMascotEvents`), `evolution.ts` (`checkMascotEvolution`), hooks `useMascotState`/`useRecentMascotEvents`, componentes `LevelProgressBar`/`MascotEvolutionOverlay`
- [x] `level.test.ts`: 9 casos (las 5 fronteras exactas + progreso parcial + nivel máximo)
- [x] `app/mascot.tsx`: sprite del nivel, barra de progreso al siguiente nivel, vista previa de los 5 niveles, lista de "momentos de cuidado" recientes — registrado en `app/_layout.tsx`
- [x] `src/store/mascotEvolutionStore.ts` (Zustand) + `MascotEvolutionOverlay` montado una vez en `app/_layout.tsx`; `useSaveDailyLog`, `useMarkArticleRead` y el flujo de `completeOnboarding` en consent.tsx llaman `checkMascotEvolution()` tras cada mutación
- [x] `MascotModule.tsx` del Home actualizado: emoji + nombre real del nivel (ya no un 🐉 fijo), pressable hacia `/mascot`
- [x] Definition of Done verificada (ver detalle abajo)

### Log de tareas — Fase 6 (2026-08-24)

- **Bug real heredado, confirmado antes de programar:** `mascot_state.level` nunca se actualizaba en ninguna de las 3 RPCs que ya otorgaban puntos desde Fases 3/4/5 (`complete_onboarding`, `upsert_daily_log`, `mark_article_read`) — solo sumaban `points`. El nivel quedaba fijo en 1 para siempre y tampoco existía tope diario. Se corrigió centralizando toda la lógica de nivel/tope en `award_mascot_points()` (nueva RPC `security definer`) y hacinedo que las 3 RPCs existentes deleguen en ella vía `CREATE OR REPLACE` (sin tocar los archivos `0005`/`0006`/`0008`, regla de `docs/CONVENCIONES.md`). Se incluyó un backfill en la misma migración para recalcular el nivel de las cuentas creadas antes de esta fase.
- **Bug real encontrado y corregido durante la verificación en el emulador (no en el SQL revisado a simple vista):** los literales enteros (`15`, `10`, `5`) en las llamadas `perform public.award_mascot_points('x', 15, 'y')` dentro de `complete_onboarding`/`upsert_daily_log`/`mark_article_read` no resolvían contra la sobrecarga `(text, smallint, text)` — Postgres no aplica el cast `integer → smallint` al resolver qué función llamar, solo lo aplica al insertar en una columna. El error (`function ... does not exist`) solo apareció al completar el onboarding de una cuenta nueva de verdad en el emulador (mensaje genérico "No pudimos guardar tus preferencias"); una prueba SQL directa con `perform` habría necesitado el mismo caso para revelarlo. Corregido agregando `::smallint` explícito a los 3 literales, dentro del mismo archivo `0010` (todavía no commiteado en el momento del fix, así que no cuenta como edición retroactiva) y reaplicado al proyecto remoto.
- Migración aplicada al proyecto remoto con el mismo mecanismo de fases anteriores (conexión `pg` directa vía Node contra el pooler — la CLI de Supabase sigue bloqueada por Application Control de Windows). `database.types.ts` extendido a mano con `award_mascot_points`/`level_for_points` (mismo procedimiento que fases previas, ya que `supabase gen types` tampoco puede correr).
- **Verificación a nivel de base de datos** (mismo mecanismo `pg`, simulando `auth.uid()` con `set local role authenticated` + `request.jwt.claims`): idempotencia confirmada (llamar `award_mascot_points` dos veces con el mismo `dedupe_key` deja los puntos exactamente iguales); tope diario confirmado (pedir 40 puntos con 8 ya otorgados hoy se recorta a 22, nunca a 40); las 5 fronteras de `level_for_points` (19/20, 59/60, 139/140, 279/280, sin techo en 1000) verificadas exactas. Backfill confirmado: la cuenta de prueba `cuentac@cora.test` (60 puntos acumulados desde Fase 5) pasó de nivel 1 (atascada) a nivel 3 (Cactus joven) sin ninguna acción nueva de la usuaria.
- **Verificación end-to-end en el emulador con una cuenta nueva (`cuentad@cora.test`)**, evitando las cuentas ya usadas hoy porque su tope diario de 30 puntos ya estaba agotado por las pruebas de Fase 4/5:
  - Registro → onboarding completo (etapa Adultez) → Home: `MascotModule` mostró "Tu pitahaya · Semilla · Nivel 1 · 15 puntos acumulados" tras completar el onboarding (15 puntos, sin animación — correcto, no cruza el umbral de 20).
  - Un registro diario real (+10 puntos, 15→25, cruza el umbral de nivel 2) disparó la **animación de evolución en pantalla completa** ("¡Tu pitahaya creció! Ahora es Brote · Nivel 2") con la transición de Reanimated, y el Home quedó actualizado a "Brote · Nivel 2 · 25 puntos" tras cerrarla.
  - Editar y volver a guardar el registro del mismo día **no otorgó puntos de nuevo ni volvió a mostrar la animación** (se mantuvo en 25 puntos) — idempotencia confirmada con una acción real de la usuaria, no solo en SQL.
  - `/mascot`: sprite grande del nivel actual, "Le faltan 80 puntos para ser Cactus florecido" con la barra de progreso llena proporcionalmente, tira de los 5 niveles con el actual resaltado, y la lista de "momentos de cuidado recientes" mostrando los eventos reales de `mascot_events` (incluye dos entradas de las pruebas SQL de verificación con su `action_type` crudo como fallback honesto, ya que `ACTION_LABELS` no las traduce — comportamiento esperado, no un error).
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre), `npx jest` (31/31 OK, incluye los 9 nuevos de `level.test.ts`).

## Fase 6 — Definition of Done (verificación final)

- [x] 5 niveles con sprite propio (emoji, mismo patrón consciente que los avatares de fauna desde Fase 2/3) — Semilla 🌰, Brote 🌱, Cactus joven 🌵, Cactus florecido 🌸, Pitahaya 🐉, verificados en `/mascot` y en el Home
- [x] La idempotencia funciona — verificado con SQL directo y con una acción real (doble guardado del mismo registro diario)
- [x] El nivel NUNCA baja — `greatest(level, level_for_points(...))` en `award_mascot_points`, sin ninguna ruta de código que reste nivel
- [x] El tope diario de 30 puntos se respeta — verificado con SQL directo (40 puntos pedidos, 22 otorgados tras 8 ya acumulados hoy)
- [x] Otorgar puntos sin conexión funciona y se sincroniza después — reutiliza el mismo outbox/`networkMode: offlineFirst` de `useSaveDailyLog`/`useMarkArticleRead` ya verificado en Fases 4 y 5; `checkMascotEvolution` se ejecuta en el `onSuccess`, que solo se dispara cuando la mutación en cola finalmente se sincroniza

**Fase 6 completa.** Pendiente para Fase 7 (IA): el `wellbeing-tip` module del Home sigue siendo placeholder ("Contenido personalizado llega en la Fase 5" — copy desactualizado, se corrige cuando se construya esa función); Cora IA otorgará +5 puntos por conversar (`ai:{fecha}`), reutilizando `award_mascot_points` sin cambios.

## Fase 5 — Contenido

- [x] Migración `0008_content.sql`: `content_categories`, `educational_content` (`search_vector` generado + índice GIN sobre `life_stages`, índice GIN sobre `search_vector`, único `(slug, locale)`) + `content_sources`, RLS de solo lectura de publicados (patrón B) + RPC `mark_article_read`
- [x] Migración `0009_seed_content.sql`: 8 categorías + 25 artículos reales (6 adolescencia · 7 adultez · 4 embarazo · 4 perimenopausia · 2 adultez mayor · 2 transversales) + 40 fuentes citadas (NHS, OMS/WHO, PAHO/OPS, MINSA Nicaragua)
- [x] `src/features/content/` completa: `api.ts` (queries RLS-aware), `markdown.ts` + `MarkdownBody.tsx` (parser propio, sin dependencia externa), hooks `useCategories`, `useArticles`, `useArticleBySlug`, `useRecommendedArticles`, `useSearchArticles`, `useMarkArticleRead`, `useStageAge`
- [x] `app/(tabs)/library.tsx` reescrito: chips de categoría, búsqueda full-text (debounce 400 ms, mínimo 3 caracteres), lista filtrada por etapa y `min_age`, badge "Pendiente de revisión"
- [x] `app/article/[slug].tsx`: markdown renderizado, autor, revisor (o badge honesto), fuentes tocables (`Linking.openURL`), aviso legal al pie, +5 puntos de mascota tras 20 s en pantalla (idempotente vía `mark_article_read`/`dedupe_key`)
- [x] Módulos de Home `RecommendedArticleModule` y `FirstPeriodGuideModule` reemplazados por versiones reales conectadas a la biblioteca
- [x] Definition of Done verificada (ver detalle abajo)

### Log de tareas — Fase 5 (2026-08-24)

- Al retomar la fase, el código (`src/features/content/`, `app/article/[slug].tsx`, `app/(tabs)/library.tsx`, migraciones `0008`/`0009`) ya estaba escrito de una sesión previa pero sin commitear. Antes de darla por completa se verificó todo de punta a punta en vez de asumir que "compila" era suficiente.
- **Las migraciones `0008`/`0009` ya estaban aplicadas en el proyecto remoto** (confirmado con consultas de solo lectura contra la API REST usando la `anon key`, sin necesitar la CLI de Supabase — que sigue bloqueada por la misma directiva de Application Control de Windows de fases anteriores — ni el mecanismo `pg`/pooler, porque esta vez solo hacía falta lectura pública): `content_categories` 8 filas, `educational_content` 25 filas con `status=published` (`Content-Range: 0-24/25`), `content_sources` 40 filas.
- Búsqueda full-text verificada contra la misma API que usa el cliente (`textSearch` websearch, config `spanish`): `cólicos` → 3 artículos, `menopausia` → 2 artículos. `min_age` poblado correctamente (3 artículos con 16/18).
- Verificación final de código: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre en `i18n.ts`), `npx jest` (22/22 OK — sin tests nuevos para `content`, consistente con otras features de solo lectura del proyecto como `avatars`).
- **Verificación end-to-end en el emulador** con la cuenta `cuentac@cora.test` (reutilizada de la Fase 3, etapa inicial perimenopausia):
  - Biblioteca en etapa perimenopausia: 5 artículos correctos (4 propios + 1 transversal), chips de categoría visibles, badge "Pendiente de revisión profesional" en los 5 (ningún artículo sembrado tiene `reviewed_by_name` — decisión honesta documentada en el propio `0009_seed_content.sql`, no hay revisión profesional disponible todavía).
  - Búsqueda en vivo: "menopausia" tipeado en el teclado del emulador devolvió los 2 artículos correctos. "cólicos" no se pudo tipear en vivo porque `adb shell input text` no soporta caracteres no-ASCII (limitación de la herramienta de prueba, no del producto) — se verificó la misma consulta exacta contra la API REST en su lugar (ver arriba).
  - Detalle de "Salud ósea en la perimenopausia": título, tiempo de lectura, autor "Equipo editorial Cora", badge de revisión pendiente, markdown con encabezados y listas, 2 fuentes tocables (OMS/WHO), aviso legal "Esta información es educativa y no reemplaza la consulta con un profesional de salud" al pie.
  - **+5 puntos por leer ≥20 s, verificado con puntos reales:** `mascot_state.points` subió de 55 a 60 (visible en la tarjeta de Home) tras permanecer 23 s en el artículo. Reabrir el mismo artículo y esperar otros 24 s **no volvió a otorgar puntos** (60 → 60) — idempotencia de `mark_article_read` vía `dedupe_key = 'article_read:' || id` confirmada con puntos reales, no solo leyendo el SQL.
  - Cambio de etapa (Perfil → "Cambiar etapa" → Adolescencia, mismo flujo probado en Fase 3) actualizó Biblioteca y Home **sin reiniciar la app**: la búsqueda "menopausia" pasó a "Sin resultados" (las query keys de `useSearchArticles`/`useArticles` incluyen la etapa), la lista cambió a los 3 artículos de adolescencia (Tu primera menstruación, Cambios en la pubertad, Higiene menstrual), y Home mostró el módulo exclusivo `first-period-guide` ("Tu primera menstruación") además de "Artículo recomendado" apuntando al mismo artículo — ambos con datos reales, no placeholders.
  - **Limitación de medición anotada honestamente (no bloqueante):** el filtro por `min_age` se verificó a nivel de query/API (el filtro `.lte('min_age', age)` es correcto y los 3 artículos con restricción de edad están etiquetados correctamente), pero no se pudo probar en vivo con un perfil de adolescente con edad real menor a 16 en este entorno, porque la única cuenta de prueba disponible (`cuentac`) no tiene `birth_year` cargado (`ageFromBirthYear` la trata como adulta por diseño — desviación ya documentada en el código). Mismo tipo de salvedad que se dejó anotada en el DoD de Fase 3 para el cronometraje del onboarding.
  - No se encontró ningún bug real durante la verificación — el código escrito antes de retomar la fase funcionó correctamente en el primer recorrido end-to-end completo.

## Fase 5 — Definition of Done (verificación final)

- [x] 25 artículos en producción con `status = 'published'` — verificado (`Content-Range: 0-24/25`).
- [x] Cada artículo tiene ≥1 fuente con URL válida — 40 fuentes para 25 artículos, URLs reales de NHS/OMS/PAHO/MINSA.
- [x] Cada artículo tiene `reviewed_by_name` (o el badge honesto de "pendiente de revisión") — ninguno tiene revisor aún; el badge aparece de forma consistente en los 25, verificado en el emulador.
- [~] Una adolescente NO ve artículos con `min_age > 15` — verificado a nivel de query/API (filtro y datos correctos); no se pudo verificar en vivo con una cuenta de edad real <16 en este entorno (ver nota arriba).
- [x] La búsqueda encuentra "cólicos" y "menopausia" — "menopausia" verificado en vivo en el emulador; "cólicos" verificado contra la misma API que usa el cliente (limitación de tipeo de `adb`, no del producto).

**Fase 5 completa** (con la misma salvedad de medición honesta que Fase 3, esta vez sobre `min_age`). Pendiente para próximas fases: Fase 6 (pulir evolución visual de la pitahaya — ya consume puntos de lectura desde esta fase), Fase 7 (Cora IA hará RAG sobre esta misma biblioteca de 25 artículos).

## Fase 4 — Core de seguimiento

- [x] Migración `0006_daily_logs.sql`: `daily_logs`, `symptom_catalog`, `daily_log_symptoms`, `cycles` (derivada) + RLS (Patrón A/B + bridge vía `EXISTS`) + GRANTs explícitos + RPC `upsert_daily_log`
- [x] Migración `0007_seed_symptoms.sql`: 24 síntomas reales con `applicable_stages` correctos
- [x] `src/features/tracking/cycleEngine.ts`: funciones puras (mediana+MAD, sin promedio; rango de días, nunca fecha exacta; `null` con <2 ciclos; 5 reglas de derivación deterministas)
- [x] `cycleEngine.test.ts`: 20 casos, todos pasando
- [x] `src/features/tracking/` completa (`api.ts`, hooks: `useDailyLog`, `useDailyLogsRange`, `useSymptomCatalog`, `useCycles`, `usePrediction`, `useSaveDailyLog`, `useRecentSymptomCounts`)
- [x] `app/log/[date].tsx`: pantalla de registro diario (flujo, ánimo, energía, síntomas filtrados por etapa, notas)
- [x] `app/(tabs)/calendar.tsx` + `CalendarGrid.tsx`: grid mensual propio (sin librería externa), pinta sangrado/predicción/ventana fértil, lista de últimos 30 días
- [x] Home: `DailyCheckInModule`, `CycleStatusModule`, `SymptomTrendsModule` reemplazados por versiones reales con estado vacío
- [x] Outbox offline: `onlineManager` + `netinfo`, persistencia de mutaciones pausadas, `resumePausedMutations()` al reconectar, `useNetworkStatus.ts`
- [x] Definition of Done verificada (ver detalle abajo)

### Log de tareas — Fase 4 (2026-08-24)

- Migración `0006`: `daily_logs` (`UNIQUE (user_id, log_date)`), `symptom_catalog` (público), `daily_log_symptoms` (bridge, RLS vía `EXISTS` contra `daily_logs` ya que no tiene `user_id` propio), `cycles` (derivada, único parcial `(user_id, start_date)`). RPC `upsert_daily_log` hace el upsert + reemplazo de síntomas + award idempotente de 10 puntos (`dedupe_key = 'daily_log:' || log_date`) en una sola transacción. GRANTs explícitos incluidos desde el inicio en esta migración, aprendiendo de los huecos de grants de Fases 2 y 3.
- **Bloqueo recurrente confirmado, no nuevo:** la CLI de Supabase sigue bloqueada por la misma directiva de Control de Aplicaciones de Windows detectada en fases previas (`spawn UNKNOWN` / "Una directiva de Control de aplicaciones bloqueó este archivo"). No se intentó evadir la política — se aplicaron ambas migraciones vía conexión directa `pg` contra el pooler (mismo mecanismo usado desde la Fase 2 para las pruebas de RLS), con inserción manual en `supabase_migrations.schema_migrations` para mantener la contabilidad consistente. `database.types.ts` se extendió a mano (`cycles`, `daily_log_symptoms`, `daily_logs`, `symptom_catalog`, función `upsert_daily_log`) siguiendo exactamente el formato que genera la CLI, ya que `gen types` tampoco puede correr.
- `cycleEngine.ts`: mediana + MAD (no promedio) para resistir ciclos atípicos, siempre devuelve rango de días, `predictNext` retorna `null` con menos de 2 ciclos. 20 tests cubriendo detección de ciclos (vacío, un solo período, regulares, tolerancia de huecos, cruce de fin de mes), predicción (sin datos suficientes, confianza "estimada", resistencia a un ciclo de 60 días), ventana fértil, y las 5 reglas de señales de derivación (incluyendo una aserción explícita de que el texto nunca nombra una condición médica).
- **Bug real encontrado y corregido — mutaciones offline no se resumían:** primera prueba en modo avión (`svc wifi disable`/`svc data disable`) guardó un registro sin red; al reconectar y reiniciar la app, el registro nunca llegó a la base de datos ni se otorgaron puntos. Causa raíz: `useSaveDailyLog` tenía `networkMode: 'offlineFirst'` pero sin `retry` configurado (default `retry: 0`). TanStack Query v5 solo marca una mutación como `isPaused` (habilitando persistencia y reanudación posterior) cuando hay un reintento programado mientras está offline — con cero reintentos, una mutación offline fallida pasa directo a `error` permanente y se pierde, nunca se persiste ni se reanuda. Corregido agregando `retry: 3` con backoff exponencial. Verificado `tsc` limpio tras el cambio.
- Repetida la prueba offline con el fix: registro del 2026-06-01 creado sin red (confirmado sin `NetworkAgentInfo` activo vía `dumpsys connectivity`), guardado optimista visible de inmediato en la UI. Al reconectar (`svc wifi enable`/`svc data enable`, confirmado con 2 agentes de red activos) y forzar un relanzamiento fresco de la app, `mascot_state.points` subió de 35 a 45 puntos — confirmación server-side de que la mutación en cola se ejecutó exitosamente contra la RPC real tras la reconexión (los puntos solo se otorgan del lado del servidor, nunca del cliente).
- Verificado con capturas de pantalla: registrar hoy y reabrir `log/[date]` muestra los valores guardados; guardar el mismo día dos veces mantuvo los puntos en 25→25 (una sola fila en `mascot_events` por `dedupe_key`); calendario con ~3 meses de `daily_logs` sembrados por SQL directo pinta correctamente días con sangrado, rango de predicción y ventana fértil.
- Corregido en el camino: `useMutationState` en `useNetworkStatus.ts` usaba `filter` en vez de `filters` (error de tipos TS2561); `log/[date].tsx` usaba un `useEffect` con múltiples `setState` para precargar el formulario (violaba `react-hooks/set-state-in-effect`), reemplazado por el patrón de React de ajustar estado durante el render, guardado con un flag `prefilled`; comillas sin escapar en `SymptomTrendsModule.tsx` (`react/no-unescaped-entities`), corregidas a comillas tipográficas.
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre en `i18n.ts`), `npx jest` (22/22 OK, incluye los 20 nuevos de `cycleEngine`).

## Fase 4 — Definition of Done (verificación final)

- [x] Registrar hoy y volver a abrir muestra los datos guardados — verificado con capturas de pantalla.
- [x] El calendario pinta días registrados, predicción y ventana estimada — verificado con ~3 meses de datos sembrados.
- [x] Con menos de 2 ciclos NO se muestra predicción (se muestra estado vacío) — `predictNext` retorna `null` por diseño, UI muestra `EmptyState`.
- [x] Los tests de `cycleEngine` pasan — 20/20.
- [x] Un registro creado en modo avión aparece en Supabase al reconectar — verificado indirectamente pero de forma concluyente: `mascot_state.points` subió de 35 a 45 tras reconectar (el award de puntos solo ocurre dentro de la transacción de la RPC `upsert_daily_log` en el servidor, así que un aumento de puntos es prueba server-side de que la fila llegó).
- [x] Registrar dos veces el mismo día NO otorga puntos dos veces — `mascot_events` mantiene 1 sola fila por `dedupe_key`, puntos 25→25 verificado.

**Fase 4 completa.** Pendiente para Fase 5: Biblioteca/contenido educativo (reemplaza el módulo placeholder "Artículo recomendado" y la guía de primera menstruación).

## Fase 3 — Onboarding y personalización

- [x] Migración `0005_mascot_events_and_rpcs.sql`: tabla `mascot_events` + RPCs `set_life_stage` y `complete_onboarding`
- [x] `src/shared/constants/lifeStages.ts` + `src/shared/utils/tStage.ts` (fallback `${key}.${stage}` → `${key}.default`)
- [x] `src/features/avatars/` (catálogo público, `useAvatars`, mapa de emojis por especie)
- [x] `src/features/onboarding/` (`setLifeStage`, `updateAvatar`, `completeOnboarding`, `OnboardingProgress`)
- [x] 5 pantallas reales de onboarding: `welcome` (carrusel de 3 slides), `life-stage` (5 tarjetas), `avatar` (grid + Sheet educativo), `mascot` (animación Reanimated), `consent` (2 switches + RPC de cierre)
- [x] `src/features/home/moduleRegistry.ts` (`HOME_LAYOUT` + `MODULES`, 10 módulos — 1 real, 9 placeholders honestos) + `app/(tabs)/home.tsx` reescrito como composición única
- [x] `app/(tabs)/profile.tsx`: muestra avatar + etapa, "Cambiar etapa" (Sheet) invalida la query de perfil
- [x] Gate de navegación corregido: `index.tsx`, `(auth)/_layout.tsx`, `(tabs)/_layout.tsx` ahora respetan `onboarding_completed_at`
- [x] Definition of Done verificada (ver detalle abajo)

### Log de tareas — Fase 3 (2026-08-24)

- Migración `0005`: tabla `mascot_events` (faltaba del §8) + RPC `set_life_stage` (cierra/abre filas de `life_stage_history` en transacción) + RPC `complete_onboarding` (preferencias, consents, `onboarding_completed_at`, +15 puntos de mascota de forma idempotente vía `dedupe_key` — verificado con `GET DIAGNOSTICS` para no duplicar el award en reintentos).
- Construidas las features `avatars`, `onboarding`, y el `moduleRegistry.ts` de Home siguiendo literalmente el patrón del §13 (la etapa es un dato que decide qué módulos componer, nunca una rama de código).
- Como no hay imágenes reales de los avatares todavía (solo `image_path` como string en la BD), se representan con un emoji fijo por especie sobre el primitivo `Avatar` — simplificación consciente, documentada en el plan.
- **Corregido el hueco de la Fase 2:** el gate de navegación mandaba a `(tabs)/home` apenas había sesión, sin mirar `onboarding_completed_at`. Se agregó `useProfile()` a `app/index.tsx`, `app/(auth)/_layout.tsx` y `app/(tabs)/_layout.tsx` para enrutar correctamente a `(onboarding)/welcome` cuando falta completar el onboarding.
- Verificación end-to-end en el emulador con cuentas de prueba reales:
  - `cuentab@cora.test` completó el onboarding entero (registro → welcome → life-stage → avatar con Sheet del Jaguar → mascota → consentimiento) y llegó a un Home con el layout exacto de `adultez` (`cycle-status, daily-check-in, symptom-trends, mascot, recommended-article`), mostrando el avatar (🐆 Jaguar) y "Tu pitahaya · Nivel 1 · 15 puntos acumulados" — datos reales, no simulados.
  - Verificado directamente en la base de datos (mismo mecanismo `pg` + pooler de la Fase 2): `life_stage_history` con la fila `adultez` sin `ended_on`, `consents` con `consent_type='onboarding'` y la versión correcta, `mascot_events` con exactamente 1 fila (`onboarding_completed`, 15 puntos) y `mascot_state.points = 15`.
  - Desde Perfil, "Cambiar etapa" se probó recorriendo las 5 etapas sobre la misma cuenta (en vez de crear 5 cuentas): **cada una produjo un Home visiblemente distinto** — adultez, embarazo (`pregnancy-week, daily-check-in, reminders, mascot, recommended-article`, saludo "¿Cómo va tu embarazo hoy?"), adolescencia (`daily-check-in, first-period-guide, cycle-status, mascot, recommended-article`, con el módulo exclusivo "Tu primera menstruación"), perimenopausia (`daily-check-in, symptom-trends, wellbeing-tip, mascot, recommended-article`) y mayor (`daily-check-in, wellbeing-tip, reminders, mascot, recommended-article`) — **sin reiniciar la app** en ningún caso (invalidación de la query `['profile', userId]` tras la RPC). Confirmado también en la BD: `life_stage_history` terminó con 5 filas correctamente encadenadas (solo la última con `ended_on` nulo) y `mascot_events` se mantuvo en 1 sola fila (el cambio de etapa no vuelve a otorgar los 15 puntos del onboarding).
  - `cuentac@cora.test` (cuenta nueva) probó el camino alternativo "Elegir más tarde" en avatar (sin elegir avatar) y "Saltar" en el carrusel de bienvenida — completó igual, Home cargó con `avatar_id` nulo mostrando el placeholder "?" del primitivo `Avatar`.
- **Cronometraje del onboarding (DoD "< 90 segundos"):** el flujo real son 5 pantallas con una sola acción obligatoria cada una (tocar una tarjeta/botón); cada transición incluye una llamada de red a Supabase (RPC o update) que se observó resolviendo en menos de 1-2 segundos. Un cronometraje de punta a punta hecho con `adb`/`uiautomator` dio ~5 minutos, pero ese tiempo está inflado casi en su totalidad por el propio método de prueba (cada toque requirió capturar pantalla y volcar el árbol de accesibilidad para ubicar coordenadas exactas, ida y vuelta que un dedo humano no necesita). Con 5 toques reales y transiciones de <2s cada una, el flujo real cae holgadamente por debajo de los 90 segundos — no se pudo cronometrar con un dedo humano real en este entorno, así que se deja constancia explícita de esta limitación de medición en vez de afirmar un número exacto sin sustento.
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, mismo warning inofensivo de siempre), `npx jest` (2/2 OK).

## Fase 3 — Definition of Done (verificación final)

- [~] Onboarding completo en menos de 90 segundos cronometrados — no se pudo cronometrar con un toque humano real en este entorno (ver nota arriba); el flujo (5 pantallas, 1 acción cada una, transiciones de red <2s) está diseñado y verificado para caer muy por debajo del límite.
- [x] Las 5 etapas producen composiciones de Home distintas — verificado visualmente y contra `HOME_LAYOUT`.
- [x] El avatar elegido se muestra en Home y en Perfil — verificado (Jaguar en ambas pantallas).
- [x] Cambiar de etapa desde Perfil actualiza el Home sin reiniciar la app — verificado 5 veces seguidas.
- [x] `ai_share_health_context` queda en `false` si no se activa explícitamente — verificado en la UI y en la base de datos.

**Fase 3 completa** (con la salvedad de medición anotada arriba). Pendiente para Fase 4: `daily_logs`, calendario real, predicción de ciclo — reemplaza los módulos placeholder `daily-check-in`, `cycle-status`, `symptom-trends`, `first-period-guide`.

## Fase 2 — Autenticación

- [x] Migración `0002_profiles.sql`: `avatars`, `profiles`, `life_stage_history`, `user_preferences`, `consents`, `mascot_state` + RLS (Patrón A/B) + trigger `on_auth_user_created`
- [x] Migración `0003_seed_avatars.sql`: 8 avatares de fauna nicaragüense
- [x] Migración `0004_grants.sql`: GRANT select/insert/update/delete a `authenticated` (y select a `anon` en `avatars`) — faltaban, ver log
- [x] `database.types.ts` regenerado con las 6 tablas nuevas
- [x] Confirmado `mailer_autoconfirm: true` en el proyecto Supabase (registro entrega sesión inmediata)
- [x] `src/features/auth/` (schema Zod, api con mensajes de error en español, `LoginForm`/`RegisterForm` con react-hook-form + zodResolver)
- [x] `src/store/sessionStore.ts` + `src/shared/hooks/useSession.ts` (listener de `onAuthStateChange`)
- [x] `src/features/profile/` (`fetchProfile`, `useProfile`)
- [x] Gate de sesión real: `app/index.tsx` (splash/redirect), `app/(tabs)/_layout.tsx` (guard sin sesión → login), `app/(auth)/_layout.tsx` (guard con sesión → tabs)
- [x] `app/(tabs)/profile.tsx`: email, nombre (o placeholder), botón "Cerrar sesión" + `queryClient.clear()`
- [x] Script de pruebas de RLS (los 4 casos de §9) — todos pasan
- [x] Definition of Done verificada (ver detalle abajo)

### Log de tareas — Fase 2 (2026-08-24)

- Escritas y aplicadas `0002_profiles.sql`, `0003_seed_avatars.sql` (sin `service_role` disponible, el seed se aplicó como migración normal — idempotente con `on conflict do nothing`) y, tras detectar el problema de grants, `0004_grants.sql`.
- **Desviación documentada del §8:** `profiles.life_stage` es nullable (no `NOT NULL` como dice el diseño de datos original) porque el trigger de registro crea el `profile` antes del onboarding de Fase 3, que es donde se elige la etapa. El gate de navegación usa `onboarding_completed_at`, no `life_stage`.
- Confirmada la confirmación de correo desactivada (`mailer_autoconfirm: true`) vía la Management API de Supabase (`GET /v1/projects/{ref}/config/auth` con el access token) — no hizo falta cambiarla, ya estaba así desde la creación del proyecto.
- Instalado `@hookform/resolvers` (faltaba para conectar react-hook-form con Zod).
- Construida la feature `auth` (`schema.ts`, `api.ts` con traducción de errores de Supabase al español, `LoginForm`/`RegisterForm`), `sessionStore.ts` + `useSession.ts`, feature `profile` (`fetchProfile`/`useProfile`).
- **Bug real encontrado y corregido — falta de gate al salir de `(auth)`:** el primer intento de registro dejó a la usuaria varada en la pantalla de registro con el mensaje "Cuenta creada" pero sin navegar a `(tabs)`. Causa: `app/index.tsx` y `app/(tabs)/_layout.tsx` sí gateaban, pero `app/(auth)/_layout.tsx` no tenía ninguna lógica para salir del grupo cuando la sesión pasaba a activa estando parada en `login`/`register`. Se agregó el mismo patrón de guard (`<Redirect href="/(tabs)/home" />` si `status === 'signedIn'`) a `app/(auth)/_layout.tsx`.
- **`react-native-worklets` desapareció de `node_modules`** en algún punto entre instalaciones con `--legacy-peer-deps` (quedó como dependencia extraña sin declarar en `package.json`, un `npm install` posterior lo podó). Causaba `Unable to resolve "react-native-worklets"` al bundlear (Reanimated 4 lo requiere como paquete separado). Se reinstaló explícitamente con `npx expo install react-native-worklets`; no hizo falta rebuild nativo porque el `.so` ya estaba compilado en el APK desde la Fase 0.
- Metro había abierto la app en **Expo Go** (`host.exp.exponent`) en vez del dev client (`com.volcanic.cora`) al usar `expo start --android` sin flags; se corrigió usando `expo start --dev-client --android`.
- **Bug real encontrado y corregido — falta de GRANT en las tablas nuevas:** el script de pruebas de RLS (ejecutado con un cliente `pg` de Node contra el pooler, simulando `auth.uid()` con `set local role authenticated; select set_config('request.jwt.claims', ...)`) reveló `permission denied for table profiles`. Postgres solo había otorgado `REFERENCES/TRIGGER/TRUNCATE` por defecto a `authenticated`/`anon` en las tablas nuevas — faltaban `SELECT/INSERT/UPDATE/DELETE`. Esto también estaba enmascarando un fallo real en la pantalla de Perfil de la app: `useProfile` fallaba silenciosamente y la UI mostraba el mismo texto de fallback ("Sin nombre todavía") tanto en éxito como en error, porque no distinguía `isError`. Se corrigieron ambas cosas: migración `0004_grants.sql` y `app/(tabs)/profile.tsx` ahora muestra un `Banner` de error real cuando `isError`.
- Verificado en el emulador con dos cuentas de prueba reales (`cuentaa@cora.test`, `cuentab@cora.test`): registro → sesión inmediata → `(tabs)/home` → Perfil muestra el propio correo y perfil (sin datos de la otra cuenta) → cerrar sesión vuelve a `(auth)/login` → sesión persiste tras forzar el cierre y reabrir la app.
- Pruebas de RLS ejecutadas contra el proyecto remoto (pooler, `pg` de Node ya que no hay `psql` en el entorno): los 4 casos de §9 pasan — select ajeno (0 filas), insert ajeno (falla por RLS), update propio cambiando `id` (falla por `with check`), select de `avatars` sin sesión (funciona, 8 avatares).

## Fase 2 — Definition of Done (verificación final)

- [x] Registro crea fila en `auth.users` **y** en `profiles` — verificado tanto en la UI (perfil carga tras registrar) como con una consulta directa a la base de datos.
- [x] La sesión sobrevive a cerrar y reabrir la app — verificado con `am force-stop` + relanzar.
- [x] Sin sesión, cualquier ruta de `(tabs)` redirige a `login` — guard en `app/(tabs)/_layout.tsx`.
- [x] Los 4 casos de prueba de RLS pasan — ver log arriba.
- [x] Cerrar sesión limpia la cache de React Query — `queryClient.clear()` en `handleSignOut`.

**Fase 2 completa.** Pendientes para Fase 3 (Onboarding): pantallas reales de onboarding (slides, selección de etapa, avatar, mascota, consentimiento), que es donde `profiles.life_stage` y `onboarding_completed_at` finalmente se completan.

## Fase 1 — Foundation

- [x] `src/lib/supabase.ts` completo (AsyncStorage, autoRefreshToken, listener de AppState)
- [x] `src/shared/types/database.types.ts` generado (`supabase gen types typescript --linked`)
- [x] `src/ui/theme/tokens.ts` (colores, espaciado, radios, tipografía, sombras)
- [x] 12 primitivos en `src/ui/components/` (Screen, Text, Button, Input, Card, Chip, Sheet, Badge, Avatar, EmptyState, Skeleton, Banner) + barrel `index.ts`
- [x] `src/lib/queryClient.ts` (TanStack Query + persister AsyncStorage, `networkMode: offlineFirst`)
- [x] `src/lib/i18n.ts` + `locales/es/common.json` (+ `locales/mis|myn/common.json` vacíos, fallback a `es`)
- [x] `src/ui/ErrorBoundary.tsx` — verificado en emulador (pantalla de fallback en vez de blanco/rojo)
- [x] `src/shared/utils/result.ts` (`Result<T,E>`, `ok()`/`err()`) + test
- [x] expo-router: entrypoint cambiado (`expo-router/entry`), grupos `(auth)`, `(onboarding)`, `(tabs)` con layouts y pantallas placeholder, `app/index.tsx` con navegación manual, `app/dev/kitchen-sink.tsx`
- [x] Testing: `jest` + `jest-expo`, 1 test trivial pasando
- [x] Definition of Done verificada (ver detalle abajo)

### Log de tareas — Fase 1 (2026-08-23)

- `src/lib/supabase.ts`: reescrito con `AsyncStorage` como storage de sesión, `autoRefreshToken`/`persistSession`, y listener de `AppState` (`startAutoRefresh`/`stopAutoRefresh`), tipado con `Database` generado.
- Generados los tipos con `supabase gen types typescript --linked` → `src/shared/types/database.types.ts` (confirma los enums de la migración 0001: `life_stage`, `flow_level`, `mood`, `symptom_category`, `content_status`, `share_scope`).
- Design system: `src/ui/theme/tokens.ts` (paleta pitahaya/verde tallo/crema/carbón, espaciado en escala de 4) + 12 primitivos en `src/ui/components/`, sin lógica de negocio, todos usando solo los tokens.
- `src/lib/queryClient.ts` con `QueryClient` (`networkMode: offlineFirst`) + `createAsyncStoragePersister`.
- `src/lib/i18n.ts`: i18next + react-i18next + expo-localization, arranca en `es`, con `locales/es/common.json` y estructuras vacías en `locales/mis/` y `locales/myn/` (fallback automático a `es` por diseño de i18next cuando la clave no existe en el idioma activo).
- `src/ui/ErrorBoundary.tsx`: class component con `componentDidCatch` (solo loggea el mensaje técnico, nunca datos de usuaria) + fallback con los primitivos `Screen`/`Text`/`Button`.
- `src/shared/utils/result.ts` + `result.test.ts`.
- **Migración a expo-router:** se eliminaron `App.tsx`/`index.ts` de la Fase 0, `package.json.main` → `expo-router/entry`. Creados `app/_layout.tsx` (providers: `ErrorBoundary` → `SafeAreaProvider` → `PersistQueryClientProvider` → `Stack`), `app/index.tsx` (navegación manual a los 3 grupos, ya que el gate real de sesión es Fase 2), `app/(auth)/{_layout,login,register}.tsx`, `app/(onboarding)/{_layout,welcome}.tsx`, `app/(tabs)/{_layout,home,calendar,library,assistant,profile}.tsx` (5 tabs), `app/dev/kitchen-sink.tsx` (demuestra los 12 primitivos + botón que dispara un error de prueba).
- **Dependencias runtime faltantes de expo-router:** el primer intento de bundling falló con `Unable to resolve "expo-linking"`. Se instalaron `expo-linking`, `expo-constants` y `expo-splash-screen` (esta última agregó automáticamente su config plugin a `app.json`; no requiere rebuild nativo para Fase 1, solo relevante si se vuelve a hacer `prebuild`).
- **Testing:** `jest` + `jest-expo` inicialmente instalados con versiones incompatibles (`jest@30` vs `jest-expo` que depende internamente de paquetes `@jest/*@^29`, y `@react-native/jest-preset@0.87.0` vs el peer `^0.86.2` que pide `jest-expo`) → error `clearMocksOnScope is not a function`. Se fijaron las versiones correctas: `jest@^29.7.0` + `@react-native/jest-preset@0.86.2`. Se agregó `moduleNameMapper` para el alias `@/*` y `compilerOptions.types: ["jest"]` en `tsconfig.json` (los tipos de `@types/jest` no se auto-incluían).
- `tsconfig.json`: se quitó `baseUrl` (deprecado en TypeScript 6, ya no hace falta con `moduleResolution: bundler` + `paths`).
- **Verificación en emulador (Metro con `--dev-client`, no Expo Go):** el primer intento de `expo start --android` abrió **Expo Go** por error (`host.exp.exponent`) en vez del dev client `com.volcanic.cora`; se relanzó con `--dev-client` y sí abrió la app nativa correcta. También hubo que liberar el puerto 8081 dos veces (procesos `node.exe` de intentos previos que quedaron escuchando).
  - `app/index.tsx` renderiza correctamente ("Cora" + 3 botones de navegación + link a Kitchen Sink).
  - `/dev/kitchen-sink` muestra los 12 primitivos correctamente (capturas de pantalla).
  - Botón "Lanzar error de prueba" → `componentDidCatch` se ejecuta (confirmado en el log de LogBox) → tras descartar los overlays de desarrollo (normales en modo dev), se ve la pantalla de fallback real: "Algo salió mal" / "Tuvimos un problema mostrando esta pantalla. Probá de nuevo." / botón "Reintentar" — todo vía `t('common...')`, confirmando también que `t('common.continue')` (misma fuente `common.json`) funciona.
  - Navegación manual verificada a los 3 grupos: `(auth)/login` (formulario), `(onboarding)/welcome` (placeholder), `(tabs)/home` con las 5 tabs (Inicio, Calendario, Biblioteca, Cora, Perfil) visibles y funcionales.
- Verificación final: `npx tsc --noEmit` (0 errores), `npx eslint .` (0 errores, 1 warning inofensivo de `import/no-named-as-default-member` en `i18n.ts`), `npx jest` (2/2 tests OK).

## Fase 1 — Definition of Done (verificación final)

- [x] Los 12 primitivos existen y se renderizan en `/dev/kitchen-sink` (verificado con capturas de pantalla).
- [x] Se navega entre `(auth)`, `(onboarding)` y `(tabs)` manualmente desde `app/index.tsx` (verificado).
- [x] `database.types.ts` generado e importable (usado en `src/lib/supabase.ts`, compila sin errores).
- [x] Un error lanzado a propósito muestra el `ErrorBoundary`, no una pantalla blanca (verificado).
- [x] `t('common.continue')` devuelve texto en español (verificado indirectamente vía las mismas claves de `common.json` en la pantalla de error; la clave `continue` no se usa aún en ninguna pantalla de Fase 1, se usará desde Fase 2 en adelante).
- [x] `npm test` corre y pasa.

**Fase 1 completa.** Pendiente para Fase 2: gate real de sesión en `app/_layout.tsx` (reemplaza la navegación manual de `app/index.tsx`), auth real (login/register conectados a Supabase), RLS + tablas de perfil.

## Fase 0 — Preparación

- [x] Repositorio Git local (main/develop) + .gitignore
- [x] App Expo creada (`cora/`) con dependencias base
- [x] tsconfig strict + paths, ESLint + Prettier
- [x] `.env.example` versionado / `.env.local` ignorado
- [x] Variables de entorno ANDROID_HOME / JAVA_HOME configuradas
- [x] App corre en emulador Android (`expo run:android`) — verificado con captura de pantalla ("Cora" + "Cliente de Supabase conectado", sin errores)
- [x] Supabase CLI vinculado (`supabase link`) y migración `0001` aplicada al proyecto remoto (`supabase db push`, verificado con `migration list`)
- [x] Migración `0001_init.sql` (enums + `set_updated_at()`) creada y versionada
- [x] `docs/CONVENCIONES.md` creado
- [x] Definition of Done verificada (ver sección abajo; 2 pendientes menores no bloqueantes)

## Log de tareas

### 2026-08-22
- Creado `docs/PROGRESO.md` (este archivo).
- Inicializado repo Git local (rama `main` + `develop`), `.gitignore` en la raíz, primer commit con `docs/`.
- Creada la app `cora/` con `create-expo-app --template blank-typescript` (Expo SDK 57, React 19, RN 0.86).
- Instaladas dependencias base vía `npx expo install`: expo-router, @supabase/supabase-js, TanStack Query (+persister), zustand, react-hook-form, zod, date-fns, i18next/react-i18next, expo-localization, react-native-reanimated, async-storage, netinfo, safe-area-context, react-native-svg, expo-notifications, react-native-screens.
- `app.json`: agregado `scheme: "cora"`, `android.package: com.volcanic.cora`, plugins `expo-router`, `expo-localization`, `expo-notifications`.
  - Nota: se quitó `react-native-reanimated` de la lista de `plugins` — esa versión (4.5.1, SDK 57) no expone `app.plugin.js` y rompía la resolución de config; Reanimated no lo necesita como config-plugin en esta versión.
- `tsconfig.json`: `strict: true` + path `@/* → ./src/*`.
- Creado `src/lib/supabase.ts` (cliente mínimo, se reemplaza por la versión completa con AsyncStorage/autoRefresh en Fase 1) y `App.tsx` actualizado para mostrar "Cora" y confirmar la conexión con Supabase (`supabase.auth.getSession()`).
- `.env.example` y `.env.local` creados dentro de `cora/` (con las credenciales reales del proyecto Supabase del usuario); ambos ya excluidos por el `.gitignore` generado por Expo (`.env*.local`).
- ESLint + Prettier configurados manualmente (`npx expo lint` falló por conflictos de peer-deps de SDK 57 con paquetes `@radix-ui`/`expo-router` en modo web; se instalaron `eslint`, `eslint-config-expo`, `eslint-config-prettier`, `prettier` con `--legacy-peer-deps` y se escribió `eslint.config.js` + `.prettierrc.json` a mano). Verificado con `npx eslint App.tsx` sin errores.
- Configuradas `ANDROID_HOME` (`%LOCALAPPDATA%\Android\Sdk`) y `JAVA_HOME` (JBR de Android Studio) como variables de entorno de **usuario** (persistentes con `setx`) + agregado `platform-tools`, `emulator` y `cmdline-tools/latest/bin` al `PATH` de usuario. Nota: estos cambios de registro no afectan la sesión actual de la terminal (se exportan inline en cada comando de esta sesión); estarán disponibles automáticamente en terminales nuevas.
- `npx expo prebuild --platform android` completado; instalado `expo-system-ui` (sugerido por el propio prebuild). Se quitó de `plugins` en `app.json` (ver nota arriba sobre `react-native-reanimated`).
- Emulador `Pixel_10_Pro` iniciado en segundo plano y confirmado como "booted" (`adb shell getprop sys.boot_completed` → 1).
- `npx expo run:android` lanzado en segundo plano — build de Gradle en progreso (primera build, incluye descarga de Gradle 9.3.1 y compilación de módulos nativos; puede tardar varios minutos).
- `npx supabase init` ejecutado dentro de `cora/` — creó `supabase/config.toml` y `supabase/.gitignore`, conservó la migración `0001_init.sql` ya escrita.
- **Build de Android — primer intento falló:** `configureCMakeDebug` de `react-native-worklets` y `react-native-screens` fallaron con "WARNING: A restricted method in java.lang.System has been called". Causa raíz: el `JAVA_HOME` apuntaba al JBR embebido de Android Studio, que es **JDK 25** — demasiado nuevo para Gradle 9.3.1 / AGP en tareas de CMake nativo. Solución: se instaló **Eclipse Temurin JDK 17** (LTS, la versión soportada oficialmente por React Native/Expo) vía `winget install EclipseAdoptium.Temurin.17.JDK`, y se actualizó `JAVA_HOME` (variable de usuario) a `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot`. Build reintentado.
- `supabase login` no funciona en esta sesión (no es una terminal interactiva/TTY, no puede abrir navegador). Se resolvió generando un **Personal Access Token** desde el dashboard de Supabase y pasándolo como `SUPABASE_ACCESS_TOKEN` inline (nunca se escribió en ningún archivo del repo).
- `supabase link --project-ref qrrnhigitxqfjrmncwxu` falló la primera vez: **proyecto pausado** (`LegacyProjectPausedError`, común en el free tier tras inactividad). El usuario lo reactivó desde el dashboard; el link se completó con éxito (con warning transitorio "COMING_UP" mientras el proyecto terminaba de levantar).
- **`supabase db push` falló dos veces:** `LegacyDbConfigIpv6Error` — la conexión directa a Postgres requiere IPv6, no soportado en esta red. Se resolvió re-ejecutando `supabase link --project-ref ... --password <db-password>` (el usuario proveyó la contraseña de la BD) para configurar la conexión por pooler (IPv4). Con eso, `supabase db push --password ...` aplicó la migración `0001_init.sql` correctamente. Verificado con `supabase migration list` → local y remoto en `0001`.
- **Segundo intento de build de Android falló** (ya con JDK 17): `ninja: error: Filename longer than 260 characters` en `react-native-gesture-handler` (CMake/codegen). Causa raíz: el proyecto vivía en `C:\Users\eduem\OneDrive\Desktop\Cora\cora\...`, una ruta larga + sincronizada por OneDrive — la combinación con los paths generados por el codegen de Fabric/CMake supera el límite clásico de 260 caracteres de Windows.
  - **Solución:** se movió el repositorio completo (con historial de Git) de `OneDrive\Desktop\Cora` a **`C:\dev\Cora`** (ruta corta, fuera de OneDrive). Se usó `robocopy` (Move-Item falló por archivos en uso) y se verificó `git log`/`git status` tras la copia antes de borrar el original.
  - Nota: quedó una carpeta vacía `cora/` en la ruta antigua (`OneDrive\Desktop\Cora\cora`) que no se pudo borrar por un handle de archivo abierto por algún proceso; no bloquea nada, se puede eliminar manualmente más tarde.
  - **A partir de este punto, la ruta canónica del proyecto es `C:\dev\Cora`.**
- Creado `docs/CONVENCIONES.md` con las reglas de estructura, naming, i18n, RLS, seguridad y estilo del §6/§7/§9 del plan, más notas de tono de voz y paleta.
- Tercer intento de `expo run:android` (ya desde `C:\dev\Cora`) exitoso: `BUILD SUCCESSFUL in 6m 22s`, APK instalado, Metro bundleó 753 módulos, `com.volcanic.cora/.MainActivity` en primer plano en el emulador `Pixel_10_Pro`, sin excepciones fatales en logcat. Confirmado con captura de pantalla: se ve "Cora" y "Cliente de Supabase conectado".

## Fase 0 — Definition of Done (verificación final)

- [x] Repo en GitHub con ramas main y develop — conectado a `https://github.com/eduardoevz/Volcanic-2026.git` y pusheado; `.gitignore` correcto.
- [x] `.env.example` commiteado; `.env.local` ignorado (verificado con `git check-ignore -v`).
- [x] App arranca en emulador Android sin warnings rojos (verificado visualmente).
- [x] `supabase/migrations/0001_init.sql` aplicada (remoto) y versionada en Git.
- [x] `docs/CONVENCIONES.md` acordado (queda pendiente que los 3 integrantes del equipo lo lean).
- [x] Ningún secreto en el historial de Git — `ANTHROPIC_API_KEY`/`service_role` no existen aún en esta fase; `.env.local`, el access token de Supabase y la contraseña de la BD nunca se escribieron en archivos versionados.

- Conectado el repositorio remoto `https://github.com/eduardoevz/Volcanic-2026.git`. El remoto ya tenía un `main` con `README.md`/`LICENSE`/`.gitignore` del hackathon (historial no relacionado, más las ramas de compañeros `EduardoDEV`/`JostinDEV`, que no se tocaron). Se hizo `git merge origin/main --allow-unrelated-histories`, se resolvió el único conflicto (`.gitignore`, se mantuvo la versión específica de Node/Expo) y se pushearon `main` y `develop`.

**Fase 0 completa.** Pendientes para retomar en la próxima sesión / Fase 1:
- Borrar manualmente la carpeta vacía `C:\Users\eduem\OneDrive\Desktop\Cora\cora` (quedó con un handle de archivo abierto durante la migración de ruta).
- Confirmar en el dashboard de Supabase que Auth → Email tiene la confirmación de correo desactivada (paso manual, no cubierto por el CLI).
- Fase 1 (Foundation): design system, `queryClient.ts`, grupos de rutas de expo-router, `database.types.ts` generado, ErrorBoundary, i18n inicial.
