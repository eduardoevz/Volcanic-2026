import { useMemo } from 'react';

import { fertileWindow, predictNext, type Cycle } from '@/features/tracking/cycleEngine';
import { useCycles } from '@/features/tracking/hooks/useCycles';

export function usePrediction() {
  const { data: cycles, isLoading } = useCycles();

  const prediction = useMemo(() => {
    if (!cycles) return null;
    return predictNext(cycles as Cycle[]);
  }, [cycles]);

  const window = useMemo(() => {
    if (!cycles) return null;
    return fertileWindow(cycles as Cycle[]);
  }, [cycles]);

  return {
    isLoading,
    cycles: cycles ?? [],
    prediction,
    fertileWindow: window,
    hasEnoughData: (cycles?.length ?? 0) >= 2,
  };
}
