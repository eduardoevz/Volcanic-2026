# Progreso — Cora

> Se actualiza automáticamente al completar cada tarea. Última actualización: 2026-08-22.

## Fase 0 — Preparación

- [x] Repositorio Git local (main/develop) + .gitignore
- [x] App Expo creada (`cora/`) con dependencias base
- [x] tsconfig strict + paths, ESLint + Prettier
- [x] `.env.example` versionado / `.env.local` ignorado
- [x] Variables de entorno ANDROID_HOME / JAVA_HOME configuradas
- [ ] App corre en emulador Android (`expo run:android`) — build en progreso
- [x] Supabase CLI inicializado (`supabase init`) — falta `login` + `link` (requiere acción manual del usuario)
- [x] Migración `0001_init.sql` (enums + `set_updated_at()`) creada y versionada
- [x] `docs/CONVENCIONES.md` creado
- [ ] Definition of Done verificada

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
- **Pendiente de acción manual del usuario:** `supabase login` (o un access token) para poder hacer `supabase link --project-ref qrrnhigitxqfjrmncwxu` y aplicar la migración al proyecto remoto. Se le pidió al usuario ejecutarlo con el prefijo `!` en el chat.
- Creado `docs/CONVENCIONES.md` con las reglas de estructura, naming, i18n, RLS, seguridad y estilo del §6/§7/§9 del plan, más notas de tono de voz y paleta.
