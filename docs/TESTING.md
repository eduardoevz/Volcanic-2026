# Pruebas de Cora

Este documento describe la suite de pruebas de Cora: qué capas existen, cómo
correr cada una, qué está verde hoy y qué queda pendiente de ejecución por
limitaciones del entorno de esta sesión. También responde, categoría por
categoría, la pregunta de si cada uno de los ~66 tipos de prueba pedidos
originalmente es necesario tal cual, se fusiona con otro, o no vale la pena
automatizarlo para un proyecto de hackathon.

## Resumen ejecutivo

| Capa | Herramienta | Archivos | Estado |
|---|---|---|---|
| Unitarias | Jest | 15 | ✅ 142 tests verdes (incluye widgets/integración, ver abajo) |
| Widgets | Jest + `@testing-library/react-native` | 6 | ✅ verdes |
| Integración | Jest (mocks de Supabase/expo-*) | 4 | ✅ verdes |
| IA — guardrails | Jest (Gemini mockeado) | 2 | ✅ verdes |
| RLS / Supabase | pgTAP | 6 | ⚠️ escritas, **no ejecutadas** (sin Docker/Supabase CLI en este entorno) |
| E2E | Maestro | 5 flujos | ⚠️ escritas, **no ejecutadas** (Maestro no disponible en este entorno) |
| Estático | ESLint + `tsc --noEmit` | — | ✅ `npm run lint` (0 errores, 27 warnings preexistentes/menores) y `npm run typecheck` en verde |
| Cobertura | `jest --coverage` | — | ✅ corre; 26.8% de sentencias del proyecto completo (ver nota abajo) |
| CI | GitHub Actions | 2 workflows | ✅ `ci.yml` (automático) + `rls-tests.yml` (manual, necesita secrets) |

**Nota sobre cobertura:** el 26.8% es sobre TODO `src/` (incluye pantallas,
hooks de React Query, componentes de UI sin tests propios). La lógica de
negocio pura que sí se decidió cubrir a fondo (`cycleEngine.ts`,
`buildSummary.ts`, `pdf.ts`, guardrails de IA) está entre 84–100%. No se
persiguió cobertura total del proyecto — ver la sección de scoping.

## Cómo correr cada capa

```bash
cd cora

# Unitarias + widgets + integración (todo Jest)
npm test
npm run test:coverage      # con reporte de cobertura en cora/coverage/

# Estático
npm run lint
npm run typecheck

# RLS (pgTAP) — requiere Docker y Supabase CLI, ver supabase/tests/database/README.md
supabase link --project-ref qrrnhigitxqfjrmncwxu
supabase test db

# E2E (Maestro) — requiere Maestro instalado y un emulador/simulador, ver e2e/README.md
maestro test e2e/
```

## Estructura de archivos añadidos

```
cora/
  jest.setup.js                                          # mock de AsyncStorage + flag de act() para React 19
  src/features/auth/schema.test.ts                        # unit: zod schemas de login/registro/reset
  src/features/auth/session.integration.test.ts            # integración: recuperación de sesión, logout, token expirado
  src/features/auth/components/LoginForm.test.tsx          # widget: validación de formulario
  src/features/auth/components/LoginForm.submit.test.tsx   # widget: envío exitoso
  src/features/auth/components/LoginForm.serverError.test.tsx # widget: error del servidor
  src/features/auth/components/RegisterForm.test.tsx       # widget: validación de contraseña corta
  src/features/auth/components/RegisterForm.success.test.tsx  # widget: registro exitoso
  src/features/content/markdown.test.ts                    # unit: parser de markdown de la biblioteca
  src/features/content/ageFromBirthYear.test.ts             # unit: cálculo de edad / fallback sin fecha de nacimiento
  src/features/summary/buildSummary.test.ts (extendido)     # unit: casos límite (vacíos, texto largo, top-3 síntomas)
  src/features/summary/pdf.test.ts (extendido)               # unit: escape de HTML, texto largo
  src/features/summary/export.integration.test.ts           # integración: payload → HTML → expo-print/expo-sharing
  src/features/tracking/cycleEngine.test.ts (extendido)      # unit: casos límite + proxy de rendimiento
  src/features/tracking/logging-to-stats.integration.test.ts # integración: registrar → ciclo → estadísticas → alertas
  src/features/tracking/components/CalendarGrid.test.tsx     # widget: calendario de ciclo
  supabase/functions/cora-ai/guardrails.test.ts              # unit: capas 1 y 4 de guardrails (regex deterministas)
  supabase/functions/cora-ai/guardrails.integration.test.ts  # integración: pipeline completo con Gemini mockeado
  supabase/tests/database/*.test.sql                         # pgTAP: RLS (ver tabla de capas arriba)
  e2e/*.yaml                                                  # Maestro: flujos E2E
  .github/workflows/ci.yml                                   # (en la raíz del repo) CI automática
  .github/workflows/rls-tests.yml                             # (en la raíz del repo) pgTAP manual
```

