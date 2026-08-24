import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { sendMessageStream } from '@/features/assistant/api';
import { checkMascotEvolution } from '@/features/mascot';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useSession } from '@/shared/hooks/useSession';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'referral';
  content: string;
  citedContentIds?: string[];
  pending?: boolean;
};

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local-${localIdCounter}`;
}

/**
 * Estado del chat vive solo en memoria del componente — el chat de IA nunca
 * se persiste (ni en React Query cache, ni en AsyncStorage), a propósito.
 * Ver docs/PLAN_DE_IMPLEMENTACION.md §18.
 */
export function useChat() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      if (!isOnline) {
        setErrorMessage('Cora necesita internet para conversar.');
        return;
      }

      setErrorMessage(null);
      setIsSending(true);

      const userMessage: ChatMessage = { id: nextLocalId(), role: 'user', content: trimmed };
      const assistantId = nextLocalId();
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', pending: true },
      ]);

      try {
        await sendMessageStream({ conversationId, message: trimmed }, (event) => {
          if ('delta' in event) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + event.delta } : m))
            );
          } else if ('replaceWithFullText' in event) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: event.replaceWithFullText, role: 'referral' } : m
              )
            );
          } else if ('done' in event) {
            setConversationId(event.conversationId);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      pending: false,
                      citedContentIds: event.citedContentIds,
                      role: event.flaggedRedFlag ? 'referral' : 'assistant',
                    }
                  : m
              )
            );
          } else if ('error' in event) {
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            setErrorMessage(event.message);
          }
        });

        if (userId) await checkMascotEvolution(queryClient, userId);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setErrorMessage('No pudimos conectar con Cora. Probá de nuevo.');
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, isOnline, isSending, queryClient, userId]
  );

  return { messages, send, isSending, errorMessage, isOnline };
}
