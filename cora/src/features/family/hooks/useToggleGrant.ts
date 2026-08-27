import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setGrant } from '@/features/family/api';
import { useSession } from '@/shared/hooks/useSession';

export function useToggleGrant() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setGrant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'myCircle', userId] });
    },
  });
}
