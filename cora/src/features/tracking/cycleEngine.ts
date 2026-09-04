import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

// Funciones puras — sin red, sin React, 100% testeables (ver
// docs/PLAN_DE_IMPLEMENTACION.md §14 y CORA-043). Cora describe y estima,
// nunca diagnostica: toda regla acá es determinista y vive en el cliente.

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type Mood = 'great' | 'good' | 'neutral' | 'low' | 'difficult';

export type DailyLogInput = {
  log_date: string; // 'YYYY-MM-DD'
  flow_level: FlowLevel | null;
  mood?: Mood | null;
};

export type Cycle = {
  start_date: string;
  end_date: string;
  period_length: number;
  cycle_length: number | null;
  is_predicted: boolean;
};

export type Prediction = {
  nextStart: string;
  windowDays: number;
  confidence: 'buena' | 'estimada';
};

export type FertileWindow = {
  start: string;
  end: string;
};

export type CycleLengthStats = {
  averageDays: number;
  minDays: number;
  maxDays: number;
  cycleCount: number;
};

export type ReferralSignal =
  | 'cycle_gap'
  | 'prolonged_bleeding'
  | 'heavy_flow_streak'
  | 'cycle_length_variation'
  | 'mood_difficult_streak';

const GAP_TOLERANCE_DAYS = 2; // 1 día de hueco permitido entre días de sangrado
const PLAUSIBLE_MIN = 15;
const PLAUSIBLE_MAX = 90;

export function isBleedingDay(flow: FlowLevel | null | undefined): boolean {
  return !!flow && flow !== 'none';
}

function addDaysISO(dateISO: string, days: number): string {
  return format(addDays(parseISO(dateISO), Math.round(days)), 'yyyy-MM-dd');
}

function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mad(values: number[]): number {
  const m = median(values);
  return median(values.map((v) => Math.abs(v - m)));
}

