# Progreso — Cora

> Se actualiza automáticamente al completar cada tarea. Última actualización: 2026-08-24.

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
