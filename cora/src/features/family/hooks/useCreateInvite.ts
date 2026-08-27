import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createInvite } from '@/features/family/api';
import { useSession } from '@/shared/hooks/useSession';

export function useCreateInvite() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'myCircle', userId] });
    },
  });
}