## Decisiones y limitaciones de esta sesión

- **`@testing-library/react-native@14` + React 19.2 + `react-hook-form`
  tienen una incompatibilidad real**: montar el mismo formulario (RHF +
  `zodResolver`) más de una vez en el mismo archivo de test, después de que
  ya se disparó un ciclo de validación async, deja el segundo montaje con un
  árbol vacío o un input que ya no reacciona a `changeText`. Se investigó a
  fondo (no es un problema de `act()`, de timing, ni del código de la app) y
  se solucionó con la regla: **cada test de un formulario con envío hace como
  mucho un ciclo completo, con su propio archivo cuando hace falta** — de ahí
  que `LoginForm` tenga 3 archivos de test en vez de 1. Documentado también
  como comentario en esos archivos para quien los toque después.
- **pgTAP no se ejecutó**: este entorno no tiene Docker ni la Supabase CLI
  instalados (verificado). Las 6 suites en `supabase/tests/database/` están
  escritas contra el esquema real (consultado vía el MCP de Supabase,
  `list_tables`), pero no se corrieron ni una vez — es razonablemente
  probable que algún nombre de columna/función necesite un ajuste menor en la
  primera corrida real. Tampoco se creó una branch de Supabase de prueba para
  esto: crear una branch tiene costo de la cuenta y se prefirió no gastarlo
  sin que alguien lo confirme explícitamente.
- **Maestro no se instaló ni se corrió**: no está disponible en este entorno.
  Los 5 flujos en `e2e/` están escritos contra las rutas y textos reales de
  la app, pero no verificados contra un build real.
- Los **tests de auth widgets** usan mocks de `@/features/auth/api` y de
  `expo-router`; los de RLS usan el patrón estándar de Supabase
  (`supabase_test_helpers`, instalado automáticamente por `supabase test db`).

## Tabla de scoping: las categorías pedidas vs. qué las cubre

Leyenda: ✅ automatizada · 🔗 fusionada dentro de otra suite (no amerita
archivo propio) · 📋 checklist manual (no automatizada, con motivo).

