const mockPrintToFileAsync = jest.fn();
const mockIsAvailableAsync = jest.fn();
const mockShareAsync = jest.fn();

jest.mock('expo-print', () => ({ printToFileAsync: (...args: unknown[]) => mockPrintToFileAsync(...args) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

import { buildSummaryPayload } from './buildSummary';
import { exportSummaryToPdf } from './pdf';

// Integración: payload real (buildSummaryPayload) → HTML → exportSummaryToPdf
// (expo-print/expo-sharing mockeados, ya que son módulos nativos).
describe('generar resumen médico → exportar a PDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('construye el payload a partir de logs/ciclos reales y lo pasa a expo-print como HTML', async () => {
    const payload = buildSummaryPayload({
      periodStart: '2026-01-01',
      periodEnd: '2026-03-01',
      logs: [{ log_date: '2026-01-10', mood: 'difficult', notes: 'mucho dolor este mes' }],
      symptomCounts: [{ label: 'Cólicos', count: 4 }],
      cycles: [{ start_date: '2026-01-01', cycle_length: 28 }],
    });

    mockPrintToFileAsync.mockResolvedValue({ uri: 'file://resumen.pdf' });
    mockIsAvailableAsync.mockResolvedValue(true);

    await exportSummaryToPdf(payload);

    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(1);
    const htmlArg = (mockPrintToFileAsync.mock.calls[0][0] as { html: string }).html;
    expect(htmlArg).toContain('Cólicos');
    expect(htmlArg).toContain('mucho dolor este mes');
    expect(htmlArg).toContain('No es un diagnóstico');

    expect(mockShareAsync).toHaveBeenCalledWith('file://resumen.pdf', {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  });

  it('si compartir no está disponible en el dispositivo, no llama a shareAsync (no revienta)', async () => {
    const payload = buildSummaryPayload({
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      logs: [],
      symptomCounts: [],
      cycles: [],
    });
    mockPrintToFileAsync.mockResolvedValue({ uri: 'file://resumen.pdf' });
    mockIsAvailableAsync.mockResolvedValue(false);

    await exportSummaryToPdf(payload);

    expect(mockShareAsync).not.toHaveBeenCalled();
  });
});
