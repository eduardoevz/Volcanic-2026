import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPregnancy } from '@/features/pregnancy/api';
import { useSession } from '@/shared/hooks/useSession';

export function useCreatePregnancy() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPregnancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'active', userId] });
    },
  });
}
