import { useQuery } from '@tanstack/react-query';

import { fetchArticlesByIds } from '@/features/content/api';

export function useArticlesByIds(ids: string[]) {
  return useQuery({
    queryKey: ['articles-by-ids', [...ids].sort()],
    queryFn: () => fetchArticlesByIds(ids),
    enabled: ids.length > 0,
  });
}
