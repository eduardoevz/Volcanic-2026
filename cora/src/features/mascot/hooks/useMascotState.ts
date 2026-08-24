import { useQuery } from '@tanstack/react-query';

import { fetchMascotState } from '@/features/mascot/api';
import { useSession } from '@/shared/hooks/useSession';

export function useMascotState() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['mascot-state', userId],
    queryFn: () => fetchMascotState(userId as string),
    enabled: !!userId,
  });
}
