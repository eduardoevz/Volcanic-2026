import { useQuery } from '@tanstack/react-query';

import { fetchMedicalBackground } from '@/features/medicalBackground/api';
import { useSession } from '@/shared/hooks/useSession';

export function useMedicalBackground() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['medical-background', userId],
    queryFn: () => fetchMedicalBackground(userId as string),
    enabled: !!userId,
  });
}
