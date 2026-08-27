import { useMemo } from 'react';

import { cycleLengthStats, type Cycle } from '@/features/tracking/cycleEngine';
import { useCycles } from '@/features/tracking/hooks/useCycles';

export function useCycleStats() {
  const { data: cycles, isLoading, isError } = useCycles();

  const stats = useMemo(() => {
    if (!cycles) return null;
    return cycleLengthStats(cycles as Cycle[]);
  }, [cycles]);

  return { isLoading, isError, stats };
}
