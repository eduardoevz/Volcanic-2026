# Auditoría de RLS — Fase 9

> Ver `docs/PLAN_DE_IMPLEMENTACION.md` "Fase 9 — Calidad": "Auditoría de RLS
> tabla por tabla (checklist de 22 filas). Verificar que no queda ninguna
> tabla sin RLS."

**Nota sobre el número "22":** el texto original del plan estimó 22 filas
antes de que se ejecutara ninguna fase. Al llegar a Fase 9, el número real
de tablas creadas en el esquema `public` a través de las migraciones
`0001`–`0012` es **18**. Esta auditoría cubre las 18 reales — no se inventan
4 filas adicionales para cuadrar con la estimación original.

## Las 18 tablas

| # | Tabla | Migración | RLS | Políticas | Grants | Veredicto |
|---|---|---|:---:|---|---|---|
| 1 | `avatars` | 0002 | ✅ | `public_read_active`: SELECT `using (is_active)` | `select` → `anon, authenticated` | OK — catálogo de solo lectura |
| 2 | `profiles` | 0002 | ✅ | 4 políticas `own_*` en `id` | CRUD → `authenticated` | OK |
| 3 | `life_stage_history` | 0002 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |
| 4 | `user_preferences` | 0002 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |
| 5 | `consents` | 0002 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |
| 6 | `mascot_state` | 0002 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | **Ver nota abajo** |
| 7 | `mascot_events` | 0005 | ✅ | `own_select`/`own_insert` en `user_id` (sin update/delete, log de solo apéndice) | `select,insert` → `authenticated` | OK — consistente (sin política de escritura extra = sin grant extra) |
| 8 | `symptom_catalog` | 0006 | ✅ | `public_read_active`: SELECT `using (is_active)` | `select` → `anon, authenticated` | OK — catálogo |
| 9 | `daily_logs` | 0006 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |
| 10 | `daily_log_symptoms` | 0006 | ✅ | `own_select`/`own_insert`/`own_delete` vía `EXISTS` contra `daily_logs` (sin update — se borra y reinserta) | `select,insert,delete` → `authenticated` | OK |
| 11 | `cycles` | 0006 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |
| 12 | `content_categories` | 0008 | ✅ | `public_read`: SELECT `using (true)` | `select` → `anon, authenticated` | OK — taxonomía pública sin grants de escritura |
| 13 | `educational_content` | 0008 | ✅ | `public_read_published`: SELECT `using (status='published' and deleted_at is null)` | `select` → `anon, authenticated` | OK — borradores/archivados correctamente ocultos |
| 14 | `content_sources` | 0008 | ✅ | `public_read_of_published` vía `EXISTS` contra `educational_content` publicado | `select` → `anon, authenticated` | OK |
| 15 | `ai_conversations` | 0011 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |
| 16 | `ai_messages` | 0011 | ✅ | `own_select`/`own_insert` vía `EXISTS` contra `ai_conversations` (sin update/delete — transcripción inmutable) | `select,insert` → `authenticated` | OK |
| 17 | `medical_summaries` | 0012 | ✅ | `own_select`/`own_insert` en `user_id` (sin update/delete — foto fija inmutable) | `select,insert` → `authenticated` | OK |
| 18 | `reminders` | 0012 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK |

**20/20 tablas tienen RLS activo** (actualizado en Fase 14, ver sección
abajo). Ninguna tabla del esquema `public` quedó sin
`alter table ... enable row level security`. Ninguna política `update`
tiene un `with check` faltante — todas repiten `using (auth.uid() = ...)`
igual en ambas cláusulas. Las políticas con `using (true)`
(`content_categories`, `health_centers`) son de solo lectura sin ningún grant
de escritura asociado — no son una fuga, son catálogos públicos
intencionales.

## Actualización — Fase 14 (2 tablas nuevas)

