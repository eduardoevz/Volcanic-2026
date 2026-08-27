import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leaveCircle } from '@/features/family/api';
import { useSession } from '@/shared/hooks/useSession';

export function useLeaveCircle() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveCircle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'sharedWithMe', userId] });
    },
  });
}
