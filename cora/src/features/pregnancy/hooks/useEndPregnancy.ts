import { useMutation, useQueryClient } from '@tanstack/react-query';

import { endPregnancy } from '@/features/pregnancy/api';
import { useSession } from '@/shared/hooks/useSession';

export function useEndPregnancy() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'completed' | 'ended' }) =>
      endPregnancy(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'active', userId] });
    },
  });
}
