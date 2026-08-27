import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePregnancyNotes } from '@/features/pregnancy/api';
import { useSession } from '@/shared/hooks/useSession';

export function useUpdatePregnancyNotes() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => updatePregnancyNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'active', userId] });
    },
  });
}
