// Copia de supabase/functions/embed-content/gemini.ts — ver esa nota sobre
// la forma verificada del request de embeddings contra la documentación
// viva de Google. Usado acá solo para el fallback semántico del grounding
// (Fase 19), la llamada de chat en sí sigue en streamGemini (index.ts).

export const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;

export type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

export async function embedText(apiKey: string, text: string, taskType: EmbeddingTaskType): Promise<number[]> {
  const response = await fetch(EMBEDDING_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      embedContentConfig: { outputDimensionality: EMBEDDING_DIMENSIONS, taskType },
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    const err = new Error(`gemini_embed_http_${response.status}: ${bodyText}`);
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  const json = await response.json();
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error('gemini_embed_unexpected_shape');
  }
  return values;
}

export function toPgVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`;
}
