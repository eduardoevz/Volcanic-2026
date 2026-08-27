import {
  cycleLengthStats,
  detectCycles,
  detectReferralSignals,
  fertileWindow,
  mad,
  median,
  predictNext,
  type Cycle,
  type DailyLogInput,
} from './cycleEngine';

function log(date: string, flow: DailyLogInput['flow_level'], mood: DailyLogInput['mood'] = null): DailyLogInput {
  return { log_date: date, flow_level: flow, mood };
}

describe('median / mad', () => {
  it('calcula la mediana correctamente (par e impar)', () => {
    expect(median([28, 30, 26])).toBe(28);
    expect(median([28, 30, 26, 32])).toBe(29);
  });

  it('mad resiste un valor atípico', () => {
    expect(mad([28, 28, 28, 60])).toBe(0);
  });
});

describe('detectCycles', () => {
  it('sin datos devuelve un array vacío', () => {
    expect(detectCycles([])).toEqual([]);
  });

  it('un solo período de sangrado produce un ciclo sin cycle_length', () => {
    const logs = [log('2026-01-01', 'medium'), log('2026-01-02', 'light'), log('2026-01-03', 'spotting')];
    const cycles = detectCycles(logs);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toMatchObject({
      start_date: '2026-01-01',
      end_date: '2026-01-03',
      period_length: 3,
      cycle_length: null,
    });
  });

  it('ciclos regulares de 28 días producen cycle_length consistente', () => {
    const logs = [
      log('2026-01-01', 'medium'),
      log('2026-01-02', 'medium'),
      log('2026-01-29', 'medium'),
      log('2026-01-30', 'medium'),
      log('2026-02-26', 'medium'),
      log('2026-02-27', 'medium'),
    ];
    const cycles = detectCycles(logs);
    expect(cycles).toHaveLength(3);
    expect(cycles[0].cycle_length).toBe(28);
    expect(cycles[1].cycle_length).toBe(28);
    expect(cycles[2].cycle_length).toBeNull();
  });

  it('tolera un hueco de 1 día dentro del mismo período', () => {
    const logs = [log('2026-01-01', 'medium'), log('2026-01-03', 'light')]; // hueco en el día 2
    const cycles = detectCycles(logs);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toMatchObject({ start_date: '2026-01-01', end_date: '2026-01-03', period_length: 2 });
  });

  it('un hueco de 2+ días separa en dos períodos distintos', () => {
    const logs = [log('2026-01-01', 'medium'), log('2026-01-05', 'medium')]; // hueco de 3 días
    const cycles = detectCycles(logs);
    expect(cycles).toHaveLength(2);
  });

  it('sangrado que cruza fin de mes se detecta como un solo período', () => {
    const logs = [
      log('2026-01-30', 'medium'),
      log('2026-01-31', 'medium'),
      log('2026-02-01', 'light'),
      log('2026-02-02', 'spotting'),
    ];
    const cycles = detectCycles(logs);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toMatchObject({
      start_date: '2026-01-30',
      end_date: '2026-02-02',
      period_length: 4,
    });
  });
});

describe('predictNext', () => {
  it('con menos de 2 ciclos devuelve null', () => {
    const oneCycle: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    expect(predictNext([])).toBeNull();
    expect(predictNext(oneCycle)).toBeNull();
  });

  it('con 2 ciclos predice con confianza "estimada"', () => {
    const cycles: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-01-29', end_date: '2026-02-01', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    const prediction = predictNext(cycles);
    expect(prediction).not.toBeNull();
    expect(prediction?.nextStart).toBe('2026-02-26');
    expect(prediction?.confidence).toBe('estimada');
  });

  it('un ciclo atípico de 60 días no desplaza la predicción (mediana, no promedio)', () => {
    const cycles: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-01-29', end_date: '2026-02-01', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-02-26', end_date: '2026-03-01', period_length: 4, cycle_length: 60, is_predicted: false },
      { start_date: '2026-04-27', end_date: '2026-04-30', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-05-25', end_date: '2026-05-28', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    const prediction = predictNext(cycles);
    // mediana de [28,28,60,28] = 28, no se desplaza hacia el atípico de 60
    expect(prediction?.nextStart).toBe('2026-06-22');
    expect(prediction?.confidence).toBe('buena');
  });
});

describe('fertileWindow', () => {
  it('con menos de 2 ciclos devuelve null', () => {
    expect(fertileWindow([])).toBeNull();
  });

  it('con predicción disponible devuelve el rango días 10-17 del último ciclo', () => {
    const cycles: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-01-29', end_date: '2026-02-01', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    expect(fertileWindow(cycles)).toEqual({ start: '2026-02-08', end: '2026-02-15' });
  });
});

