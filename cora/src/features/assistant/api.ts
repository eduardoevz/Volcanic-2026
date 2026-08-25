import { fetch } from 'expo/fetch';

import { supabase } from '@/lib/supabase';
import { sendMessageStreamMock } from './mockResponses';

export type ChatSSEEvent =
  | { delta: string }
  | { replaceWithFullText: string }
  | { done: true; conversationId: string; citedContentIds: string[]; flaggedRedFlag: boolean }
  | { error: string; message: string };

/**
 * Streaming vía `expo/fetch` (no el `fetch` global de React Native, que no
 * expone `response.body` como ReadableStream real) — lee el SSE propio de la
 * Edge Function `cora-ai` chunk a chunk. Ver docs/PLAN_DE_IMPLEMENTACION.md §17.
 *
 * Plan B de demo (§26/Fase 10): con `EXPO_PUBLIC_AI_MOCK=true` no se llama a
 * la Edge Function — se simulan los mismos eventos SSE con respuestas
 * pregrabadas, para poder demostrar la arquitectura si el proveedor de IA
 * falla o va lento en vivo.
 */
export async function sendMessageStream(
  input: { conversationId: string | null; message: string },
  onEvent: (event: ChatSSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  if (process.env.EXPO_PUBLIC_AI_MOCK === 'true') {
    return sendMessageStreamMock(input, onEvent);
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('Sin sesión activa.');

  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cora-ai`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
    signal: signal ?? null,
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(`cora-ai respondió ${response.status}: ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIndex = buffer.indexOf('\n\n');
    while (sepIndex !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data: '));
      if (dataLine) {
        try {
          onEvent(JSON.parse(dataLine.slice('data: '.length)) as ChatSSEEvent);
        } catch {
          // Línea SSE incompleta o corrupta — se ignora, no debe tumbar el chat.
        }
      }
      sepIndex = buffer.indexOf('\n\n');
    }
  }
}
