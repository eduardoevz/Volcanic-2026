import { useMutation } from '@tanstack/react-query';

import { fetchMedicalBackground } from '@/features/medicalBackground';
import { computeTrimester, computeWeek, fetchActivePregnancy } from '@/features/pregnancy';
import { fetchCycles, fetchDailyLogsRange, fetchRecentSymptomCounts } from '@/features/tracking';
import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';

import { insertMedicalSummary } from '../api';
import { buildSummaryPayload, buildSummaryText, type SummaryMedicalBackground, type SummaryPregnancy } from '../buildSummary';

export type GenerateSummaryInput = { periodStart: string; periodEnd: string };

/**
 * Requiere red (lee logs/ciclos/síntomas y persiste el resumen) — sin
 * patrón offline-outbox, mismo criterio que el chat de Cora IA: si no hay
 * conexión, falla rápido en vez de encolarse.
 */
export function useGenerateSummary() {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const userId = session?.user.id as string;

  return useMutation({
    mutationFn: async ({ periodStart, periodEnd }: GenerateSummaryInput) => {
      const [logs, symptomCounts, cycles, medicalBackgroundRow, activePregnancy] = await Promise.all([
        fetchDailyLogsRange(userId, periodStart, periodEnd),
        fetchRecentSymptomCounts(userId, periodStart, periodEnd),
        fetchCycles(userId),
        fetchMedicalBackground(userId),
        profile?.life_stage === 'embarazo' ? fetchActivePregnancy(userId) : Promise.resolve(null),
      ]);

      const medicalBackground: SummaryMedicalBackground | null = medicalBackgroundRow
        ? {
            allergies: medicalBackgroundRow.allergies,
            familyHistory: medicalBackgroundRow.family_history,
            chronicConditions: medicalBackgroundRow.chronic_conditions,
            currentMedications: medicalBackgroundRow.current_medications,
            bloodType: medicalBackgroundRow.blood_type,
          }
        : null;

      const pregnancy: SummaryPregnancy | null = activePregnancy
        ? {
            week: computeWeek(activePregnancy.lmp_date, periodEnd),
            trimester: computeTrimester(computeWeek(activePregnancy.lmp_date, periodEnd)),
            dueDate: activePregnancy.due_date,
          }
        : null;

      const payload = buildSummaryPayload({
        periodStart,
        periodEnd,
        logs,
        symptomCounts,
        cycles,
        medicalBackground,
        pregnancy,
      });
      const text = buildSummaryText(payload);
      await insertMedicalSummary(userId, periodStart, periodEnd, payload);

      return { payload, text };
    },
  });
}
