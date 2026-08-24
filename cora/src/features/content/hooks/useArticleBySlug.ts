import { useQuery } from '@tanstack/react-query';

import { fetchArticleBySlug } from '@/features/content/api';

export function useArticleBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug as string),
    enabled: !!slug,
  });
}