function isPlausible(cycle: Cycle): boolean {
  return (
    cycle.cycle_length !== null &&
    cycle.cycle_length >= PLAUSIBLE_MIN &&
    cycle.cycle_length <= PLAUSIBLE_MAX
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Un día es "de sangrado" si flow_level ∈ {spotting, light, medium, heavy}.
 * Días de sangrado consecutivos (con tolerancia de 1 día de hueco) forman un
 * período; el primer día de cada período es el start_date de un ciclo.
 */
export function detectCycles(logs: DailyLogInput[]): Cycle[] {
  const bleedingDates = logs
    .filter((log) => isBleedingDay(log.flow_level))
    .map((log) => log.log_date)
    .sort();

  if (bleedingDates.length === 0) return [];

  const periods: string[][] = [[bleedingDates[0]]];

  for (let i = 1; i < bleedingDates.length; i++) {
    const gap = daysBetween(bleedingDates[i - 1], bleedingDates[i]);
    if (gap <= GAP_TOLERANCE_DAYS) {
      periods[periods.length - 1].push(bleedingDates[i]);
    } else {
      periods.push([bleedingDates[i]]);
    }
  }

  return periods.map((dates, index) => {
    const start_date = dates[0];
    const end_date = dates[dates.length - 1];
    const nextStart = periods[index + 1]?.[0];
    const cycle_length = nextStart ? daysBetween(start_date, nextStart) : null;

    return {
      start_date,
      end_date,
      period_length: dates.length,
      cycle_length,
      is_predicted: false,
    };
  });
}

/**
 * Mediana + MAD, no promedio: un ciclo atípico no debe desplazar la
 * predicción. Se devuelve un RANGO de días, nunca una fecha exacta. Con menos
 * de 2 ciclos no se inventa nada: devuelve null.
 */
export function predictNext(cycles: Cycle[]): Prediction | null {
  if (cycles.length < 2) return null;

  const recent = cycles.slice(-6).filter(isPlausible);
  if (recent.length === 0) return null;

  const lengths = recent.map((c) => c.cycle_length as number);
  const avg = median(lengths);
  const spread = mad(lengths);
  const lastStart = cycles[cycles.length - 1].start_date;

  return {
    nextStart: addDaysISO(lastStart, avg),
    windowDays: clamp(Math.round(spread), 1, 7),
    confidence: recent.length >= 4 ? 'buena' : 'estimada',
  };
}

/**
 * Método del calendario: día 10-17 sobre el último ciclo registrado.
 * Depende de haber podido predecir (mismo requisito de ≥2 ciclos) — se
 * muestra siempre con la advertencia "no es un método anticonceptivo".
 */
export function fertileWindow(cycles: Cycle[]): FertileWindow | null {
  if (predictNext(cycles) === null) return null;

  const lastStart = cycles[cycles.length - 1].start_date;
  return {
    start: addDaysISO(lastStart, 10),
    end: addDaysISO(lastStart, 17),
  };
}

export type FertileWindowStatus = {
  state: 'before' | 'during' | 'after';
  progress: number; // 0..1 — posición de asOfDate dentro de la ventana
  daysUntilStart: number; // solo tiene sentido cuando state === 'before'
  daysRemaining: number; // solo tiene sentido cuando state === 'during'
  daysSinceEnd: number; // solo tiene sentido cuando state === 'after'
};

/**
 * Dónde cae `asOfDate` respecto a la ventana fértil — usado para el anillo de
 * progreso del Calendario. Pura función de posición, no repite el cálculo de
 * `fertileWindow` (recibe su resultado ya calculado).
 */
export function fertileWindowStatus(window: FertileWindow, asOfDate: string): FertileWindowStatus {
  const totalDays = Math.max(daysBetween(window.start, window.end), 1);
  const elapsed = daysBetween(window.start, asOfDate);

  if (elapsed < 0) {
    return { state: 'before', progress: 0, daysUntilStart: -elapsed, daysRemaining: 0, daysSinceEnd: 0 };
  }
  if (elapsed > totalDays) {
    return {
      state: 'after',
      progress: 1,
      daysUntilStart: 0,
      daysRemaining: 0,
      daysSinceEnd: elapsed - totalDays,
    };
  }
  return {
    state: 'during',
    progress: clamp(elapsed / totalDays, 0, 1),
    daysUntilStart: 0,
    daysRemaining: totalDays - elapsed,
    daysSinceEnd: 0,
  };
}

/**
 * Estadísticas descriptivas sobre los ciclos ya registrados (§14: "Tu ciclo
 * promedio es de 29 días en los últimos 5 ciclos" / "Tus ciclos han variado
 * entre 26 y 34 días") — a diferencia de `predictNext`, acá sí se usa el
 * promedio real (no la mediana): es una descripción del pasado, no una
 * predicción que deba resistir un ciclo atípico. Con menos de 2 ciclos
 * plausibles no se describe nada: devuelve null.
 */
export function cycleLengthStats(cycles: Cycle[]): CycleLengthStats | null {
  const recent = cycles.slice(-5).filter(isPlausible);
  if (recent.length < 2) return null;

  const lengths = recent.map((c) => c.cycle_length as number);

  return {
    averageDays: Math.round(lengths.reduce((sum, n) => sum + n, 0) / lengths.length),
    minDays: Math.min(...lengths),
    maxDays: Math.max(...lengths),
    cycleCount: lengths.length,
  };
}

function longestConsecutiveRun(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    current = daysBetween(sorted[i - 1], sorted[i]) === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

/**
 * Señales que ameritan derivación (§14) — nunca nombran una condición
 * médica; la UI muestra siempre la misma tarjeta neutra sin importar cuál
 * regla disparó.
 */
export function detectReferralSignals(
  logs: DailyLogInput[],
  cycles: Cycle[],
  asOfDate?: string
): ReferralSignal[] {
  const signals: ReferralSignal[] = [];
  const sortedLogs = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const referenceDate = asOfDate ?? sortedLogs[sortedLogs.length - 1]?.log_date;

  if (referenceDate) {
    const bleedingDates = sortedLogs.filter((l) => isBleedingDay(l.flow_level)).map((l) => l.log_date);
    const lastBleeding = bleedingDates[bleedingDates.length - 1];
    if (lastBleeding && daysBetween(lastBleeding, referenceDate) > 90) {
      signals.push('cycle_gap');
    }
  }

  const bleedingRun = longestConsecutiveRun(
    sortedLogs.filter((l) => isBleedingDay(l.flow_level)).map((l) => l.log_date)
  );
  if (bleedingRun > 8) signals.push('prolonged_bleeding');

  const heavyRun = longestConsecutiveRun(
    sortedLogs.filter((l) => l.flow_level === 'heavy').map((l) => l.log_date)
  );
  if (heavyRun >= 3) signals.push('heavy_flow_streak');

  for (let i = 1; i < cycles.length; i++) {
    const prev = cycles[i - 1].cycle_length;
    const curr = cycles[i].cycle_length;
    if (prev !== null && curr !== null && Math.abs(curr - prev) > 20) {
      signals.push('cycle_length_variation');
      break;
    }
  }

  if (referenceDate) {
    const windowStart = addDaysISO(referenceDate, -13);
    const difficultCount = sortedLogs.filter(
      (l) => l.mood === 'difficult' && l.log_date >= windowStart && l.log_date <= referenceDate
    ).length;
    if (difficultCount >= 10) signals.push('mood_difficult_streak');
  }

  return signals;
}
