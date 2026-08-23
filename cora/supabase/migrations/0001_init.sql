-- 0001_init.sql
-- Fase 0: enums base y función utilitaria de auditoría.
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §7-8 para el detalle del modelo de datos completo.

create type public.life_stage as enum (
  'adolescencia',
  'adultez',
  'embarazo',
  'perimenopausia',
  'mayor'
);

create type public.flow_level as enum (
  'none',
  'spotting',
  'light',
  'medium',
  'heavy'
);

create type public.mood as enum (
  'great',
  'good',
  'neutral',
  'low',
  'difficult'
);

create type public.symptom_category as enum (
  'physical',
  'emotional',
  'digestive',
  'skin',
  'sleep',
  'other'
);

create type public.content_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.share_scope as enum (
  'cycle_dates',
  'appointments',
  'reminders',
  'mood_summary'
);

-- Trigger utilitario: mantiene updated_at al día en cualquier tabla que lo use.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
