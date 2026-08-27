import { useQuery } from '@tanstack/react-query';

import { fetchMyCircle } from '@/features/family/api';
import { useSession } from '@/shared/hooks/useSession';

export function useMyCircle() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['family', 'myCircle', userId],
    queryFn: () => fetchMyCircle(userId as string),
    enabled: !!userId,
  });
}