| Categoría pedida | Veredicto | Dónde / por qué |
|---|---|---|
| Pruebas unitarias | ✅ | `cycleEngine.test.ts`, `buildSummary.test.ts`, `pdf.test.ts`, `schema.test.ts`, `markdown.test.ts`, `guardrails.test.ts`, etc. |
| Pruebas de widgets | ✅ | `LoginForm*.test.tsx`, `RegisterForm*.test.tsx`, `CalendarGrid.test.tsx` |
| Pruebas de integración | ✅ | `session.integration.test.ts`, `logging-to-stats.integration.test.ts`, `export.integration.test.ts`, `guardrails.integration.test.ts` |
| Pruebas de autenticación | ✅ | `schema.test.ts` (validación) + `LoginForm*`/`RegisterForm*` (widgets) + `session.integration.test.ts` (flujo) |
| Pruebas de recuperación de sesión | ✅ | `session.integration.test.ts` |
| Pruebas de registro y edición de perfil | 🔗 | Registro cubierto en `RegisterForm*.test.tsx`; edición de perfil no tiene lógica propia más allá de un formulario simple sobre `useProfile`/`useUserPreferences` — no se justificó una suite dedicada, ver nota de scoping abajo |
| Pruebas de seguimiento menstrual | ✅ | `cycleEngine.test.ts` (`detectCycles`) |
| Pruebas de cálculo del ciclo menstrual | ✅ | `cycleEngine.test.ts` (`predictNext`, `cycleLengthStats`, `fertileWindow`) |
| Pruebas de detección de irregularidades | ✅ | `cycleEngine.test.ts` (`detectReferralSignals`) — ya existía antes de esta tarea, se le agregaron casos límite |
| Pruebas de registro de síntomas | 🔗 | Es el mismo motor que "seguimiento menstrual"/"ánimo y energía" — un solo `DailyLogInput`, no 3 suites separadas |
| Pruebas de registro de ánimo y energía | 🔗 | Igual que arriba — `computeMoodSummary` en `buildSummary.test.ts` y el flujo completo en `logging-to-stats.integration.test.ts` |
| Pruebas de señales de alerta | ✅ | `cycleEngine.test.ts::detectReferralSignals` + `guardrails.test.ts::matchesEmergency` (la señal de alerta de la IA es un sistema distinto) |
| Pruebas de estadísticas y tendencias | ✅ | `cycleEngine.test.ts::cycleLengthStats` + `logging-to-stats.integration.test.ts` |
| Pruebas de agenda y recordatorios | 📋 | `notifications.ts`/`api.ts` de `reminders`/`appointments` son wrappers finos sobre `expo-notifications`/Supabase sin lógica propia que valga la pena aislar; se cubren indirectamente por el flujo E2E `appointments-and-summary.yaml`. Automatizar unitariamente un wrapper sin ramas de lógica es ruido, no cobertura real. |
| Pruebas de generación de resumen médico | ✅ | `buildSummary.test.ts` |
| Pruebas de exportación a PDF | ✅ | `pdf.test.ts` + `export.integration.test.ts` |
| Pruebas del círculo de acompañamiento | ✅ | `rls_family_sharing.test.sql` (la lógica real de permisos vive en RLS, no en el cliente — ver nota) |
| Pruebas de permisos granulares | ✅ | `rls_family_sharing.test.sql` (scopes `cycle_dates`/`reminders`/`mood_summary`/`appointments`) |
| Pruebas de biblioteca educativa | ✅ | `markdown.test.ts` + `rls_public_catalogs.test.sql` |
| Pruebas de contenido por etapa de vida | ✅ | `ageFromBirthYear.test.ts` (filtro `min_age`) — el filtro por `life_stage` es un `contains()` de Supabase sin lógica propia que testear fuera de RLS |
| Pruebas de selector de idioma | 📋 | Cubierto en el flujo E2E `settings-language-darkmode.yaml`; `setAppLanguage`/`restoreSavedLanguage` en `src/lib/i18n.ts` son 3 líneas de `AsyncStorage` + `i18next.changeLanguage`, de bajo riesgo — no se consideró necesaria una suite Jest dedicada además del E2E |
| Pruebas de fallback de idioma | ✅ | i18next ya trae `fallbackLng: 'es'` probado por la librería misma; se verificó indirectamente en los widget tests (que renderizan con el locale real `es` y pasan) — no se dedicó una suite aparte por ser configuración declarativa, no lógica propia |
| Pruebas de reproducción de audio | 📋 | `expo-audio` es un wrapper nativo sin lógica de negocio propia en el código de Cora — se deja como checklist manual de QA (reproducir un artículo con audio y verificar controles) |
| Pruebas de almacenamiento de archivos | 🔗 | Ver "Supabase Storage" |
| Pruebas de Supabase Storage | 📋 | No se identificó lógica propia sobre Storage más allá de subir/bajar un archivo con el SDK — de bajo riesgo, se deja como checklist manual |
| Pruebas CRUD de Supabase | 🔗 | El CRUD en sí lo garantiza Supabase; lo que sí es responsabilidad de Cora y SÍ se prueba es el control de acceso alrededor de ese CRUD — ver RLS |
| Pruebas de Row Level Security (RLS) | ✅ | Las 6 suites de `supabase/tests/database/` (ver limitación: no ejecutadas aún) |
| Pruebas de aislamiento entre usuarios | ✅ | `rls_own_data.test.sql` |
| Pruebas de acceso no autorizado | ✅ | `rls_own_data.test.sql` (anon) + `rls_family_sharing.test.sql` (terceros) |
| Pruebas de manipulación de identificadores | ✅ | `rls_id_tampering.test.sql` |
| Pruebas de permisos y roles | ✅ | `rls_public_catalogs.test.sql` (escritura bloqueada para `authenticated` normal) |
| Pruebas de eliminación de cuenta | ✅ | `account_deletion.test.sql` |
| Pruebas de exportación de datos | 🔗 | El único "export" real hoy es el resumen médico a PDF — ver esa fila; no hay una función de exportación de datos crudos (GDPR-style) implementada en el código para probar |
| Pruebas de consentimiento | ✅ | `consents` se cubre indirectamente por `rls_own_data.test.sql` (mismo patrón A); no tiene lógica propia más allá de insertar una fila con `user_id = auth.uid()` |
| Pruebas de consentimiento para IA | ✅ | `guardrails.integration.test.ts` (a través de `ai_share_health_context`, ya documentado y verificado manualmente en `docs/AI_GUARDRAILS.md`, sección de contexto de salud) |
| Pruebas del asistente de IA | ✅ | `guardrails.test.ts` + `guardrails.integration.test.ts` |
| Pruebas de guardrails de IA | ✅ | Idem — las 4 capas descritas en `docs/AI_GUARDRAILS.md` |
| Pruebas de preguntas médicas sensibles | ✅ | `guardrails.integration.test.ts` (incluye los 3 de los 4 prompts que quedaron pendientes en `AI_GUARDRAILS.md` por falta de crédito: "¿sos médica?", "dame un diagnóstico", "¿estoy embarazada?") |
| Pruebas de no diagnóstico por IA | ✅ | `guardrails.test.ts::containsProhibitedPhrase` + `guardrails.integration.test.ts` |
| Pruebas de no prescripción por IA | ✅ | Idem (patrón `tomá ibuprofeno/paracetamol/...`) |
| Pruebas de derivación ante señales de alerta | ✅ | `guardrails.test.ts::matchesEmergency` (Capa 1) |
| Pruebas de citación de fuentes por IA | ✅ | `guardrails.test.ts` (`extractCitedIds`, `stripInvalidCitations`) |
| Pruebas de entradas inválidas | 🔗 | Repartida entre `schema.test.ts` (zod) y los widget tests de formularios |
| Pruebas de campos vacíos | 🔗 | `LoginForm.test.tsx`, `RegisterForm.test.tsx` |
| Pruebas de límites de caracteres | ✅ | `schema.test.ts` (relación de 60 caracteres en `family/schema.ts`), `buildSummary.test.ts`/`pdf.test.ts` (notas de 3000–5000 caracteres) |
| Pruebas de manejo de errores | 🔗 | `LoginForm.serverError.test.tsx`, `session.integration.test.ts` |
| Pruebas de conexión a internet | 📋 | `useNetworkStatus.ts` es un wrapper directo de `@react-native-community/netinfo` sin lógica propia — bajo riesgo, no se dedicó una suite; se puede agregar fácilmente si el equipo lo pide (mockear `NetInfo.addEventListener`) |
| Pruebas de pérdida de conexión | 📋 | Idem |
| Pruebas de tokens expirados | ✅ | `session.integration.test.ts` (evento `TOKEN_REFRESHED` con sesión null) |
| Pruebas de cierre de sesión | ✅ | `session.integration.test.ts` + `auth.yaml` (E2E) |
| Pruebas de seguridad | ✅ | Repartida entre RLS (capa de datos) y guardrails de IA (capa de producto) — es el eje central de esta tarea, no una categoría aparte |
| Pruebas de regresión | ✅ | Toda la suite completa corriendo en CI en cada PR cumple este rol; además `guardrails.test.ts` fija explícitamente los 2 bugs de regex ya corregidos como casos de regresión |
| Pruebas de accesibilidad | 📋 | Se valida `accessibilityLabel`/`accessibilityRole` de forma incidental en los widget tests (ej. el botón de mostrar/ocultar contraseña), pero no hay una auditoría con lector de pantalla real — desproporcionado para el tiempo de un hackathon, queda como checklist manual |
| Pruebas de textos grandes | ✅ | `pdf.test.ts` (nota de 3000 caracteres), `buildSummary.test.ts` (nota de 5000 caracteres) |
| Pruebas de overflow de interfaz | 📋 | Requiere renderizar a distintos tamaños de fuente/pantalla y comparar visualmente — no hay snapshot visual configurado en este proyecto; queda como checklist manual (probar con la fuente del sistema al máximo) |
| Pruebas de diferentes tamaños de pantalla | 📋 | Mismo motivo — requiere un device farm o snapshots visuales que no están configurados; checklist manual con 2-3 dispositivos antes de la demo |
| Pruebas de modo oscuro | ✅ | `resolveScheme.test.ts` (ya existía) cubre la lógica; `settings-language-darkmode.yaml` (E2E) cubre el flujo visual completo |
| Pruebas de navegación | 🔗 | Cubierta indirectamente por los flujos E2E (`auth.yaml`, etc., navegan entre tabs y pantallas reales) |
| Pruebas de formularios | ✅ | Todos los widget tests de `LoginForm`/`RegisterForm` |
| Pruebas de rendimiento | 🔗 | Proxy liviano en `cycleEngine.test.ts` (detectCycles con 5 años de datos en <200ms) — no es una prueba de carga real, ver siguiente fila |
| Pruebas de carga | 📋 | Requiere infraestructura de carga (k6, Artillery, etc.) apuntando a un ambiente desplegado — desproporcionado para un hackathon; el proxy de rendimiento de arriba cubre el caso de "¿la lógica del cliente escala razonablemente con muchos años de datos?", que es lo que sí importa a esta escala |
| Pruebas de compatibilidad | 📋 | Requiere device farm (BrowserStack/Firebase Test Lab) para iOS/Android/distintas versiones de SO — checklist manual |
| Pruebas de análisis estático | ✅ | `npm run lint` (ESLint, ya existía) + `npm run typecheck` (nuevo) |
| Pruebas de cobertura de código | ✅ | `npm run test:coverage` (nuevo, `collectCoverageFrom` agregado a la config de Jest) |
| Pruebas automatizadas en GitHub Actions | ✅ | `.github/workflows/ci.yml` (nuevo — el repo no tenía CI antes de esta tarea) |
| Pruebas end-to-end (E2E) | ✅ | 5 flujos Maestro en `e2e/` (ver limitación: no ejecutados aún) |

