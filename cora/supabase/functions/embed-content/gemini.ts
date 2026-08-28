// Cliente mínimo del endpoint de embeddings de Gemini. Forma del request
// verificada contra la documentación viva de Google antes de escribir este
// código (docs.PLAN_DE_IMPLEMENTACION.md Fase 19 / mismo criterio que fijó
// MODEL en cora-ai/index.ts: no confiar en un nombre "recordado"):
// POST /v1beta/models/gemini-embedding-001:embedContent
//   { content: { parts: [{ text }] }, embedContentConfig: { outputDimensionality, taskType } }
// → { embedding: { values: number[], shape: number[] } }
// outputDimensionality y taskType existen también como campos top-level
// (forma vieja, deprecada) pero embedContentConfig es la forma vigente.

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

// pgvector recibe el vector como el literal de texto "[0.1,0.2,...]" — el
// cliente supabase-js no serializa arrays JS al formato de vector por sí solo.
export function toPgVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`;
}
