import { useQuery } from '@tanstack/react-query';

import { fetchFamilyNextAppointment } from '@/features/family/api';

export function useFamilyNextAppointment(ownerId: string) {
  return useQuery({
    queryKey: ['family', 'nextAppointment', ownerId],
    queryFn: () => fetchFamilyNextAppointment(ownerId),
  });
}
