import { useMemo } from 'react';
import { format, subDays } from 'date-fns';

import { detectReferralSignals, type Cycle, type DailyLogInput } from '@/features/tracking/cycleEngine';
import { useCycles } from '@/features/tracking/hooks/useCycles';
import { useDailyLogsRange } from '@/features/tracking/hooks/useDailyLogsRange';

// Ventana de 180 días: cubre de sobra las reglas de §14 (racha de ánimo de
// 14 días, hueco sin sangrado de 90 días) sin traer el historial completo.
const WINDOW_DAYS = 180;

export function useHealthSignals() {
  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subDays(new Date(), WINDOW_DAYS), 'yyyy-MM-dd');

  const { data: cycles, isLoading: cyclesLoading, isError: cyclesError } = useCycles();
  const { data: logs, isLoading: logsLoading, isError: logsError } = useDailyLogsRange(fromDate, toDate);

  const signals = useMemo(() => {
    if (!cycles || !logs) return [];
    return detectReferralSignals(logs as DailyLogInput[], cycles as Cycle[]);
  }, [logs, cycles]);

  return {
    signals,
    isLoading: cyclesLoading || logsLoading,
    isError: cyclesError || logsError,
  };
}