| # | Tabla | Migración | RLS | Políticas | Grants | Veredicto |
|---|---|---|:---:|---|---|---|
| 19 | `health_centers` | 0013 | ✅ | `public_read`: SELECT `using (true)` | `select` → `anon, authenticated` | OK — catálogo público de solo lectura, mismo patrón que `content_categories` |
| 20 | `specialists` | 0013 | ✅ | `public_read_consented`: SELECT `using (consent_to_publish = true)` | `select` → `anon, authenticated` | **Ver nota abajo — no es `using (true)`** |

Verificado contra el proyecto remoto real (no solo revisión de SQL) el
2026-08-27 vía el servidor MCP oficial de Supabase: `list_tables` confirma
`rls_enabled: true` en ambas; consulta directa a `pg_policies` confirma el
`qual` exacto de cada política (`true` en `health_centers`,
`(consent_to_publish = true)` en `specialists`). `get_advisors` (seguridad)
no reportó ningún hallazgo nuevo atribuible a estas dos tablas.

**Nota sobre `specialists`:** a diferencia de todos los demás catálogos
"públicos" del proyecto (`content_categories`, `educational_content` vía
`status`, `health_centers`), la política de `specialists` no es
incondicional ni depende solo de un estado de publicación — depende de un
consentimiento explícito por fila (`consent_to_publish`). Esto es
intencional y coincide con la restricción no negociable de §8 del plan:
publicar datos de contacto de una persona real sin su consentimiento es un
problema legal, no un detalle. RLS activo por sí solo no bastaría para
proteger esto si la política fuera `using (true)` — es la condición
`consent_to_publish = true` la que hace el trabajo real. La semilla de esta
fase (`0014_seed_health_directory.sql`) solo inserta especialistas
**ficticios** precisamente porque no había consentimientos reales
verificables disponibles durante la implementación.

## Funciones `security definer`

Solo dos funciones corren con privilegios elevados en todo el proyecto:

- **`handle_new_user()`** (0002) — trigger `after insert on auth.users`, usa
  `new.id` de la fila que se está insertando, nunca un parámetro del
  llamante. No es invocable directamente por el cliente.
- **`award_mascot_points(p_action, p_points, p_dedupe_key)`** (0010) — todas
  sus lecturas/escrituras usan `auth.uid()` internamente; no acepta
  `user_id` como parámetro. Confirmado en el código: no hay ninguna ruta
  para que una usuaria otorgue puntos a otra cuenta.

El resto de RPCs que tocan gamificación (`complete_onboarding`,
`upsert_daily_log`, `mark_article_read`, `set_life_stage`) **no** son
`security definer` — corren como el llamante (`security invoker`, el
default), así que además dependen redundantemente del RLS de las tablas que
tocan. Ninguna acepta un `user_id` de parámetro.

## Riesgo aceptado conscientemente — `mascot_state`

`mascot_state` tiene, además de la RPC `award_mascot_points`, un grant
directo de `update` a `authenticated` con una política `own_update`
correctamente acotada a `auth.uid() = user_id`. Esto significa que una
usuaria podría, llamando a PostgREST directamente (no a través de la app),
modificar sus **propios** `points`/`level` sin pasar por la idempotencia, el
tope diario de 30 puntos, ni la fórmula de nivel de la RPC.

**No es una fuga entre usuarias** — RLS sigue confinando el `update` a la
fila propia. Es un hueco de integridad de negocio de severidad baja: en el
peor caso, alguien se auto-otorga puntos de gamificación falsos, un dato
cosmético sin valor financiero ni sensible. Se documenta como riesgo
aceptado en vez de revocar el grant directo (lo que rompería el patrón ya
usado sin problemas desde Fase 2 en las demás tablas `own_*`, y exigiría o
bien una tabla separada solo-RPC o un trigger que valide el origen de la
escritura — ninguna de las dos se justifica por el impacto real). Queda
anotado acá para revisitar si `mascot_state` alguna vez respalda algo con
valor real (p. ej. un sistema de recompensas canjeables).
