import { computeMoodSummary } from '@/features/summary/buildSummary';

import { cycleLengthStats, detectCycles, detectReferralSignals, predictNext, type DailyLogInput } from './cycleEngine';

// Integración entre módulos: simula 4 meses de registros diarios reales
// (como los guardaría la UI de tracking) y verifica que el pipeline completo
// detectCycles → predictNext/cycleLengthStats → detectReferralSignals →
// computeMoodSummary (resumen) sea coherente de punta a punta, no solo cada
// función por separado.
describe('flujo completo: registrar síntomas → recalcular ciclo → estadísticas y tendencias', () => {
  function buildFourRegularCycles(): DailyLogInput[] {
    const logs: DailyLogInput[] = [];
    const periodStarts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26'];
    for (const start of periodStarts) {
      const startDate = new Date(start);
      for (let i = 0; i < 4; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        logs.push({
          log_date: d.toISOString().slice(0, 10),
          flow_level: i < 2 ? 'medium' : 'light',
          mood: i === 0 ? 'low' : 'good',
        });
      }
    }
    return logs;
  }

  it('con ciclos regulares produce predicción, estadísticas y ningún síntoma de alerta', () => {
    const logs = buildFourRegularCycles();
    const cycles = detectCycles(logs);

    expect(cycles).toHaveLength(4);

    const prediction = predictNext(cycles);
    expect(prediction).not.toBeNull();
    // 3 ciclos plausibles con cycle_length conocido (el 4to sigue en curso) → confianza "estimada", no "buena" (necesita 4+)
    expect(prediction?.confidence).toBe('estimada');

    const stats = cycleLengthStats(cycles);
    expect(stats?.averageDays).toBe(28);

    const signals = detectReferralSignals(logs, cycles, '2026-04-23');
    expect(signals).toEqual([]);

    const moodSummary = computeMoodSummary(logs.map((l) => ({ ...l, mood: l.mood ?? null, notes: null })));
    expect(moodSummary?.mood).toBe('good');
  });

  it('un hueco largo sin registros dispara cycle_gap y las estadísticas siguen reflejando los ciclos previos plausibles', () => {
    const logs = buildFourRegularCycles();
    const cycles = detectCycles(logs);

    // La usuaria no vuelve a registrar nada por 100 días desde el último ciclo
    const signals = detectReferralSignals(logs, cycles, '2026-07-15');
    expect(signals).toContain('cycle_gap');

    // Las estadísticas de ciclos ya registrados no cambian por la falta de registros nuevos
    const stats = cycleLengthStats(cycles);
    expect(stats?.cycleCount).toBe(3);
  });
});
