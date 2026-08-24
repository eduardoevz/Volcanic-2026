import { useQuery } from '@tanstack/react-query';

import { fetchUserPreferences } from '@/features/profile/api';
import { useSession } from '@/shared/hooks/useSession';

export function useUserPreferences() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: () => fetchUserPreferences(userId as string),
    enabled: !!userId,
  });
}
