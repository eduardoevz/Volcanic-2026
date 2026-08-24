-- 0008_content.sql
-- Fase 5: biblioteca educativa (categorías, artículos, fuentes) + RPC de
-- lectura idempotente. Ver docs/PLAN_DE_IMPLEMENTACION.md §15, §20 (Fase 5).

-- ── content_categories — catálogo público ───────────────────────────────────

create table public.content_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_es text not null,
  description_es text,
  icon text,
  color text,
  sort_order smallint not null default 0
);

alter table public.content_categories enable row level security;

create policy "public_read" on public.content_categories
  for select using (true);

grant select on public.content_categories to anon, authenticated;

-- ── educational_content — artículos ──────────────────────────────────────────
-- El contenido es datos, no código: publicar un artículo es una fila nueva,
-- no un deploy. search_vector se genera en la propia columna (español).

create table public.educational_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'es',
  title text not null,
  summary text not null,
  body_md text not null,
  category_id uuid not null references public.content_categories (id),
  life_stages life_stage[] not null,
  min_age smallint not null default 0,
  importance smallint not null default 3 check (importance between 1 and 5),
  author_name text,
  reviewed_by_name text,
  reviewed_by_credentials text,
  reviewed_at date,
  cover_emoji text not null default '📄',
  reading_minutes smallint not null default 3,
  status content_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  search_vector tsvector generated always as (
    to_tsvector('spanish', title || ' ' || summary || ' ' || body_md)
  ) stored,
  unique (slug, locale)
);

create index on public.educational_content using gin (life_stages);
create index on public.educational_content using gin (search_vector);
create index on public.educational_content (status, published_at desc);

alter table public.educational_content enable row level security;

create policy "public_read_published" on public.educational_content
  for select using (status = 'published' and deleted_at is null);

create trigger set_educational_content_updated_at
  before update on public.educational_content
  for each row execute function public.set_updated_at();

grant select on public.educational_content to anon, authenticated;

-- ── content_sources — fuentes citadas, 1:N con el artículo ──────────────────

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.educational_content (id) on delete cascade,
  label text not null,
  organization text not null,
  url text not null,
  published_year smallint,
  sort_order smallint not null default 0
);

alter table public.content_sources enable row level security;

create policy "public_read_of_published" on public.content_sources
  for select using (
    exists (
      select 1 from public.educational_content
      where educational_content.id = content_sources.content_id
        and educational_content.status = 'published'
        and educational_content.deleted_at is null
    )
  );

grant select on public.content_sources to anon, authenticated;

-- ── RPC: marcar un artículo como leído (idempotente, +5 puntos) ────────────

create or replace function public.mark_article_read(p_article_id uuid)
returns void
language plpgsql
as $$
declare
  v_awarded integer;
begin
  insert into public.mascot_events (user_id, action_type, points, dedupe_key)
  values (auth.uid(), 'article_read', 5, 'article_read:' || p_article_id::text)
  on conflict (user_id, dedupe_key) do nothing;

  get diagnostics v_awarded = row_count;

  if v_awarded > 0 then
    update public.mascot_state
    set points = points + 5
    where user_id = auth.uid();
  end if;
end;
$$;

grant execute on function public.mark_article_read(uuid) to authenticated;
