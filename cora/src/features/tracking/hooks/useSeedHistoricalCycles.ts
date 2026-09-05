import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  seedHistoricalCycles,
  type HistoricalPeriodInput,
} from '@/features/tracking/api';
import { useSession } from '@/shared/hooks/useSession';

export function useSeedHistoricalCycles() {
  const { session } = useSession();
  const userId = session?.user.id as string;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periods: HistoricalPeriodInput[]) => seedHistoricalCycles(userId, periods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs', userId] });
      queryClient.invalidateQueries({ queryKey: ['cycles', userId] });
    },
  });
}
