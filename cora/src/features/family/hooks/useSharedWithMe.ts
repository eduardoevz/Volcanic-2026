import { useQuery } from '@tanstack/react-query';

import { fetchSharedWithMe } from '@/features/family/api';
import { useSession } from '@/shared/hooks/useSession';

export function useSharedWithMe() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['family', 'sharedWithMe', userId],
    queryFn: () => fetchSharedWithMe(userId as string),
    enabled: !!userId,
  });
}
