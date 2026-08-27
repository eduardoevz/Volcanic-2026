import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { SummaryPayload } from './buildSummary';

const DISCLAIMER =
  'Este resumen es una transcripción de los datos que la usuaria registró en Cora. No es un diagnóstico ni reemplaza una consulta médica.';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Función pura — misma responsabilidad que buildSummaryText, pero como
// documento HTML para exportar a PDF con expo-print. No recalcula nada del
// payload, solo lo presenta distinto.
export function buildSummaryHtml(payload: SummaryPayload): string {
  const symptomsHtml =
    payload.topSymptoms.length === 0
      ? '<p class="muted">Sin síntomas registrados en el período.</p>'
      : `<ul>${payload.topSymptoms
          .map(
            (s) =>
              `<li>${escapeHtml(s.label)} (${s.count} ${s.count === 1 ? 'vez' : 'veces'})</li>`
          )
          .join('')}</ul>`;

  const notesHtml =
    payload.notes.length === 0
      ? '<p class="muted">Sin notas registradas en el período.</p>'
      : `<ul>${payload.notes
          .map((n) => `<li><strong>${n.date}:</strong> ${escapeHtml(n.text)}</li>`)
          .join('')}</ul>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Roboto, sans-serif; color: #221B1F; padding: 24px; }
  h1 { color: #C2185B; font-size: 20px; }
  h2 { font-size: 15px; margin-top: 20px; }
  .disclaimer { background: #FCE4EC; color: #C2185B; padding: 12px; border-radius: 8px; font-size: 12px; }
  .muted { color: #6B6266; font-size: 13px; }
  ul { padding-left: 18px; }
</style>
</head>
<body>
  <h1>Resumen para consulta médica — Cora</h1>
  <p>Período: ${payload.periodStart} a ${payload.periodEnd}</p>
  <div class="disclaimer">${DISCLAIMER}</div>

  <h2>Días registrados</h2>
  <p>${payload.daysLogged}</p>

  <h2>Ciclos detectados en el período</h2>
  <p>${payload.cycleCount}</p>

  <h2>Duración media de ciclo</h2>
  <p>${payload.averageCycleLength !== null ? `${payload.averageCycleLength} días` : 'sin datos suficientes'}</p>

  <h2>Ánimo predominante</h2>
  <p>${payload.predominantMood ? escapeHtml(payload.predominantMood.label) : 'sin datos suficientes'}</p>

  <h2>Síntomas más frecuentes</h2>
  ${symptomsHtml}

  <h2>Notas de la usuaria</h2>
  ${notesHtml}

  <div class="disclaimer">${DISCLAIMER}</div>
</body>
</html>`;
}

// No es puro (llama módulos nativos) — separado de buildSummaryHtml a
// propósito para que la construcción del HTML siga siendo testeable sin
// mockear expo-print/expo-sharing.
export async function exportSummaryToPdf(payload: SummaryPayload): Promise<void> {
  const html = buildSummaryHtml(payload);
  const { uri } = await Print.printToFileAsync({ html });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
