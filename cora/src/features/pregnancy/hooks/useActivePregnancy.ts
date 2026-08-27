import { useQuery } from '@tanstack/react-query';

import { fetchActivePregnancy } from '@/features/pregnancy/api';
import { useSession } from '@/shared/hooks/useSession';

export function useActivePregnancy() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['pregnancy', 'active', userId],
    queryFn: () => fetchActivePregnancy(userId as string),
    enabled: !!userId,
  });
}
