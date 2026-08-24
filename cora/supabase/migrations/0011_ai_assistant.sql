-- 0011_ai_assistant.sql
-- Fase 7: Cora IA — conversaciones y mensajes. La Edge Function `cora-ai` es
-- la única superficie que llama a Anthropic; estas tablas solo persisten el
-- historial ya generado (o el mensaje/tarjeta fija del pre-filtro).
-- Ver docs/PLAN_DE_IMPLEMENTACION.md §17, §20 (Fase 7).

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create policy "own_select" on public.ai_conversations
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.ai_conversations
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.ai_conversations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.ai_conversations
  for delete using (auth.uid() = user_id);

create trigger set_ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.ai_conversations to authenticated;

-- ── ai_messages — transcripción inmutable, sin update/delete ───────────────
-- No tiene user_id propio: la propiedad se verifica a través de
-- ai_conversations (mismo patrón puente que daily_log_symptoms en 0006).

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  cited_content_ids uuid[] not null default '{}',
  flagged_red_flag boolean not null default false,
  token_input int,
  token_output int,
  created_at timestamptz not null default now()
);

create index on public.ai_messages (conversation_id, created_at);

alter table public.ai_messages enable row level security;

create policy "own_select" on public.ai_messages
  for select using (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
        and ai_conversations.user_id = auth.uid()
    )
  );
create policy "own_insert" on public.ai_messages
  for insert with check (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
        and ai_conversations.user_id = auth.uid()
    )
  );

grant select, insert on public.ai_messages to authenticated;
