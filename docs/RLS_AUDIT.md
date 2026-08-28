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

**24/24 tablas tienen RLS activo** (actualizado en Fase 16, ver sección
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

## Actualización — Fase 15 (2 tablas nuevas + 2 políticas aditivas + patrón nuevo de RLS)

| # | Tabla | Migración | RLS | Políticas | Grants | Veredicto |
|---|---|---|:---:|---|---|---|
| 21 | `family_circle_members` | 0015 | ✅ | `owner_select`/`member_select` (SELECT), `owner_insert`, `owner_update` (`with check` prohíbe `status='accepted'` — solo el RPC `accept_family_invite` puede aceptar) | `select,insert,update` → `authenticated`, **sin `delete`** | OK — ver nota de diseño abajo (sin política de `update` para el familiar) |
| 22 | `family_share_grants` | 0015 | ✅ | `owner_select`/`member_select` vía `EXISTS` contra `family_circle_members`, `owner_insert` (exige membresía `accepted`), `owner_update` | `select,insert,update` → `authenticated` | OK |

Más 2 políticas **aditivas** (no reemplazan las `own_*` existentes — Postgres
combina políticas permisivas del mismo comando con OR):

| Tabla | Política nueva | Condición |
|---|---|---|
| `cycles` | `family_shared_select` | `has_active_grant(user_id, auth.uid(), 'cycle_dates')` |
| `reminders` | `family_shared_select` | `has_active_grant(user_id, auth.uid(), 'reminders')` |

`daily_logs` **no** recibe ninguna política nueva a propósito: el scope
`cycle_dates` cubre solo `cycles` (fechas), nunca las notas/síntomas crudos
de un registro diario. El scope `mood_summary` tampoco abre una política de
`select` sobre `daily_logs` — se resuelve con el RPC `get_family_mood_summary`
(agregación server-side, nunca devuelve una fila cruda).

**Tercer patrón de RLS del proyecto** (los otros dos ya están documentados en
`docs/CONVENCIONES.md`: Patrón A privado por `user_id`, Patrón B catálogo
público de solo lectura): **acceso condicionado a un grant de otra tabla**,
vía la función reusable `has_active_grant(owner_id, viewer_id, scope)`
(`security definer`, `stable`, `set search_path = public`). Es la primera
vez que una usuaria puede leer filas cuyo `user_id` no es el suyo.

**Nota de diseño — por qué `family_circle_members` no tiene política de
`update` para el familiar:** el diseño original evaluado permitía que un
familiar "saliera del círculo" con una política de `update`
(`using (member_user_id = auth.uid()) with check (member_user_id = auth.uid() and status = 'revoked')`).
Se descartó antes de aplicar la migración: ese `with check` solo fija
`member_user_id`/`status` en la fila nueva, pero no restringe qué **otras**
columnas cambian en la misma sentencia — un familiar podría, en el mismo
`update` que pone `status='revoked'`, reescribir `owner_id`,
`owner_display_name` o `invite_email` sin que la política lo bloquee (misma
trampa que esta misma página ya señala en `docs/CONVENCIONES.md` sobre
`with check` faltante en `update`). Se reemplazó por el RPC
`leave_family_circle()` — el familiar no tiene ningún grant de `update`
sobre esta tabla, solo `select`.

**Verificación funcional con dos cuentas reales, no solo estática** — el
2026-08-27, además de `list_tables`/`pg_policies`/`get_advisors` (mismo
procedimiento que Fase 14), se registraron dos cuentas reales
(`hackathonvolcanic+family-owner@gmail.com`/`+family-member@gmail.com`) y se
ejerció el flujo completo con **REST directo usando el `access_token` de
cada sesión** (`execute_sql` corre con privilegios elevados y no aplica
RLS, así que no sirve para este tipo de prueba). Los 20 checks
automatizados confirmaron: cero acceso sin grant; acceso exacto al otorgar
`reminders` (sin filtrar a `cycles`); el RPC de `mood_summary` agrega datos
sin exponer `daily_logs` crudo (confirmado con un `select` directo del
familiar contra `daily_logs` del owner → 0 filas); revocar un scope o la
membresía completa corta el acceso al instante; y los dos intentos de
bypass de los RPCs (`update` directo para auto-aceptar una invitación ajena,
o para que el owner ponga `status='accepted'` sin pasar por el RPC) fallan
por RLS. Las dos cuentas de prueba se eliminaron al terminar (cascada
limpia, sin datos de prueba remanentes en el proyecto real).

`get_advisors(security)` tras aplicar la migración: sin hallazgos nuevos
atribuibles a estas tablas más allá de que las 4 funciones nuevas son
ejecutables por `anon`/`authenticated` sin restricción explícita — mismo
nivel de riesgo ya aceptado para `award_mascot_points`/`handle_new_user`
(ver sección siguiente), porque las 4 se autoprotegen internamente con
`auth.uid()`/`auth.jwt()` y no aceptan ningún parámetro de identidad del
llamante.

## Actualización — Fase 16 (2 tablas nuevas + 1 política aditiva, reactiva el scope `appointments`)

| # | Tabla | Migración | RLS | Políticas | Grants | Veredicto |
|---|---|---|:---:|---|---|---|
| 23 | `pregnancies` | 0016 | ✅ | 4 políticas `own_*` en `user_id` | CRUD → `authenticated` | OK — patrón A idéntico a `cycles` |
| 24 | `appointments` | 0016 | ✅ | 4 políticas `own_*` en `user_id` + `family_shared_select` (patrón C, vía `has_active_grant`) | CRUD → `authenticated` | OK |

`family_shared_select` en `appointments` reusa `has_active_grant` sin ningún
cambio — la función ya existía desde Fase 15 (`0015_family_circle.sql`) y
fue diseñada para esto: el scope `'appointments'` estaba en el enum
`share_scope` desde `0001_init.sql` pero quedó excluido a propósito del
selector de la UI (`src/features/family/constants.ts`) hasta que esta tabla
existiera. Reactivado en Fase 16 sin tocar `has_active_grant` ni las
políticas de `cycles`/`reminders`.

Verificado contra el proyecto remoto real vía MCP: `list_tables` confirma
22→24, `pg_policies` confirma las 5 políticas exactas de `appointments`
(incluida `family_shared_select`) y las 4 de `pregnancies`, `get_advisors`
sin hallazgos nuevos. Verificación funcional adicional (2026-08-27, mismas
dos cuentas de prueba de Fase 15, REST con `access_token` de cada sesión):
sin grant el familiar ve 0 citas del owner, otorgar `appointments` da acceso
exacto a esa tabla, revocarlo lo corta de inmediato — no se repitieron los
20 checks completos de Fase 15 (esa lógica de `has_active_grant` ya está
probada), solo los 8 checks de la porción nueva. Cuentas de prueba
eliminadas al terminar.

## Actualización — Fase 18 (Storage, sin tablas nuevas de `public`)

Esta fase no agrega tablas a `public` (solo columnas nullable a tres tablas
existentes, sin cambios de RLS: `educational_content.audio_path`,
`avatars.name_mis`/`name_myn`, `symptom_catalog.label_mis`/`label_myn`).
Se crea el bucket de Storage `content-audio` (público de lectura, mismo
criterio que `public-assets` en §7 del plan).

**Nota sobre políticas temporales de `storage.objects`, ya revocadas:** para
subir un archivo de prueba real (un tono sintetizado, no contenido
narrado — ver `docs/PROGRESO.md` Fase 18) hizo falta crear 3 políticas
temporales (`insert`/`update`/`select` acotadas a `bucket_id = 'content-audio'`)
porque no hay `service_role` disponible en esta sesión y los bytes de un
archivo no se pueden insertar solo con SQL. Las 3 políticas se revocaron
inmediatamente después de subir el archivo — confirmado por
`select policyname from pg_policies where schemaname='storage' and tablename='objects'`
devolviendo 0 filas al terminar. El bucket queda, como estaba declarado,
sin ninguna política de escritura para `authenticated`/`anon`.

## Actualización — Fase 19 (1 tabla nueva + 1 RPC nueva)

| # | Tabla | Migración | RLS | Políticas | Grants | Veredicto |
|---|---|:---:|---|---|---|---|
| 25 | `device_push_tokens` | 0019 | ✅ | 4 políticas `own_*` en `user_id` (patrón A idéntico al resto) | CRUD → `authenticated` | OK |

Verificado contra el proyecto remoto real (no solo revisión de SQL) el
2026-08-27: `pg_tables.rowsecurity = true`, y `pg_policies` confirma el
`qual`/`with_check` exacto de las 4 políticas (`auth.uid() = user_id` en
las cuatro, sin excepción). No hay ninguna política de lectura pública —
a diferencia de `educational_content`, un token de push es dato privado
de la usuaria sin ningún caso de uso de lectura ajena.

**`match_articles_by_embedding(p_query_embedding, p_stage, p_age, p_match_count)`**
(0019) es `security definer`, pero no expone nada nuevo: el `where` interno
repite exactamente el mismo filtro que la política `public_read_published`
de `educational_content` (`status='published' and deleted_at is null`) más
`life_stages`/`min_age`, que ya son de lectura pública. Es `security
definer` únicamente para que el operador `<=>` use el índice `hnsw` de
forma eficiente, no para saltarse RLS.

**Nota sobre `send-push` (Edge Function, no RLS):** el acceso cruzado entre
usuarias (leer `device_push_tokens` del *owner* de un círculo familiar
para notificarlo) no pasa por una política RLS nueva — vive enteramente en
la Edge Function con `service_role`, que primero verifica con el JWT de
quien llama que es exactamente `member_user_id` de la membresía y que su
`status` ya es `'accepted'` antes de tocar los tokens de otra cuenta. Ver
`supabase/functions/send-push/index.ts` para el detalle; no se agregó una
política `family_shared_select` sobre `device_push_tokens` a propósito —
habría sido una superficie de RLS nueva para un caso de uso que la
verificación de la función ya cubre con más precisión (un evento puntual,
no una lectura continua).

## Funciones `security definer`

- **`handle_new_user()`** (0002) — trigger `after insert on auth.users`, usa
  `new.id` de la fila que se está insertando, nunca un parámetro del
  llamante. No es invocable directamente por el cliente.
- **`award_mascot_points(p_action, p_points, p_dedupe_key)`** (0010) — todas
  sus lecturas/escrituras usan `auth.uid()` internamente; no acepta
  `user_id` como parámetro. Confirmado en el código: no hay ninguna ruta
  para que una usuaria otorgue puntos a otra cuenta.
- **`accept_family_invite(p_membership_id)`** (0015) — usa `auth.uid()` y
  `auth.jwt()->>'email'` internamente; el `update` que ejecuta exige
  `status='pending'` y que el email del JWT coincida con `invite_email` de
  la fila. No acepta ningún identificador de usuaria como parámetro.
- **`leave_family_circle(p_membership_id)`** (0015) — usa `auth.uid()`
  internamente; el `update` exige `member_user_id = auth.uid()`. No acepta
  ningún identificador de usuaria como parámetro.
- **`has_active_grant(p_owner_id, p_viewer_id, p_scope)`** (0015) — a
  diferencia de las anteriores, **sí** recibe `p_viewer_id` como parámetro,
  pero siempre se invoca desde una política RLS con
  `auth.uid()` como ese argumento (`cycles`/`reminders`), nunca con un valor
  arbitrario del cliente — confirmado revisando las dos políticas que la
  usan, las únicas dos llamadas a esta función en todo el esquema.
- **`get_family_mood_summary(p_owner_id, p_days)`** (0015) — el `where`
  incluye `has_active_grant(p_owner_id, auth.uid(), 'mood_summary')`; sin
  grant activo, el conjunto siempre es vacío, sin excepción (no revela si
  `daily_logs` tiene filas).

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
