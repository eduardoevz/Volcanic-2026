-- 0013_health_directory.sql
-- Fase 14: directorio de salud (centros + especialistas). Catálogos públicos
-- de solo lectura, mismo patrón que content_categories/educational_content
-- (0008). Ver docs/PLAN_DE_IMPLEMENTACION.md §8, §29 (Fase 14).

-- ── health_centers — catálogo público ────────────────────────────────────────

create type public.health_center_type as enum ('hospital', 'centro_salud', 'clinica', 'casa_materna');

create table public.health_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.health_center_type not null,
  department text not null,
  municipality text not null,
  address text,
  phone text,
  latitude double precision,
  longitude double precision,
  services text[] not null default '{}',
  is_verified boolean not null default false,
  updated_at timestamptz not null default now()
);

create index on public.health_centers (department, municipality);
create index on public.health_centers (type);
create index on public.health_centers using gin (services);

alter table public.health_centers enable row level security;

create policy "public_read" on public.health_centers
  for select using (true);

create trigger set_health_centers_updated_at
  before update on public.health_centers
  for each row execute function public.set_updated_at();

grant select on public.health_centers to anon, authenticated;

-- ── specialists — catálogo público, consentimiento obligatorio ──────────────
-- A diferencia del resto de catálogos "públicos" del proyecto (política
-- `using (true)`), aquí la visibilidad está condicionada a consent_to_publish:
-- publicar datos de contacto de una persona real sin su consentimiento es un
-- problema legal, no un detalle (§8 del plan). Sin una fila con
-- consent_to_publish = true, nadie ve ese especialista, ni siquiera con RLS
-- "activo" — la política misma es la que decide, no solo su existencia.

create table public.specialists (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty text not null,
  health_center_id uuid references public.health_centers (id) on delete set null,
  phone text,
  email text,
  consent_to_publish boolean not null default false,
  is_verified boolean not null default false,
  updated_at timestamptz not null default now()
);

create index on public.specialists (specialty);
create index on public.specialists (health_center_id);

alter table public.specialists enable row level security;

create policy "public_read_consented" on public.specialists
  for select using (consent_to_publish = true);

create trigger set_specialists_updated_at
  before update on public.specialists
  for each row execute function public.set_updated_at();

grant select on public.specialists to anon, authenticated;
