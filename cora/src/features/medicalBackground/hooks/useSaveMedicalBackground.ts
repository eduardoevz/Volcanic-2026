import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveMedicalBackground, type MedicalBackgroundInput } from '@/features/medicalBackground/api';
import { useSession } from '@/shared/hooks/useSession';

export function useSaveMedicalBackground() {
  const { session } = useSession();
  const userId = session?.user.id as string;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MedicalBackgroundInput) => saveMedicalBackground(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-background', userId] });
    },
  });
}
