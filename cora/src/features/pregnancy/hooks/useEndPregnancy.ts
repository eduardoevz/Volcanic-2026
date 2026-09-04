import { useMutation, useQueryClient } from '@tanstack/react-query';

import { endPregnancy } from '@/features/pregnancy/api';
import { useSession } from '@/shared/hooks/useSession';
import type { LifeStage } from '@/shared/constants/lifeStages';

export function useEndPregnancy() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      nextLifeStage,
    }: {
      id: string;
      status: 'completed' | 'ended';
      nextLifeStage: LifeStage;
    }) => endPregnancy(id, status, nextLifeStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'active', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
