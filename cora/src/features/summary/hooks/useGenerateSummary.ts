import { useMutation } from '@tanstack/react-query';

import { fetchCycles, fetchDailyLogsRange, fetchRecentSymptomCounts } from '@/features/tracking';
import { useSession } from '@/shared/hooks/useSession';

import { insertMedicalSummary } from '../api';
import { buildSummaryPayload, buildSummaryText } from '../buildSummary';

export type GenerateSummaryInput = { periodStart: string; periodEnd: string };

/**
 * Requiere red (lee logs/ciclos/síntomas y persiste el resumen) — sin
 * patrón offline-outbox, mismo criterio que el chat de Cora IA: si no hay
 * conexión, falla rápido en vez de encolarse.
 */
export function useGenerateSummary() {
  const { session } = useSession();
  const userId = session?.user.id as string;

  return useMutation({
    mutationFn: async ({ periodStart, periodEnd }: GenerateSummaryInput) => {
      const [logs, symptomCounts, cycles] = await Promise.all([
        fetchDailyLogsRange(userId, periodStart, periodEnd),
        fetchRecentSymptomCounts(userId, periodStart, periodEnd),
        fetchCycles(userId),
      ]);

      const payload = buildSummaryPayload({ periodStart, periodEnd, logs, symptomCounts, cycles });
      const text = buildSummaryText(payload);
      await insertMedicalSummary(userId, periodStart, periodEnd, payload);

      return { payload, text };
    },
  });
}
