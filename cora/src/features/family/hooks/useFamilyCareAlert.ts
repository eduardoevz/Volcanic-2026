import { useQuery } from '@tanstack/react-query';

import { fetchFamilyCareAlert } from '@/features/family/api';

export function useFamilyCareAlert(ownerId: string) {
  return useQuery({
    queryKey: ['family', 'careAlert', ownerId],
    queryFn: () => fetchFamilyCareAlert(ownerId),
  });
}
