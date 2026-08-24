import { useQuery } from '@tanstack/react-query';

import { fetchProfile } from '@/features/profile/api';
import { useSession } from '@/shared/hooks/useSession';

export function useProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
  });
}
