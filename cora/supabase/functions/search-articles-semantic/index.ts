// supabase/functions/search-articles-semantic/index.ts
// Fase 19 — CORA-114. Fallback semántico del buscador de la Biblioteca:
// useSearchArticles.ts primero intenta el full-text del cliente
// (searchArticles en src/features/content/api.ts, gratis y sin latencia de
// red externa); si devuelve 0 resultados, llama a esta función. No puede
// resolverse en el cliente porque requiere GEMINI_API_KEY, que nunca puede
// tocar el bundle (docs/PLAN_DE_IMPLEMENTACION.md §7/§9).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { corsHeaders, handleCorsPreflight } from './cors.ts';
import { embedText, toPgVectorLiteral } from './gemini.ts';

const LIFE_STAGES = ['adolescencia', 'adultez', 'embarazo', 'perimenopausia', 'mayor'] as const;

const RequestSchema = z.object({
  query: z.string().trim().min(1).max(200),
  stage: z.enum(LIFE_STAGES),
  age: z.number().int().min(0).max(120),
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const parsed = RequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonResponse({ error: 'invalid_body', details: parsed.error.issues }, 400);
  }
  const { query, stage, age } = parsed.data;

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    const queryEmbedding = await embedText(geminiApiKey, query, 'RETRIEVAL_QUERY');

    const { data, error } = await supabase.rpc('match_articles_by_embedding', {
      p_query_embedding: toPgVectorLiteral(queryEmbedding),
      p_stage: stage,
      p_age: age,
      p_match_count: 8,
    });
    if (error) throw error;

    return jsonResponse({ results: data ?? [] }, 200);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 429 || status === 503) {
      return jsonResponse({ error: 'ai_rate_limit', results: [] }, 200);
    }
    return jsonResponse({ error: 'search_failed', results: [] }, 200);
  }
});
