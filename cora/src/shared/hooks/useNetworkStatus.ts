import { useEffect, useState } from 'react';
import { onlineManager, useMutationState } from '@tanstack/react-query';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe(setIsOnline);
  }, []);

  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
  });

  const pausedMutations = useMutationState({
    filters: { predicate: (mutation) => mutation.state.isPaused },
  });

  return {
    isOnline,
    pendingCount: pendingMutations.length,
    pausedCount: pausedMutations.length,
  };
}
