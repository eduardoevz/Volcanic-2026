// supabase/functions/embed-content/index.ts
// Fase 19 — CORA-114. Backfill de embeddings para educational_content.
// No la llama la app: la corre el equipo a mano (o un cron futuro) cada vez
// que se publica contenido nuevo. Protegida con un secreto simple de
// función (x-admin-key), no JWT de usuaria — no hay usuaria en este flujo.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders, handleCorsPreflight } from './cors.ts';
import { embedText, toPgVectorLiteral } from './gemini.ts';

/**
 * Este proyecto nunca configuró SUPABASE_SERVICE_ROLE_KEY como secreto
 * propio (cora-ai jamás lo necesitó — corre siempre como el JWT de la
 * usuaria). El runtime moderno de Edge Functions ya no auto-inyecta esa key
 * legacy; en su lugar inyecta SUPABASE_SECRET_KEYS (JSON, campo "default")
 * — verificado contra la documentación viva de Supabase antes de escribir
 * esto (primer intento real de esta función devolvió "permission denied
 * for table educational_content": la key legacy simplemente no existía).
 * Se prueba la legacy primero por si alguien la define a mano más adelante.
 */
function getServiceRoleKey(): string {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys);
    if (parsed.default) return parsed.default;
  }
  throw new Error('no_service_role_key_available');
}

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

  const adminKey = req.headers.get('x-admin-key');
  if (!adminKey || adminKey !== Deno.env.get('EMBED_CONTENT_ADMIN_KEY')) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, getServiceRoleKey());
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

  const { data: articles, error } = await supabase
    .from('educational_content')
    .select('id, title, summary')
    .is('embedding', null)
    .is('deleted_at', null);

  if (error) {
    return jsonResponse({ error: 'query_failed', message: error.message }, 500);
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const article of articles ?? []) {
    try {
      const values = await embedText(geminiApiKey, `${article.title}\n${article.summary}`, 'RETRIEVAL_DOCUMENT');
      const { error: updateError } = await supabase
        .from('educational_content')
        .update({ embedding: toPgVectorLiteral(values) })
        .eq('id', article.id);
      if (updateError) throw updateError;
      results.push({ id: article.id, ok: true });
    } catch (err) {
      results.push({ id: article.id, ok: false, error: (err as Error).message });
    }
  }

  return jsonResponse({ processed: results.length, results }, 200);
});
