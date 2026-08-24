import { useQuery } from '@tanstack/react-query';

import { searchArticles } from '@/features/content/api';
import { useStageAge } from '@/features/content/hooks/useStageAge';

export function useSearchArticles(query: string) {
  const { stage, age } = useStageAge();
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['search-articles', stage, age, trimmed],
    queryFn: () => searchArticles({ query: trimmed, stage: stage!, age }),
    enabled: !!stage && trimmed.length >= 3,
  });
}
