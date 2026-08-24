import { useQuery } from '@tanstack/react-query';

import { fetchSymptomCatalog } from '@/features/tracking/api';

export function useSymptomCatalog() {
  return useQuery({
    queryKey: ['symptom-catalog'],
    queryFn: fetchSymptomCatalog,
    staleTime: 60 * 60 * 1000,
  });
}
