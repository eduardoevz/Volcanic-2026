// supabase/functions/cora-ai/index.ts
// Edge Function de Cora IA — única superficie que toca GEMINI_API_KEY.
// Ver docs/PLAN_DE_IMPLEMENTACION.md §17 y §20 (Fase 7). Proveedor de IA:
// Gemini (gemini-flash-latest) — desviación consciente del plan original,
// que fijaba Anthropic; ver docs/PROGRESO.md Fase 7.

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { corsHeaders, handleCorsPreflight } from './cors.ts';
import { CORA_SYSTEM_PROMPT } from './systemPrompt.ts';
import {
  containsProhibitedPhrase,
  extractCitedIds,
  matchesEmergency,
  REFERRAL_CARD_TEXT,
  stripInvalidCitations,
} from './guardrails.ts';
import { embedText, toPgVectorLiteral } from './gemini.ts';

// Proveedor de IA: Gemini (desviación consciente del plan original, que fijaba
// Anthropic — decisión del equipo durante la Fase 7, ver docs/PROGRESO.md).
// gemini-3.6-flash (no el alias "gemini-flash-latest", que apunta a un
// preview inestable con 503 frecuentes — verificado empíricamente antes de
// fijar la versión).
const MODEL = 'gemini-3.6-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;
// Gemini gasta tokens de "pensamiento" (thoughtsTokenCount) del mismo
// presupuesto que maxOutputTokens antes de emitir texto visible — se
// observó empíricamente hasta ~800 tokens de pensamiento en preguntas
// simples. 1200 dejaba la respuesta vacía en prompts con contexto largo;
// 4096 da margen real para pensar + responder en ≤150 palabras.
const MAX_TOKENS = 4096;
const RATE_LIMIT_PER_HOUR = 20;
const RATE_LIMIT_PER_DAY = 100;
const TIMEOUT_MS = 25_000;

