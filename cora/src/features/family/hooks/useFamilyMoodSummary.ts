import { useQuery } from '@tanstack/react-query';

import { fetchFamilyMoodSummary } from '@/features/family/api';

export function useFamilyMoodSummary(ownerId: string) {
  return useQuery({
    queryKey: ['family', 'moodSummary', ownerId],
    queryFn: () => fetchFamilyMoodSummary(ownerId),
  });
}
