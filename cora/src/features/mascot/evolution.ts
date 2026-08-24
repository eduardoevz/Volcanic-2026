import type { QueryClient } from '@tanstack/react-query';

import { fetchMascotState } from '@/features/mascot/api';
import { useMascotEvolutionStore } from '@/store/mascotEvolutionStore';

/**
 * Se llama tras cualquier mutación que pueda haber otorgado puntos de
 * mascota (registro diario, lectura de artículo, onboarding). Compara el
 * nivel que había en cache antes de la mutación con el nivel real tras
 * refrescar, y dispara la animación de evolución solo si subió.
 */
export async function checkMascotEvolution(queryClient: QueryClient, userId: string) {
  const queryKey = ['mascot-state', userId];
  const previous = queryClient.getQueryData<{ level: number }>(queryKey);

  await queryClient.invalidateQueries({ queryKey });
  const fresh = await queryClient.fetchQuery({
    queryKey,
    queryFn: () => fetchMascotState(userId),
  });
  queryClient.invalidateQueries({ queryKey: ['mascot-events', userId] });

  if (previous && fresh && fresh.level > previous.level) {
    useMascotEvolutionStore.getState().triggerEvolution(fresh.level);
  }
}
