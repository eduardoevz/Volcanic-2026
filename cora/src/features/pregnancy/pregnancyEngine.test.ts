import { computeDueDate, computeTrimester, computeWeek } from './pregnancyEngine';

describe('computeDueDate', () => {
  it('suma exactamente 280 días a la fecha de última menstruación', () => {
    expect(computeDueDate('2026-01-01')).toBe('2026-10-08');
  });
});

describe('computeWeek', () => {
  it('semana 1 el mismo día de la última menstruación', () => {
    expect(computeWeek('2026-01-01', '2026-01-01')).toBe(1);
  });

  it('semana 20 a los 133-139 días', () => {
    expect(computeWeek('2026-01-01', '2026-05-14')).toBe(20);
  });

  it('nunca devuelve menos de 1 aunque la fecha sea anterior a la lmp', () => {
    expect(computeWeek('2026-01-10', '2026-01-01')).toBe(1);
  });
});

describe('computeTrimester', () => {
  it('semana 12 es primer trimestre, semana 13 es segundo', () => {
    expect(computeTrimester(12)).toBe(1);
    expect(computeTrimester(13)).toBe(2);
  });

  it('semana 26 es segundo trimestre, semana 27 es tercero', () => {
    expect(computeTrimester(26)).toBe(2);
    expect(computeTrimester(27)).toBe(3);
  });
});
