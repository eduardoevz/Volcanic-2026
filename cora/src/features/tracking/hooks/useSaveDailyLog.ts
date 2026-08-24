import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveDailyLog, syncCycles, type SaveDailyLogInput } from '@/features/tracking/api';
import { useSession } from '@/shared/hooks/useSession';

export function useSaveDailyLog() {
  const { session } = useSession();
  const userId = session?.user.id as string;
  const queryClient = useQueryClient();

  return useMutation({
    // mutationKey estable: TanStack Query lo usa para persistir e identificar
    // esta mutación mientras está en pausa por falta de red (ver queryClient.ts).
    mutationKey: ['save-daily-log'],
    networkMode: 'offlineFirst',
    // Con retry: 0 (el default), una mutación offline que falla queda en
    // "error" para siempre — nunca entra en pausa ni se retoma sola, porque
    // React Query solo pausa una mutación cuando hay un reintento programado
    // y no hay red. retry > 0 es lo que hace posible el outbox offline.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    mutationFn: async (input: SaveDailyLogInput) => {
      await saveDailyLog(input);
      // cycles es derivada: se recalcula por completo después de cada guardado.
      await syncCycles(userId);
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['daily-log', userId, input.logDate] });
      queryClient.invalidateQueries({ queryKey: ['daily-logs', userId] });
      queryClient.invalidateQueries({ queryKey: ['cycles', userId] });
      queryClient.invalidateQueries({ queryKey: ['mascot-state', userId] });
    },
  });
}
