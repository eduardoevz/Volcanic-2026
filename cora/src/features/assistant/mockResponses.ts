import type { ChatSSEEvent } from './api';

// Plan B de demo (§26/Fase 10) — respuestas pregrabadas para las 2 preguntas
// ensayadas del guion (docs/DEMO_SCRIPT.md), activado con
// EXPO_PUBLIC_AI_MOCK=true. Los ids citados son artículos reales sembrados
// (educational_content), así los chips de fuente siguen funcionando en la
// demo con mock.

const BACK_PAIN_RESPONSE = {
  text:
    'Sentir molestias en la espalda baja antes del período es bastante común — se debe a las ' +
    'mismas contracciones del útero que causan los cólicos, que pueden irradiarse hacia la ' +
    'zona lumbar. El calor local, estirar suavemente y mantenerte hidratada suelen ayudar. ' +
    'Si el dolor es mucho más fuerte de lo habitual o no cede, vale la pena comentarlo con un ' +
    'profesional de salud. [[id:3b9609a1-695a-409d-bba9-aacf7ef87f5c]] ' +
    '¿Querés que te cuente qué otros síntomas son parte del ciclo?',
  citedContentIds: ['3b9609a1-695a-409d-bba9-aacf7ef87f5c'],
};

const NO_DIAGNOSIS_RESPONSE = {
  text:
    'Eso no te lo puedo decir yo — no soy médica y no puedo diagnosticar endometriosis ni ' +
    'ninguna otra condición. Lo que sí puedo decirte es que el dolor menstrual muy intenso, ' +
    'persistente o que interfiere con tu día a día es una señal para consultar con un ' +
    'profesional de salud, quien sí puede evaluarte. ¿Querés que te ayude a pensar qué ' +
    'contarle en la consulta?',
  citedContentIds: [] as string[],
};

const DEFAULT_RESPONSE = {
  text:
    'Puedo ayudarte con información educativa sobre tu ciclo y tu cuerpo, citando artículos de ' +
    'mi biblioteca. No diagnostico ni reemplazo una consulta médica. ¿Sobre qué tema querés ' +
    'que conversemos?',
  citedContentIds: [] as string[],
};

function pickResponse(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('espalda')) return BACK_PAIN_RESPONSE;
  if (normalized.includes('endometriosis') || normalized.includes('diagnóstico') || normalized.includes('diagnostico')) {
    return NO_DIAGNOSIS_RESPONSE;
  }
  return DEFAULT_RESPONSE;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const WORD_CHUNK = 3;

export async function sendMessageStreamMock(
  input: { conversationId: string | null; message: string },
  onEvent: (event: ChatSSEEvent) => void
): Promise<void> {
  const response = pickResponse(input.message);
  const words = response.text.split(' ');

  for (let i = 0; i < words.length; i += WORD_CHUNK) {
    await sleep(60);
    onEvent({ delta: `${words.slice(i, i + WORD_CHUNK).join(' ')} ` });
  }

  onEvent({
    done: true,
    conversationId: input.conversationId ?? 'mock-conversation',
    citedContentIds: response.citedContentIds,
    flaggedRedFlag: false,
  });
}
