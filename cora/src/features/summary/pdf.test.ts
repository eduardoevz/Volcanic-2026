import { buildSummaryHtml } from './pdf';
import type { SummaryPayload } from './buildSummary';

const basePayload: SummaryPayload = {
  periodStart: '2026-01-01',
  periodEnd: '2026-01-30',
  daysLogged: 10,
  cycleCount: 1,
  averageCycleLength: 28,
  topSymptoms: [{ label: 'Cólicos', count: 3 }],
  predominantMood: { mood: 'good', label: 'bien' },
  notes: [{ date: '2026-01-05', text: 'dolor de cabeza' }],
};

describe('buildSummaryHtml', () => {
  it('incluye el aviso de no-diagnóstico al inicio y al final', () => {
    const html = buildSummaryHtml(basePayload);
    const disclaimer = 'No es un diagnóstico ni reemplaza una consulta médica.';
    const firstIndex = html.indexOf(disclaimer);
    const lastIndex = html.lastIndexOf(disclaimer);
    expect(firstIndex).toBeGreaterThan(-1);
    expect(lastIndex).toBeGreaterThan(firstIndex);
  });

  it('escapa HTML en las notas para evitar inyección', () => {
    const html = buildSummaryHtml({
      ...basePayload,
      notes: [{ date: '2026-01-05', text: '<script>alert(1)</script>' }],
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('muestra "sin datos suficientes" cuando no hay duración media de ciclo', () => {
    const html = buildSummaryHtml({ ...basePayload, averageCycleLength: null });
    expect(html).toContain('sin datos suficientes');
  });

  it('muestra el mensaje vacío cuando no hay síntomas ni notas', () => {
    const html = buildSummaryHtml({ ...basePayload, topSymptoms: [], notes: [] });
    expect(html).toContain('Sin síntomas registrados en el período.');
    expect(html).toContain('Sin notas registradas en el período.');
  });

  it('escapa HTML en el título de un síntoma', () => {
    const html = buildSummaryHtml({
      ...basePayload,
      topSymptoms: [{ label: '<img src=x onerror=alert(1)>', count: 1 }],
    });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img');
  });

  it('con texto muy largo en una nota, lo incluye completo sin truncar (el layout es responsabilidad del visor de PDF)', () => {
    const longText = 'y'.repeat(3000);
    const html = buildSummaryHtml({ ...basePayload, notes: [{ date: '2026-01-05', text: longText }] });
    expect(html).toContain(longText);
  });
});
