import { buildSummaryPayload, buildSummaryText, computeMoodSummary } from './buildSummary';

describe('computeMoodSummary', () => {
  it('sin logs con ánimo devuelve null', () => {
    expect(computeMoodSummary([{ log_date: '2026-01-01', mood: null, notes: null }])).toBeNull();
  });

  it('devuelve el ánimo más frecuente', () => {
    const logs = [
      { log_date: '2026-01-01', mood: 'good' as const, notes: null },
      { log_date: '2026-01-02', mood: 'good' as const, notes: null },
      { log_date: '2026-01-03', mood: 'low' as const, notes: null },
    ];
    expect(computeMoodSummary(logs)).toEqual({ mood: 'good', label: 'bien' });
  });
});

describe('buildSummaryPayload', () => {
  it('calcula duración media de ciclo solo con ciclos plausibles dentro del rango', () => {
    const payload = buildSummaryPayload({
      periodStart: '2026-01-01',
      periodEnd: '2026-03-01',
      logs: [{ log_date: '2026-01-05', mood: 'good', notes: 'todo normal' }],
      symptomCounts: [{ label: 'Cólicos', count: 5 }],
      cycles: [
        { start_date: '2026-01-01', cycle_length: 28 },
        { start_date: '2025-11-01', cycle_length: 30 },
      ],
    });

    expect(payload.cycleCount).toBe(1);
    expect(payload.averageCycleLength).toBe(28);
    expect(payload.topSymptoms).toEqual([{ label: 'Cólicos', count: 5 }]);
    expect(payload.notes).toEqual([{ date: '2026-01-05', text: 'todo normal' }]);
  });

  it('sin ciclos plausibles en el rango devuelve null', () => {
    const payload = buildSummaryPayload({
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      logs: [],
      symptomCounts: [],
      cycles: [],
    });

    expect(payload.averageCycleLength).toBeNull();
    expect(payload.cycleCount).toBe(0);
  });
});

describe('buildSummaryText', () => {
  it('incluye el aviso de no-diagnóstico y los datos del payload', () => {
    const text = buildSummaryText(
      buildSummaryPayload({
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        logs: [{ log_date: '2026-01-10', mood: 'difficult', notes: 'dolor fuerte' }],
        symptomCounts: [{ label: 'Fatiga', count: 3 }],
        cycles: [],
      })
    );

    expect(text).toContain('No es un diagnóstico');
    expect(text).toContain('Fatiga (3 veces)');
    expect(text).toContain('dolor fuerte');
    expect(text).toContain('difícil');
  });
});
