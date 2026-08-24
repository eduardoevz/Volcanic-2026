import { useQuery } from '@tanstack/react-query';

import { fetchRecommendedArticles } from '@/features/content/api';
import { useStageAge } from '@/features/content/hooks/useStageAge';

export function useRecommendedArticles(limit = 3) {
  const { stage, age, isLoading: profileLoading } = useStageAge();

  const query = useQuery({
    queryKey: ['recommended-articles', stage, age, limit],
    queryFn: () => fetchRecommendedArticles({ stage: stage!, age, limit }),
    enabled: !!stage,
  });

  return { ...query, isLoading: profileLoading || query.isLoading };
}