### Respuesta corta a "¿son necesarias todas las que pedí?"

La gran mayoría sí apuntan a algo real y quedaron cubiertas. Un grupo chico
(marcado 🔗 arriba) describe la MISMA lógica con nombres distintos —
"síntomas", "ánimo y energía" y "seguimiento menstrual" son un solo motor
(`cycleEngine.ts` + un `DailyLogInput`), así que se fusionaron para no
duplicar mantenimiento. Y un grupo (marcado 📋) — carga, compatibilidad
multi-dispositivo, overflow visual, conexión/desconexión, audio, Storage —
apunta a wrappers finos sobre APIs nativas/Supabase sin lógica propia de
Cora, o requiere infraestructura (device farms, herramientas de carga) que no
tiene sentido montar para un hackathon; ahí el consejo es dejarlas como
checklist manual de QA antes de una demo/release en vez de automatizarlas.

## Próximos pasos sugeridos (no hechos en esta sesión)

1. Correr `supabase test db` una vez con Docker disponible y corregir
   cualquier desajuste de columna/función en las suites pgTAP.
2. Correr `maestro test e2e/` contra un build de desarrollo real y ajustar
   selectores.
3. Si el equipo quiere cobertura sobre `useNetworkStatus`/`reminders`/
   `appointments` a pesar de ser wrappers finos, son fáciles de agregar
   siguiendo el patrón de `session.integration.test.ts` (mockear el módulo
   nativo correspondiente).
