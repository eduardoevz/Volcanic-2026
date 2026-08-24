import { useQuery } from '@tanstack/react-query';

import { fetchCycles } from '@/features/tracking/api';
import { useSession } from '@/shared/hooks/useSession';

export function useCycles() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['cycles', userId],
    queryFn: () => fetchCycles(userId as string),
    enabled: !!userId,
  });
}
