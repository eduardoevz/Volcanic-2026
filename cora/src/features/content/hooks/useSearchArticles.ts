import { useQuery } from '@tanstack/react-query';

import { searchArticles, searchArticlesSemantic } from '@/features/content/api';
import { useStageAge } from '@/features/content/hooks/useStageAge';

export function useSearchArticles(query: string) {
  const { stage, age } = useStageAge();
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['search-articles', stage, age, trimmed],
    queryFn: async () => {
      const fullText = await searchArticles({ query: trimmed, stage: stage!, age });
      if (fullText.length > 0) return fullText;
      // Fase 19 (CORA-114): el full-text no encontró nada — antes de mostrar
      // "sin resultados", probar similitud semántica (ver nota en
      // searchArticlesSemantic sobre por qué esto no puede vivir acá mismo).
      return searchArticlesSemantic({ query: trimmed, stage: stage!, age });
    },
    enabled: !!stage && trimmed.length >= 3,
  });
}
