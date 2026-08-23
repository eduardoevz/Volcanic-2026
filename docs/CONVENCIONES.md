# Convenciones de código — Cora

> Basado en `docs/PLAN_DE_IMPLEMENTACION.md` §6. Léelo antes de escribir la primera pantalla.

## Estructura

- `app/` (expo-router) **no contiene lógica**. Un archivo de ruta importa un componente de `src/features/` y lo renderiza. Esto evita conflictos de merge en las rutas al trabajar en paralelo.
- Cada carpeta en `src/features/<dominio>/` es autocontenida: componentes, hooks, queries, tipos y lógica de ese dominio viven ahí adentro.
- Regla de oro: **si solo lo usa una feature, vive dentro de la feature.** `src/shared/` y `src/store/` son solo para lo genuinamente transversal (sesión, red, fechas, rutas, constantes globales).
- Imports cruzados entre features van al barrel `@/features/<dominio>` (su `index.ts`), nunca a rutas internas de otra feature.
- `src/ui/` es el design system: tokens + primitivos, sin lógica de negocio.
- `src/lib/` son integraciones externas (Supabase, React Query, i18n, notificaciones).

## TypeScript

- `strict: true` en todo el proyecto. Nada de `any`.
- Los tipos de la base de datos se generan con `supabase gen types typescript` → `src/shared/types/database.types.ts`. No se escriben a mano.
- Imports absolutos con el alias `@/*` → `src/*` (configurado en `tsconfig.json`).

## Nombres

| Qué | Convención | Ejemplo |
|---|---|---|
| Componentes | `PascalCase.tsx` | `DailyLogCard.tsx` |
| Hooks | `useAlgo.ts` | `useDailyLog.ts` |
| Todo lo demás (utils, schemas, api) | `camelCase.ts` | `formatCycleLength.ts` |
| Tablas y columnas SQL | `snake_case` | `daily_logs`, `log_date` |

## i18n

- **Sin strings visibles en JSX.** Siempre `t('clave')`. Es la única forma de que soportar más idiomas (o cambiar copy) no sea una reescritura después.
- Para copy que varía por etapa de vida, usar el helper de fallback (`tStage`, ver §13 del plan): `${key}.${stage}` con fallback a `${key}.default`.

## Base de datos / Supabase

- Todas las migraciones son archivos SQL numerados en `supabase/migrations/`, versionados en Git. **Nunca se editan retroactivamente** ni se hacen cambios desde el panel web — se pierden y no son reproducibles en otra máquina.
- RLS activado en **todas** las tablas sin excepción, aplicando mecánicamente el Patrón A (privado, `auth.uid() = user_id` en select/insert/update/delete, con `with check` también en `update`) o el Patrón B (catálogo público de solo lectura, solo `service_role` escribe).
- `created_at`/`updated_at` en toda tabla, con el trigger `set_updated_at()` (definido en `0001_init.sql`).

## Seguridad

- `ANTHROPIC_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` **nunca** van en el cliente ni en `.env.local` de Expo — solo como secretos de Edge Functions.
- Cualquier variable con prefijo `EXPO_PUBLIC_` se empaqueta en el APK y es públicamente legible. Lo que protege los datos es RLS, no el secreto de esas variables.
- `.env.local` nunca se commitea (verificar con `git check-ignore`). Solo `.env.example` va en Git.

## Estilo de código

- ESLint (`eslint-config-expo`) + Prettier. Correr `npm run lint` y `npm run format` antes de cada PR.
- Validación en tres capas cuando aplica: Zod en el cliente (UX inmediata) → Zod en la Edge Function (nunca confiar en el cliente) → `CHECK`/`FK`/`UNIQUE`/enums en PostgreSQL (última línea, siempre se cumple).

## Tono de voz / moodboard (referencia rápida para UI y copy)

- **Paleta:** magenta pitahaya (`#C2185B`), verde tallo, crema, carbón. (Se refina con el design system en Fase 1; este es el punto de partida.)
- **Tono:** español nicaragüense cercano, voseo ("vos podés", "contame cómo te sentís"), nunca clínico ni alarmista.
- Toda superficie con contenido clínico incluye un aviso de "no diagnostica, no sustituye atención médica".

## Testing

- **`jest` + `jest-expo`**, no Vitest — es el preset soportado oficialmente por Expo para React Native y el que realmente funciona en este proyecto en Windows. Versiones fijadas a propósito: `jest@^29.7.0` + `@react-native/jest-preset@0.86.2` (son las que `jest-expo` espera internamente; `jest@30` rompe con `clearMocksOnScope is not a function`).
- Alias `@/*` mapeado en `package.json#jest.moduleNameMapper` además de en `tsconfig.json` — hace falta en los dos lugares.

## Git

- Ramas `main` (estable) y `develop` (integración). Trabajo cotidiano en ramas de feature sobre `develop`.
- Migraciones, secretos y convenciones se revisan en cada PR — un secreto commiteado por error bloquea el merge hasta limpiarlo del historial.
- Al cerrar cada fase del plan de implementación: commit + `git push` a `main` y `develop` en `https://github.com/eduardoevz/Volcanic-2026.git`.