describe('cycleLengthStats', () => {
  it('con menos de 2 ciclos plausibles devuelve null', () => {
    const oneCycle: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 28, is_predicted: false },
    ];
    expect(cycleLengthStats([])).toBeNull();
    expect(cycleLengthStats(oneCycle)).toBeNull();
  });

  it('ciclos regulares producen promedio, min y max correctos', () => {
    const cycles: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-01-29', end_date: '2026-02-01', period_length: 4, cycle_length: 30, is_predicted: false },
      { start_date: '2026-02-28', end_date: '2026-03-03', period_length: 4, cycle_length: 26, is_predicted: false },
      { start_date: '2026-03-26', end_date: '2026-03-29', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    expect(cycleLengthStats(cycles)).toEqual({
      averageDays: 28, // (28+30+26)/3 = 28
      minDays: 26,
      maxDays: 30,
      cycleCount: 3,
    });
  });

  it('un ciclo atípico sí se refleja en el rango min/max (a diferencia de la mediana de predictNext)', () => {
    const cycles: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-01-29', end_date: '2026-02-01', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-02-26', end_date: '2026-03-01', period_length: 4, cycle_length: 60, is_predicted: false },
      { start_date: '2026-04-27', end_date: '2026-04-30', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    const stats = cycleLengthStats(cycles);
    expect(stats?.maxDays).toBe(60);
    expect(stats?.minDays).toBe(28);
  });

  it('solo considera los últimos 5 ciclos', () => {
    const cycles: Cycle[] = [
      { start_date: '2025-08-01', end_date: '2025-08-04', period_length: 4, cycle_length: 100, is_predicted: false },
      { start_date: '2025-09-09', end_date: '2025-09-12', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2025-10-07', end_date: '2025-10-10', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2025-11-04', end_date: '2025-11-07', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2025-12-02', end_date: '2025-12-05', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2025-12-30', end_date: '2026-01-02', period_length: 4, cycle_length: 28, is_predicted: false },
      { start_date: '2026-01-27', end_date: '2026-01-30', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    // el ciclo atípico de 100 días queda fuera de los últimos 5 (los últimos 5
    // son 4 de 28 días + el ciclo en curso sin cycle_length todavía)
    expect(cycleLengthStats(cycles)).toEqual({
      averageDays: 28,
      minDays: 28,
      maxDays: 28,
      cycleCount: 4,
    });
  });
});

describe('detectReferralSignals', () => {
  it('sin patrones preocupantes no devuelve señales', () => {
    const logs = [log('2026-01-01', 'medium'), log('2026-01-02', 'light')];
    expect(detectReferralSignals(logs, detectCycles(logs), '2026-01-05')).toEqual([]);
  });

  it('más de 90 días sin sangrado desde el último registro dispara cycle_gap', () => {
    const logs = [log('2026-01-01', 'medium')];
    const signals = detectReferralSignals(logs, detectCycles(logs), '2026-05-01');
    expect(signals).toContain('cycle_gap');
  });

  it('más de 8 días consecutivos de sangrado dispara prolonged_bleeding', () => {
    const logs = Array.from({ length: 9 }, (_, i) => log(`2026-01-${String(i + 1).padStart(2, '0')}`, 'light'));
    const signals = detectReferralSignals(logs, detectCycles(logs));
    expect(signals).toContain('prolonged_bleeding');
  });

  it('3+ días consecutivos de flujo abundante dispara heavy_flow_streak', () => {
    const logs = [log('2026-01-01', 'heavy'), log('2026-01-02', 'heavy'), log('2026-01-03', 'heavy')];
    const signals = detectReferralSignals(logs, detectCycles(logs));
    expect(signals).toContain('heavy_flow_streak');
  });

  it('variación de ciclo > 20 días dispara cycle_length_variation', () => {
    const cycles: Cycle[] = [
      { start_date: '2026-01-01', end_date: '2026-01-04', period_length: 4, cycle_length: 25, is_predicted: false },
      { start_date: '2026-01-26', end_date: '2026-01-29', period_length: 4, cycle_length: 50, is_predicted: false },
      { start_date: '2026-03-17', end_date: '2026-03-20', period_length: 4, cycle_length: null, is_predicted: false },
    ];
    const signals = detectReferralSignals([], cycles);
    expect(signals).toContain('cycle_length_variation');
  });

  it('mood "difficult" en 10 de los últimos 14 días dispara mood_difficult_streak', () => {
    const logs = Array.from({ length: 10 }, (_, i) =>
      log(`2026-01-${String(i + 1).padStart(2, '0')}`, 'none', 'difficult')
    );
    const signals = detectReferralSignals(logs, [], '2026-01-14');
    expect(signals).toContain('mood_difficult_streak');
  });

  it('nunca incluye texto de diagnóstico — solo códigos internos', () => {
    const logs = [log('2026-01-01', 'heavy'), log('2026-01-02', 'heavy'), log('2026-01-03', 'heavy')];
    const signals = detectReferralSignals(logs, detectCycles(logs));
    for (const signal of signals) {
      expect(typeof signal).toBe('string');
      expect(signal).not.toMatch(/sop|endometrio|anemia|infertil|anormal/i);
    }
  });
});
