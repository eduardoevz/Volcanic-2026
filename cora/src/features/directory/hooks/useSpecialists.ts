import { useQuery } from '@tanstack/react-query';

import { fetchSpecialists } from '@/features/directory/api';

export function useSpecialists({
  specialty,
  healthCenterId,
}: {
  specialty?: string;
  healthCenterId?: string;
} = {}) {
  return useQuery({
    queryKey: ['specialists', specialty ?? null, healthCenterId ?? null],
    queryFn: () => fetchSpecialists({ specialty, healthCenterId }),
  });
}
