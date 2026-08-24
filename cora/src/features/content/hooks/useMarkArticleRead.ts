import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markArticleRead } from '@/features/content/api';
import { checkMascotEvolution } from '@/features/mascot';
import { useSession } from '@/shared/hooks/useSession';

export function useMarkArticleRead() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mark-article-read'],
    networkMode: 'offlineFirst',
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    mutationFn: (articleId: string) => markArticleRead(articleId),
    onSuccess: async () => {
      if (userId) await checkMascotEvolution(queryClient, userId);
    },
  });
}
