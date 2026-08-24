import { useQuery } from '@tanstack/react-query';

import { fetchRecentMascotEvents } from '@/features/mascot/api';
import { useSession } from '@/shared/hooks/useSession';

export function useRecentMascotEvents(limit = 10) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['mascot-events', userId, limit],
    queryFn: () => fetchRecentMascotEvents(userId as string, limit),
    enabled: !!userId,
  });
}
