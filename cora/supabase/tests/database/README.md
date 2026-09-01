# Pruebas de RLS (pgTAP)

Estas suites automatizan la verificación manual que hasta ahora vivía solo en
`docs/RLS_AUDIT.md` (hecha a mano con dos cuentas reales vía el MCP de
Supabase). Usan la extensión [`supabase_test_helpers`](https://supabase.com/docs/guides/local-development/testing/pgtap-extended),
que `supabase test db` instala automáticamente — no hace falta instalarla a mano.

## Cómo correrlas

```bash
supabase link --project-ref qrrnhigitxqfjrmncwxu   # o el proyecto que corresponda
supabase test db
```

`supabase test db` levanta una base local (Docker) con todas las migraciones
de `supabase/migrations/` aplicadas y corre cada `*.test.sql` de esta carpeta
con pgTAP. **No** corre contra producción ni contra una branch remota por
defecto — es una base efímera local.

## Estado en este PR

**No se corrieron en esta sesión** — el entorno de desarrollo no tiene Docker
ni la Supabase CLI instalados (verificado: `docker --version` y `supabase
--version` fallan con "command not found"). Las suites están escritas y
listas, pero quedan como **pendientes de primera ejecución** hasta que
alguien las corra con Docker disponible (localmente o en el workflow manual
`.github/workflows/rls-tests.yml`, vía `workflow_dispatch`).

Antes de confiar en ellas, correrlas una vez y corregir cualquier typo de
columna/tabla que haya quedado mal contra el schema real (se escribieron
leyendo el schema vía `list_tables` del MCP de Supabase, no ejecutando SQL
contra la base, así que un desajuste menor es posible).

## Qué cubre cada archivo

- `rls_own_data.test.sql` — patrón A: `profiles`, `daily_logs`, `cycles`,
  `reminders`, `appointments` — una usuaria no puede leer ni escribir filas
  de otra.
- `rls_public_catalogs.test.sql` — patrón B: `avatars`, `symptom_catalog`,
  `content_categories`, `educational_content` (solo `status = 'published'`),
  `health_centers` — legibles por `anon`.
- `rls_family_sharing.test.sql` — patrón C: `family_circle_members` /
  `family_share_grants`, scopes exactos, revocación instantánea, y que
  `daily_logs` nunca se exponga vía family sharing.
- `rls_specialists_consent.test.sql` — `specialists` solo visible con
  `consent_to_publish = true`.
- `rls_id_tampering.test.sql` — intentar `insert`/`update` escribiendo el
  `user_id`/`owner_id` de otra persona en el payload.
- `account_deletion.test.sql` — que borrar `auth.users` elimine (por
  cascada) los datos de `profiles` y tablas dependientes.
