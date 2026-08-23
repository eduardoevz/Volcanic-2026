# Progreso — Cora

> Se actualiza automáticamente al completar cada tarea. Última actualización: 2026-08-22.

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
