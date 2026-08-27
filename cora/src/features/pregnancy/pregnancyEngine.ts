import { addDays, differenceInCalendarDays } from 'date-fns';

// Funciones puras — sin red, sin React, 100% testeables (mismo espíritu que
// src/features/tracking/cycleEngine.ts). Regla obstétrica estándar (Naegele):
// 280 días desde la fecha de última menstruación.

const GESTATION_DAYS = 280;

export function computeDueDate(lmpDate: string): string {
  return addDays(new Date(lmpDate), GESTATION_DAYS).toISOString().slice(0, 10);
}

export function computeWeek(lmpDate: string, asOfDate: string): number {
  const days = differenceInCalendarDays(new Date(asOfDate), new Date(lmpDate));
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function computeTrimester(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1;
  if (week <= 26) return 2;
  return 3;
}
