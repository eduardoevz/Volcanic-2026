import { useQuery } from '@tanstack/react-query';

import { fetchCategories } from '@/features/content/api';

export function useCategories() {
  return useQuery({
    queryKey: ['content-categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
  });
}
