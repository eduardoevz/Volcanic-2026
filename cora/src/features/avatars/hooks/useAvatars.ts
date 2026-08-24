import { useQuery } from '@tanstack/react-query';

import { fetchAvatars } from '@/features/avatars/api';

export function useAvatars() {
  return useQuery({
    queryKey: ['avatars'],
    queryFn: fetchAvatars,
    staleTime: 60 * 60 * 1000, // catálogo público, cambia poco
  });
}
