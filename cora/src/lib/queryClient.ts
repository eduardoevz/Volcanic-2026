import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';

import { LargeSecureStore } from '@/lib/secureStorage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: new LargeSecureStore('rq-cache'),
  key: 'cora-query-cache',
});

// Outbox offline (CORA-045): en vez de una cola custom, se usa el mecanismo
// nativo de TanStack Query — mutaciones pausadas sin red, persistidas junto
// con la cache, y drenadas en orden (FIFO) al reconectar. onlineManager es
// quien le avisa a React Query si "hay red" o no.
let onlineManagerConfigured = false;

export function configureOnlineManager() {
  if (onlineManagerConfigured) return;
  onlineManagerConfigured = true;

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      // isInternetReachable empieza en null hasta que NetInfo confirma
      // alcance real; si se usara isConnected solo, un parpadeo justo al
      // volver del background puede marcar "sin red" por error y disparar el
      // banner de conexión en app/index.tsx aunque la red esté bien.
      setOnline(state.isInternetReachable ?? state.isConnected ?? false);
    });
  });

  onlineManager.subscribe((isOnline) => {
    if (isOnline) {
      queryClient.resumePausedMutations().then(() => {
        queryClient.invalidateQueries();
      });
    }
  });
}
