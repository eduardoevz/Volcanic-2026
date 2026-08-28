-- 0019_semantic_search_and_push.sql
-- Fase 19: CORA-114 (búsqueda semántica con pgvector, complementa el
-- full-text ya existente) + CORA-113 (push notifications remotas — tabla de
-- tokens de dispositivo; el envío en sí vive en la Edge Function send-push).
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §29 (Fase 19).

-- ── CORA-114 — embeddings de contenido ───────────────────────────────────

create extension if not exists vector;

-- gemini-embedding-001 con outputDimensionality=768 (ver
-- supabase/functions/embed-content — dimensión fija elegida para que el
-- índice hnsw sea barato con ~30 artículos, no por límite del modelo).
alter table public.educational_content add column embedding vector(768);

create index educational_content_embedding_idx
  on public.educational_content using hnsw (embedding vector_cosine_ops);

-- security definer solo para poder ordenar por <=> vía el índice sin
-- reexponer nada que la política "public_read_published" ya no exponga
-- (misma tabla, mismo filtro de status/deleted_at).
create or replace function public.match_articles_by_embedding(
  p_query_embedding vector(768),
  p_stage life_stage,
  p_age integer,
  p_match_count integer default 4
)
returns table (id uuid, title text, summary text, similarity float)
language sql
stable
security definer
set search_path = public
as $$
  select
    ec.id,
    ec.title,
    ec.summary,
    1 - (ec.embedding <=> p_query_embedding) as similarity
  from public.educational_content ec
  where ec.status = 'published'
    and ec.deleted_at is null
    and ec.embedding is not null
    and ec.life_stages @> array[p_stage]
    and ec.min_age <= p_age
  order by ec.embedding <=> p_query_embedding
  limit p_match_count;
$$;

grant execute on function public.match_articles_by_embedding(vector(768), life_stage, integer, integer)
  to authenticated;

-- ── CORA-113 — tokens de push por dispositivo ────────────────────────────
-- Patrón A (§7 del plan): datos privados de la usuaria, RLS completa.

-- Único por (user_id, token) y no por token a secas: un token global único
-- forzaría el upsert a pisar la fila de OTRA usuaria en un cambio de cuenta
-- en el mismo dispositivo, y "own_update" (más abajo) se lo bloquearía a
-- mitad del on conflict. Con el par, cada cuenta tiene su propia fila y el
-- caso de "dos cuentas, mismo dispositivo" simplemente deja dos filas.
create table public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  device_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

alter table public.device_push_tokens enable row level security;

create policy "own_select" on public.device_push_tokens
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.device_push_tokens
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.device_push_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.device_push_tokens
  for delete using (auth.uid() = user_id);

create trigger set_device_push_tokens_updated_at
  before update on public.device_push_tokens
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.device_push_tokens to authenticated;
