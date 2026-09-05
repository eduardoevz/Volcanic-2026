import { addDays, format, parseISO } from 'date-fns';

import { supabase } from '@/lib/supabase';

import { detectCycles, type DailyLogInput } from './cycleEngine';

export async function fetchDailyLog(userId: string, logDate: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, daily_log_symptoms(symptom_id, intensity)')
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchDailyLogsRange(userId: string, fromDate: string, toDate: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .lte('log_date', toDate)
    .order('log_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchAllDailyLogs(userId: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('log_date, flow_level, mood')
    .eq('user_id', userId)
    .order('log_date', { ascending: true });

  if (error) throw error;
  return data as DailyLogInput[];
}

export async function fetchRecentSymptomCounts(userId: string, fromDate: string, toDate: string) {
  const { data, error } = await supabase
    .from('daily_log_symptoms')
    .select('symptom_id, symptom_catalog(label_es), daily_logs!inner(user_id, log_date)')
    .eq('daily_logs.user_id', userId)
    .gte('daily_logs.log_date', fromDate)
    .lte('daily_logs.log_date', toDate);

  if (error) throw error;

  const counts = new Map<string, { label: string; count: number }>();
  for (const row of data ?? []) {
    const label = row.symptom_catalog?.label_es ?? 'Síntoma';
    const entry = counts.get(row.symptom_id) ?? { label, count: 0 };
    entry.count += 1;
    counts.set(row.symptom_id, entry);
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

export async function fetchSymptomCatalog() {
  const { data, error } = await supabase
    .from('symptom_catalog')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

export async function fetchCycles(userId: string) {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data;
}

export type SaveDailyLogInput = {
  logDate: string;
  flowLevel: DailyLogInput['flow_level'];
  mood: DailyLogInput['mood'];
  energyLevel: number | null;
  sleepHours: number | null;
  notes: string | null;
  symptoms: { symptomId: string; intensity: number }[];
  sexualActivity: boolean | null;
  periodStart: boolean;
  periodEnd: boolean;
};

export async function saveDailyLog(input: SaveDailyLogInput) {
  const { data, error } = await supabase.rpc('upsert_daily_log', {
    p_log_date: input.logDate,
    p_flow_level: input.flowLevel,
    p_mood: input.mood ?? null,
    p_energy_level: input.energyLevel,
    p_sleep_hours: input.sleepHours,
    p_notes: input.notes,
    p_symptoms: input.symptoms.map((s) => ({ symptom_id: s.symptomId, intensity: s.intensity })),
    p_sexual_activity: input.sexualActivity,
    p_period_start: input.periodStart,
    p_period_end: input.periodEnd,
  });

  if (error) throw error;
  return data;
}

/**
 * cycles es una tabla derivada (§14): se reescribe entera desde el cliente
 * cada vez que cambian los daily_logs. Nunca se persiste una fila predicha —
 * la predicción es efímera (predictNext), calculada al vuelo en la UI.
 */
export async function syncCycles(userId: string) {
  const logs = await fetchAllDailyLogs(userId);
  const cycles = detectCycles(logs);

  const { error: deleteError } = await supabase.from('cycles').delete().eq('user_id', userId);
  if (deleteError) throw deleteError;

  if (cycles.length === 0) return [];

  const { data, error: insertError } = await supabase
    .from('cycles')
    .insert(
      cycles.map((c) => ({
        user_id: userId,
        start_date: c.start_date,
        end_date: c.end_date,
        period_length: c.period_length,
        cycle_length: c.cycle_length,
        is_predicted: false,
      }))
    )
    .select();

  if (insertError) throw insertError;
  return data;
}

export type HistoricalPeriodInput = {
  startDate: string; // 'YYYY-MM-DD'
  lengthDays: number;
};

/**
 * Onboarding (Fase 31): siembra los últimos períodos que la usuaria recuerda
 * como daily_logs reales (mismo camino que un registro manual — sin tabla ni
 * RPC nuevos), para que detectCycles ya tenga ≥2 ciclos desde el primer uso y
 * el Calendario muestre sombreado/predicciones sin esperar semanas.
 */
export async function seedHistoricalCycles(userId: string, periods: HistoricalPeriodInput[]) {
  for (const period of periods) {
    for (let offset = 0; offset < period.lengthDays; offset++) {
      const logDate = format(addDays(parseISO(period.startDate), offset), 'yyyy-MM-dd');
      await saveDailyLog({
        logDate,
        flowLevel: 'medium',
        mood: null,
        energyLevel: null,
        sleepHours: null,
        notes: null,
        symptoms: [],
        sexualActivity: null,
        periodStart: offset === 0,
        periodEnd: offset === period.lengthDays - 1,
      });
    }
  }

  await syncCycles(userId);
}
