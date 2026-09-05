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
    // Este query decide si mandamos a la usuaria a onboarding o a Home
    // (app/index.tsx) justo al abrir la app — un backoff más largo que el
    // default le da tiempo a la red real de reestablecerse tras volver de
    // segundo plano, en vez de mostrar "revisá tu conexión" por un parpadeo
    // transitorio de NetInfo.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