const RequestSchema = z.object({
  conversationId: z.string().uuid().nullable(),
  message: z.string().trim().min(1).max(2000),
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sseLine(payload: Record<string, unknown>) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function bucketAge(age: number): string {
  if (age < 18) return '12-17';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

async function countUserMessagesSince(supabase: SupabaseClient, userId: string, sinceIso: string) {
  const { count, error } = await supabase
    .from('ai_messages')
    .select('id, ai_conversations!inner(user_id)', { count: 'exact', head: true })
    .eq('role', 'user')
    .eq('ai_conversations.user_id', userId)
    .gte('created_at', sinceIso);
  if (error) throw error;
  return count ?? 0;
}

async function ensureConversation(supabase: SupabaseClient, userId: string, conversationId: string | null) {
  if (conversationId) return conversationId;
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

async function buildProfileContext(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('birth_year, life_stage')
    .eq('id', userId)
    .single();
  const stage = data?.life_stage ?? 'adultez';
  const age = data?.birth_year ? new Date().getFullYear() - data.birth_year : null;
  const ageRange = age !== null ? bucketAge(age) : 'no especificado';
  // Mismo fallback que ageFromBirthYear() en src/features/content/api.ts:
  // sin año de nacimiento se trata como adulta (sin restricción de min_age)
  // en vez de bloquear el filtro semántico por edad.
  return { stage, ageRange, age: age ?? 99 };
}

async function buildHealthAggregates(supabase: SupabaseClient, userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

  const [{ data: cycles }, { data: logs }, { data: symptomRows }] = await Promise.all([
    supabase.from('cycles').select('cycle_length').eq('user_id', userId).not('cycle_length', 'is', null),
    supabase.from('daily_logs').select('mood').eq('user_id', userId).gte('log_date', thirtyDaysAgo).not('mood', 'is', null),
    supabase
      .from('daily_log_symptoms')
      .select('symptom_id, symptom_catalog(label_es), daily_logs!inner(user_id, log_date)')
      .eq('daily_logs.user_id', userId)
      .gte('daily_logs.log_date', thirtyDaysAgo),
  ]);

  const avgCycle = cycles?.length
    ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length ?? 0), 0) / cycles.length)
    : null;

  const moodCounts = new Map<string, number>();
  for (const log of logs ?? []) {
    if (!log.mood) continue;
    moodCounts.set(log.mood, (moodCounts.get(log.mood) ?? 0) + 1);
  }
  const predominantMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const symptomCounts = new Map<string, { label: string; count: number }>();
  for (const row of symptomRows ?? []) {
    const label = (row as { symptom_catalog?: { label_es?: string } }).symptom_catalog?.label_es ?? 'síntoma';
    const entry = symptomCounts.get(row.symptom_id) ?? { label, count: 0 };
    entry.count += 1;
    symptomCounts.set(row.symptom_id, entry);
  }
  const topSymptom = [...symptomCounts.values()].sort((a, b) => b.count - a.count)[0]?.label ?? null;

  return { avgCycle, predominantMood, topSymptom };
}

const SPANISH_STOPWORDS = new Set([
  'que', 'los', 'las', 'del', 'por', 'para', 'con', 'una', 'uno', 'este',
  'esta', 'esto', 'como', 'pero', 'donde', 'cuando', 'sobre', 'entre',
  'durante', 'tengo', 'tener', 'hacer', 'puedo', 'desde', 'hasta', 'sido',
  'estar', 'siento', 'sentir', 'normal', 'porque', 'sido', 'estás', 'estoy',
]);

/**
 * `websearch_to_tsquery` combina todas las palabras con AND — una pregunta
 * completa en lenguaje natural casi nunca calza (verificado empíricamente:
 * "¿Qué es normal sentir durante la perimenopausia?" no matchea nada,
 * mientras que "perimenopausia" sola sí). Este fallback arma un OR manual
 * con las palabras significativas de la pregunta.
 */
function buildOrTsQuery(message: string): string {
  const words = message.toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
  const significant = [...new Set(words.filter((w) => w.length >= 4 && !SPANISH_STOPWORDS.has(w)))];
  return significant.map((w) => w.replace(/'/g, "''")).join(' | ');
}

async function fetchGroundingArticles(
  supabase: SupabaseClient,
  message: string,
  semantic: { apiKey: string; stage: string; age: number }
) {
  try {
    const primary = await supabase
      .from('educational_content')
      .select('id, title, summary')
      .textSearch('search_vector', message, { type: 'websearch', config: 'spanish' })
      .order('importance', { ascending: false })
      .limit(4);
    if (primary.error) throw primary.error;
    if (primary.data && primary.data.length > 0) return primary.data;

    const orQuery = buildOrTsQuery(message);
    if (orQuery) {
      const fallback = await supabase
        .from('educational_content')
        .select('id, title, summary')
        .textSearch('search_vector', orQuery, { config: 'spanish' })
        .order('importance', { ascending: false })
        .limit(4);
      if (fallback.error) throw fallback.error;
      if (fallback.data && fallback.data.length > 0) return fallback.data;
    }

    // Tercer nivel (Fase 19, CORA-114): el full-text falla seguido con
    // preguntas parafraseadas que no comparten lexemas con ningún artículo
    // (ver nota de buildOrTsQuery). Antes de rendirse, se prueba similitud
    // semántica sobre el mismo mensaje de la usuaria.
    const queryEmbedding = await embedText(semantic.apiKey, message, 'RETRIEVAL_QUERY');
    const semanticResult = await supabase.rpc('match_articles_by_embedding', {
      p_query_embedding: toPgVectorLiteral(queryEmbedding),
      p_stage: semantic.stage,
      p_age: semantic.age,
      p_match_count: 4,
    });
    if (semanticResult.error) throw semanticResult.error;
    return semanticResult.data ?? [];
  } catch {
    // Sin coincidencias no debe tumbar el chat entero — Cora simplemente no
    // cita nada si no hay grounding.
    return [];
  }
}

function buildContextBlock(
  stage: string,
  ageRange: string,
  aggregates: { avgCycle: number | null; predominantMood: string | null; topSymptom: string | null } | null,
  articles: { id: string; title: string; summary: string }[]
) {
  let block = `CONTEXTO DE ESTA USUARIA\n- Etapa de vida: ${stage} · Rango de edad: ${ageRange}\n- NO conocés su nombre, correo ni identidad. No los pidás.\n`;

  if (aggregates) {
    block += `\nAGREGADOS DE SALUD (con consentimiento explícito de la usuaria — nunca son datos crudos)\n`;
    if (aggregates.avgCycle) block += `- Duración promedio de ciclo: ${aggregates.avgCycle} días\n`;
    if (aggregates.predominantMood) block += `- Ánimo predominante del último mes: ${aggregates.predominantMood}\n`;
    if (aggregates.topSymptom) block += `- Síntoma más frecuente del último mes: ${aggregates.topSymptom}\n`;
  }

  block += `\n<biblioteca>\n`;
  block += articles.length
    ? articles.map((a) => `[[id:${a.id}]] ${a.title} — ${a.summary}`).join('\n')
    : '(sin artículos relevantes para esta pregunta)';
  block += `\n</biblioteca>`;

  return block;
}

type GeminiRole = 'user' | 'model';

type GeminiStreamResult = {
  finishReason: string | null;
  promptTokenCount: number;
  candidatesTokenCount: number;
};

/**
 * Llama a Gemini en streaming (`streamGenerateContent?alt=sse`) y va
 * emitiendo cada delta de texto vía `onDelta`. Formato confirmado de forma
 * empírica contra la API real (no documentación de terceros) antes de
 * escribir este código: cada línea `data: {...}` es un `GenerateContentResponse`
 * parcial con el texto en `candidates[0].content.parts[].text`.
 */
async function streamGemini(
  params: {
    apiKey: string;
    systemInstructionParts: string[];
    contents: { role: GeminiRole; text: string }[];
  },
  onDelta: (text: string) => void,
  signal: AbortSignal
): Promise<GeminiStreamResult> {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': params.apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: params.systemInstructionParts.map((text) => ({ text })) },
      contents: params.contents.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: { maxOutputTokens: MAX_TOKENS },
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const bodyText = await response.text().catch(() => '');
    const err = new Error(`gemini_http_${response.status}: ${bodyText}`);
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finishReason: string | null = null;
  let promptTokenCount = 0;
  let candidatesTokenCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // Gemini emite \r\n\r\n como separador de evento (confirmado de forma
    // empírica) — normalizar a \n evita que el parseo se quede esperando un
    // separador que nunca llega y termine devolviendo texto vacío.
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

    let sepIndex = buffer.indexOf('\n\n');
    while (sepIndex !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data: '));
      if (dataLine) {
        try {
          const chunk = JSON.parse(dataLine.slice('data: '.length));
          const candidate = chunk.candidates?.[0];
          const parts = candidate?.content?.parts ?? [];
          for (const part of parts) {
            if (typeof part.text === 'string' && part.text.length > 0) onDelta(part.text);
          }
          if (candidate?.finishReason) finishReason = candidate.finishReason;
          if (chunk.usageMetadata?.promptTokenCount) promptTokenCount = chunk.usageMetadata.promptTokenCount;
          if (chunk.usageMetadata?.candidatesTokenCount)
            candidatesTokenCount = chunk.usageMetadata.candidatesTokenCount;
        } catch {
          // línea SSE incompleta o corrupta — se ignora
        }
      }
      sepIndex = buffer.indexOf('\n\n');
    }
  }

  return { finishReason, promptTokenCount, candidatesTokenCount };
}

async function awardConversationPoints(supabase: SupabaseClient) {
  const today = new Date().toISOString().slice(0, 10);
  // No debe tumbar la respuesta si falla — los puntos son un extra, no el
  // propósito de la conversación.
  try {
    await supabase.rpc('award_mascot_points', {
      p_action: 'ai_conversation',
      p_points: 5,
      p_dedupe_key: `ai:${today}`,
    });
  } catch {
    // silencioso a propósito
  }
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
  const { conversationId: incomingConversationId, message } = parsed.data;

  // ── Rate limit propio (§17): 20/hora, 100/día ─────────────────────────
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [hourCount, dayCount] = await Promise.all([
    countUserMessagesSince(supabase, user.id, oneHourAgo),
    countUserMessagesSince(supabase, user.id, oneDayAgo),
  ]);
  if (hourCount >= RATE_LIMIT_PER_HOUR || dayCount >= RATE_LIMIT_PER_DAY) {
    return jsonResponse({ error: 'rate_limited', message: 'Alcanzaste el límite de conversación por hoy.' }, 429);
  }

  const conversationId = await ensureConversation(supabase, user.id, incomingConversationId);

  const { error: userMsgError } = await supabase
    .from('ai_messages')
    .insert({ conversation_id: conversationId, role: 'user', content: message });
  if (userMsgError) {
    return jsonResponse({ error: 'persist_failed' }, 500);
  }
  await awardConversationPoints(supabase);

  // ── Capa 1 — Pre-filtro determinista, sin llamar al modelo ────────────
  if (matchesEmergency(message)) {
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: REFERRAL_CARD_TEXT,
      flagged_red_flag: true,
    });
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseLine({ delta: REFERRAL_CARD_TEXT })));
        controller.enqueue(
          new TextEncoder().encode(
            sseLine({ done: true, conversationId, citedContentIds: [], flaggedRedFlag: true })
          )
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }

  // ── Contexto (capa 3 — grounding) ──────────────────────────────────────
  const { stage, ageRange, age } = await buildProfileContext(supabase, user.id);
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('ai_share_health_context')
    .eq('user_id', user.id)
    .single();
  const shareContext = prefs?.ai_share_health_context === true;

  const [aggregates, articles, recentMessages] = await Promise.all([
    shareContext ? buildHealthAggregates(supabase, user.id) : Promise.resolve(null),
    fetchGroundingArticles(supabase, message, { apiKey: geminiApiKey, stage, age }),
    incomingConversationId
      ? supabase
          .from('ai_messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(6)
          .then((r) => (r.data ?? []).reverse())
      : Promise.resolve([]),
  ]);

  const contextBlock = buildContextBlock(stage, ageRange, aggregates, articles);
  const validArticleIds = articles.map((a) => a.id);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (payload: Record<string, unknown>) => controller.enqueue(encoder.encode(sseLine(payload)));

      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;
      let errorPayload: { error: string; message: string } | null = null;

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS);

      try {
        const geminiContents: { role: GeminiRole; text: string }[] = [
          ...recentMessages.map((m: { role: string; content: string }) => ({
            role: (m.role === 'assistant' ? 'model' : 'user') as GeminiRole,
            text: m.content,
          })),
          { role: 'user', text: message },
        ];

        const result = await streamGemini(
          {
            apiKey: geminiApiKey,
            systemInstructionParts: [CORA_SYSTEM_PROMPT, contextBlock],
            contents: geminiContents,
          },
          (delta) => {
            fullText += delta;
            send({ delta });
          },
          abortController.signal
        );

        inputTokens = result.promptTokenCount;
        outputTokens = result.candidatesTokenCount;

        if (result.finishReason && ['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT'].includes(result.finishReason)) {
          fullText = REFERRAL_CARD_TEXT;
        } else if (!fullText.trim()) {
          // MAX_TOKENS puede agotarse en "pensamiento" antes de emitir texto
          // visible — mejor un mensaje honesto que una respuesta vacía.
          errorPayload = {
            error: 'empty_response',
            message: 'Cora no pudo terminar de pensar la respuesta. Probá con una pregunta más corta.',
          };
        }
      } catch (err) {
        const status = (err as Error & { status?: number }).status;
        if (abortController.signal.aborted) {
          errorPayload = { error: 'timeout', message: 'Cora tardó demasiado en responder. Probá de nuevo.' };
        } else if (status === 429 || status === 503) {
          errorPayload = { error: 'ai_rate_limit', message: 'Cora está muy solicitada, probá en un momento.' };
        } else {
          errorPayload = { error: 'unknown', message: 'Algo falló al generar la respuesta. Probá de nuevo.' };
        }
      } finally {
        clearTimeout(timeout);
      }

      if (errorPayload) {
        send(errorPayload);
        controller.close();
        return;
      }

      // ── Capa 4 — Post-filtro ──────────────────────────────────────────
      let finalText = stripInvalidCitations(fullText, validArticleIds);
      let flaggedRedFlag = false;
      if (containsProhibitedPhrase(finalText)) {
        finalText = REFERRAL_CARD_TEXT;
        flaggedRedFlag = true;
        send({ replaceWithFullText: finalText });
      }
      const citedContentIds = extractCitedIds(finalText);

      await supabase.from('ai_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: finalText,
        cited_content_ids: citedContentIds,
        flagged_red_flag: flaggedRedFlag,
        token_input: inputTokens,
        token_output: outputTokens,
      });

      send({ done: true, conversationId, citedContentIds, flaggedRedFlag });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});
