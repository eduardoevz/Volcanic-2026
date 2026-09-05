# Seguridad y Buenas Prácticas — Cora

**Hackathon Nicaragua 2026 — Entregable "Seguridad y Buenas Prácticas"**

> Este documento distingue explícitamente entre lo que **ya está implementado y verificado** en el
> proyecto y lo que es un **modelo propuesto** para cumplir el ítem de la rúbrica (3 roles: Admin,
> Usuario y Auditor). Cora es hoy una app de consumo mono-usuaria (cada persona solo ve sus propios
> datos); no tiene un panel de administración. Documentamos honestamente esa realidad y proponemos
> cómo extenderla, en vez de simular un sistema de roles que no existe en el código.
> Repositorio: https://github.com/eduardoevz/Volcanic-2026

## 1. Buenas prácticas ya implementadas (verificadas en el código)

- **Row Level Security (RLS) en las 26 tablas** de la base de datos (Supabase/Postgres), auditado
  formalmente en [`docs/RLS_AUDIT.md`](../docs/RLS_AUDIT.md). Cada política usa
  `auth.uid() = user_id`: sin sesión válida, cero acceso a datos ajenos.
- **Cero secretos hardcodeados en el cliente.** La `service_role` key de Supabase y la API key de
  Gemini viven únicamente en Edge Functions server-side, nunca en el bundle de la app.
- **Sesión cifrada localmente**: `LargeSecureStore` cifra con AES-256 (clave en Keystore/Keychain
  vía `expo-secure-store`) antes de tocar `AsyncStorage` — no hay tokens en texto plano en el
  dispositivo.
- **PKCE** en login, login con Google y reset de contraseña.
- **Consentimiento explícito y revocable** antes de compartir cualquier dato con la IA
  (`Compartir contexto con Cora IA`, apagado por defecto — ver
  [`Entregables_Hackathon/Interfaz_y_Desarrollo.md`](Interfaz_y_Desarrollo.md), paso 7 del
  onboarding).
- **Círculo familiar con permisos granulares**: sin invitación aceptada, cero acceso — nunca
  implícito. Implementado con 2 RPCs `security definer` que solo devuelven señales agregadas
  (ej. "hoy podría necesitar apoyo"), nunca registros ni notas.
- **Datos públicos gateados fila por fila**: la única tabla de lectura pública (`specialists`)
  exige `consent_to_publish = true` por cada fila, no un flag global.
- **Sin inyección SQL**: todo el acceso a datos pasa por el query builder de Supabase o RPCs
  parametrizados, nunca por SQL concatenado a mano.
- **Código legible y convencional**: TypeScript estricto, ESLint, un módulo por feature
  (`src/features/*`), convenciones de commit y de marca documentadas en
  [`docs/CONVENCIONES.md`](../docs/CONVENCIONES.md).

## 2. Estado actual de roles (honesto)

Hoy el proyecto tiene, en la práctica, **un solo rol de aplicación**: `Usuario` — cualquier persona
autenticada, con acceso exclusivo a sus propios datos vía RLS. No existe una tabla `user_roles`, un
panel de administración, ni una cuenta de "auditor" en el código. El equivalente más cercano a un
rol elevado es la `service_role` key que usan las Edge Functions internas del backend (nunca
expuesta al cliente).

## 3. Modelo propuesto de 3 roles y permisos

Para cumplir el ítem de la rúbrica, proponemos extender el modelo actual — sin romper el
aislamiento por usuaria que ya funciona — agregando una columna `app_role` en `profiles`
(`'usuario' | 'admin' | 'auditor'`, por defecto `'usuario'`) y políticas RLS adicionales que leen
ese rol vía una función `security definer` (patrón ya usado en el proyecto para el círculo
familiar).

| Rol | Quién lo tendría | Permisos | Qué NO puede hacer |
| --- | --- | --- | --- |
| **Admin** | Equipo de Cora (staff del backend, hoy solo vía `service_role` en Edge Functions) | Gestionar el catálogo de contenido (`educational_content`, `content_categories`, `content_sources`), moderar el directorio de salud (`health_centers`, `specialists`), gestionar `symptom_catalog` y `avatars`. Acceso de **escritura solo a tablas de catálogo/contenido**, nunca a datos clínicos de usuarias. | Leer `daily_logs`, `cycles`, `pregnancies`, `medical_background` ni ninguna tabla con `user_id` de una usuaria — esas siguen protegidas por RLS `auth.uid() = user_id` sin excepción de rol. |
| **Usuario** *(ya implementado)* | Cualquier persona registrada en la app | Lectura y escritura exclusiva de sus propias filas (`user_id = auth.uid()`) en las 26 tablas: registros diarios, ciclos, antecedentes médicos, citas, círculo familiar, conversaciones con la IA. | Leer o modificar datos de cualquier otra usuaria, incluso dentro de su círculo familiar (solo ve señales agregadas vía RPC, nunca la fila real). |
| **Auditor** | Persona externa de seguridad/cumplimiento, o el propio equipo en revisiones periódicas | **Solo lectura**, y solo de metadatos/agregados: políticas RLS activas (`pg_policies`), logs de acceso, conteos y estructura de tablas — nunca el contenido clínico de ninguna fila. Pensado para poder correr la batería de `docs/RLS_AUDIT.md` sin necesitar ver datos reales de usuarias. | Escribir cualquier tabla. Leer columnas de contenido clínico o personal (notas de síntomas, mensajes de IA, antecedentes médicos), aunque sea en agregado. |

### Boceto de políticas RLS para los 3 roles

```sql
-- Columna de rol, por defecto 'usuario' (no rompe el modelo actual)
alter table profiles add column app_role text not null default 'usuario'
  check (app_role in ('usuario', 'admin', 'auditor'));

-- Función security definer para leer el rol sin recursión de RLS
create or replace function public.current_app_role()
returns text language sql security definer stable as $$
  select app_role from profiles where id = auth.uid();
$$;

-- Admin: puede escribir el catálogo de contenido, nunca datos clínicos
create policy "admin_manage_content" on educational_content
  for all using (current_app_role() = 'admin');

-- Auditor: solo lectura de políticas activas, nunca de datos de usuarias
create policy "auditor_read_policies" on pg_policies
  for select using (current_app_role() = 'auditor');

-- Usuario (ya vigente en las 26 tablas, sin cambios):
create policy "own_rows_only" on daily_logs
  for all using (auth.uid() = user_id);
```

## 4. Por qué este diseño y no un rol "todopoderoso"

El principio guía es el mismo que ya rige el círculo familiar y la IA en el código real: **ningún
rol elevado gana acceso a datos clínicos personales por defecto**. Un `Admin` de catálogo no
necesita ver el diario de síntomas de nadie para mantener la biblioteca educativa, y un `Auditor`
de seguridad necesita ver *que las políticas existen y funcionan*, no el contenido que protegen.
Separar "puede administrar contenido" de "puede leer salud personal" es lo que evita que un solo
rol comprometido exponga toda la base de usuarias — el mismo razonamiento detrás del rediseño de
permisos del círculo familiar documentado en `docs/RLS_AUDIT.md`.
