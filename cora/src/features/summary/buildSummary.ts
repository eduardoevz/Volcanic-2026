import type { Mood } from '@/features/tracking';

type CycleInput = { start_date: string; cycle_length: number | null };

// Funciones puras — sin red, sin React, 100% testeables (mismo espíritu que
// cycleEngine.ts). Cora describe lo que la usuaria registró, nunca
// diagnostica: el resumen es una transcripción de datos propios, no una
// interpretación clínica.

export type SummaryLogInput = {
  log_date: string;
  mood: Mood | null;
  notes: string | null;
};

export type SymptomCount = { label: string; count: number };

const MOOD_LABELS: Record<Mood, string> = {
  great: 'genial',
  good: 'bien',
  neutral: 'neutral',
  low: 'bajo',
  difficult: 'difícil',
};

/**
 * Ánimo predominante = el más frecuente en el rango. Con empate, se
 * queda con el primero encontrado (orden estable, sin significado extra).
 */
export function computeMoodSummary(logs: SummaryLogInput[]): { mood: Mood; label: string } | null {
  const counts = new Map<Mood, number>();
  for (const log of logs) {
    if (!log.mood) continue;
    counts.set(log.mood, (counts.get(log.mood) ?? 0) + 1);
  }
  if (counts.size === 0) return null;

  let topMood: Mood | null = null;
  let topCount = -1;
  for (const [mood, count] of counts) {
    if (count > topCount) {
      topMood = mood;
      topCount = count;
    }
  }
  if (!topMood) return null;
  return { mood: topMood, label: MOOD_LABELS[topMood] };
}

export type SummaryPayload = {
  periodStart: string;
  periodEnd: string;
  daysLogged: number;
  cycleCount: number;
  averageCycleLength: number | null;
  topSymptoms: SymptomCount[];
  predominantMood: { mood: Mood; label: string } | null;
  notes: { date: string; text: string }[];
};

export function buildSummaryPayload(input: {
  periodStart: string;
  periodEnd: string;
  logs: SummaryLogInput[];
  symptomCounts: SymptomCount[];
  cycles: CycleInput[];
}): SummaryPayload {
  const cyclesInRange = input.cycles.filter(
    (c) => c.start_date >= input.periodStart && c.start_date <= input.periodEnd
  );
  const plausibleLengths = cyclesInRange
    .map((c) => c.cycle_length)
    .filter((length): length is number => length !== null);
  const averageCycleLength =
    plausibleLengths.length > 0
      ? Math.round(plausibleLengths.reduce((sum, n) => sum + n, 0) / plausibleLengths.length)
      : null;

  return {
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    daysLogged: input.logs.length,
    cycleCount: cyclesInRange.length,
    averageCycleLength,
    topSymptoms: input.symptomCounts.slice(0, 3),
    predominantMood: computeMoodSummary(input.logs),
    notes: input.logs
      .filter((log): log is SummaryLogInput & { notes: string } => !!log.notes?.trim())
      .map((log) => ({ date: log.log_date, text: log.notes })),
  };
}

const DISCLAIMER =
  'Este resumen es una transcripción de los datos que la usuaria registró en Cora. ' +
  'No es un diagnóstico ni reemplaza una consulta médica.';

export function buildSummaryText(payload: SummaryPayload): string {
  const lines: string[] = [];

  lines.push('RESUMEN PARA CONSULTA MÉDICA — Cora');
  lines.push(`Período: ${payload.periodStart} a ${payload.periodEnd}`);
  lines.push('');
  lines.push(DISCLAIMER);
  lines.push('');
  lines.push(`Días registrados: ${payload.daysLogged}`);
  lines.push(`Ciclos detectados en el período: ${payload.cycleCount}`);
  lines.push(
    `Duración media de ciclo: ${payload.averageCycleLength !== null ? `${payload.averageCycleLength} días` : 'sin datos suficientes'}`
  );
  lines.push(
    `Ánimo predominante: ${payload.predominantMood ? payload.predominantMood.label : 'sin datos suficientes'}`
  );
  lines.push('');
  lines.push('Síntomas más frecuentes:');
  if (payload.topSymptoms.length === 0) {
    lines.push('  Sin síntomas registrados en el período.');
  } else {
    for (const symptom of payload.topSymptoms) {
      lines.push(`  · ${symptom.label} (${symptom.count} ${symptom.count === 1 ? 'vez' : 'veces'})`);
    }
  }
  lines.push('');
  lines.push('Notas de la usuaria:');
  if (payload.notes.length === 0) {
    lines.push('  Sin notas registradas en el período.');
  } else {
    for (const note of payload.notes) {
      lines.push(`  · ${note.date}: ${note.text}`);
    }
  }
  lines.push('');
  lines.push(DISCLAIMER);

  return lines.join('\n');
}
