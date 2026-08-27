import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptInvite } from '@/features/family/api';
import { useSession } from '@/shared/hooks/useSession';

export function useAcceptInvite() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'sharedWithMe', userId] });
    },
  });
}
