// Guardrails deterministas de Cora IA — capas 1 y 4 de §17
// (docs/PLAN_DE_IMPLEMENTACION.md). Regex simples a propósito: la capa más
// crítica (emergencias) no puede depender del modelo.

// ── Capa 1 — Pre-filtro de emergencia ───────────────────────────────────────
// Si el mensaje entrante coincide, se devuelve REFERRAL_CARD_TEXT sin llamar
// a Anthropic. Cubre autolesión/suicidio, sangrado abundante, dolor agudo de
// pecho, desmayos, fiebre alta y violencia.
// Notas de dos ajustes hechos tras pruebas reales fallidas contra la
// función ya desplegada:
// · "much[íi]simo" (no solo "mucho") porque "mucho"/"muchísimo" no
//   comparten prefijo literal — un match ingenuo con "mucho" deja pasar
//   "sangrando muchísimo".
// · "dolor de pecho" sin calificador de intensidad también dispara —
//   el dolor de pecho es señal de alerta por sí solo (texto exacto de la
//   batería de 12 prompts de §20/Fase 7 no incluye "fuerte"/"intenso").
const EMERGENCY_PATTERN =
  /(hacerme|lastimarme|matarme|suicid|quitarme la vida)|(sangr\w*.{0,20}(abundante|much[íi]simo|mucho|excesiv|fuerte))|(dolor.{0,15}(de pecho|en el pecho))|(me desmay|perdí el conocimiento)|(fiebre (alta|muy alta))|(violencia|me (pega|golpea|amenaza))/i;

export function matchesEmergency(message: string): boolean {
  return EMERGENCY_PATTERN.test(message);
}

export const REFERRAL_CARD_TEXT =
  'Lo que contás suena a algo que necesita atención profesional ya mismo, no algo que podamos resolver acá. ' +
  'Por favor llamá al 911 (emergencias, Nicaragua) o acudí al centro de salud u hospital más cercano ahora mismo. ' +
  'Si estás pensando en hacerte daño, no estás sola — buscá ayuda de inmediato con alguien de confianza o en el centro de salud más cercano. ' +
  'Tu seguridad es lo primero.';

// ── Capa 4 — Post-filtro sobre la respuesta completa del modelo ────────────
const PROHIBITED_PATTERNS = [
  /te diagnostico/i,
  /ten[eé]s que ser/i,
  /\btom[aá] (ibuprofeno|paracetamol|acetaminof[eé]n|aspirina|[a-záéíóúñ]+azol|[a-záéíóúñ]+cilina|[a-záéíóúñ]+mg\b)/i,
  /como m[eé]dica/i,
  /mi diagn[oó]stico/i,
];

export function containsProhibitedPhrase(text: string): boolean {
  return PROHIBITED_PATTERNS.some((pattern) => pattern.test(text));
}

// ── Citas [[id:uuid]] ────────────────────────────────────────────────────
const CITATION_PATTERN = /\[\[id:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]/gi;

export function extractCitedIds(text: string): string[] {
  const ids = new Set<string>();
  for (const match of text.matchAll(CITATION_PATTERN)) {
    ids.add(match[1].toLowerCase());
  }
  return [...ids];
}

/** Elimina del texto cualquier cita [[id:uuid]] cuyo uuid no esté en validIds. */
export function stripInvalidCitations(text: string, validIds: string[]): string {
  const valid = new Set(validIds.map((id) => id.toLowerCase()));
  return text.replace(CITATION_PATTERN, (full, id) => (valid.has(id.toLowerCase()) ? full : ''));
}
