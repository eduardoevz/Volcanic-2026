import { useQuery } from '@tanstack/react-query';

import { fetchArticles } from '@/features/content/api';
import { useStageAge } from '@/features/content/hooks/useStageAge';

export function useArticles(categoryId?: string) {
  const { stage, age, isLoading: profileLoading } = useStageAge();

  const query = useQuery({
    queryKey: ['articles', stage, age, categoryId ?? null],
    queryFn: () => fetchArticles({ stage: stage!, age, categoryId }),
    enabled: !!stage,
  });

  return { ...query, isLoading: profileLoading || query.isLoading };
}
