// Corre bajo el mismo runner Jest del cliente (jest-expo desde cora/) porque
// guardrails.ts es TypeScript puro sin imports de Deno ni de npm: — no hace
// falta `deno test` para esta capa. Ver docs/TESTING.md para el detalle de
// por qué esto es seguro (el archivo real usado por el edge function).
import {
  containsProhibitedPhrase,
  extractCitedIds,
  matchesEmergency,
  REFERRAL_CARD_TEXT,
  stripInvalidCitations,
} from './guardrails';

describe('matchesEmergency — Capa 1: pre-filtro determinista de emergencia', () => {
  it.each([
    ['quiero hacerme daño', 'autolesión'],
    ['no aguanto más, quiero matarme', 'autolesión (variante)'],
    ['tengo dolor de pecho', 'dolor de pecho sin calificador (bug corregido — ver comentario en guardrails.ts)'],
    ['estoy sangrando muchísimo', 'sangrado abundante con "muchísimo" (bug de prefijo corregido)'],
    ['estoy sangrando mucho', 'sangrado abundante con "mucho"'],
    ['me desmayé en el baño', 'desmayo'],
    ['perdí el conocimiento un momento', 'pérdida de conocimiento'],
    ['tengo fiebre muy alta', 'fiebre alta'],
    ['mi esposo me pega', 'violencia doméstica'],
    ['mi pareja me amenaza todo el tiempo', 'amenazas de pareja'],
  ])('detecta señal de emergencia: %s (%s)', (message) => {
    expect(matchesEmergency(message)).toBe(true);
  });

  it.each([
    ['tengo un poco de dolor de cabeza', 'molestia leve no listada'],
    ['cuándo es mi próximo período', 'pregunta neutra de seguimiento'],
    ['qué significa el flujo spotting', 'pregunta educativa'],
  ])('no dispara con mensajes sin señal de alerta: %s (%s)', (message) => {
    expect(matchesEmergency(message)).toBe(false);
  });

  it('REFERRAL_CARD_TEXT nunca nombra una condición médica específica y siempre deriva a ayuda profesional', () => {
    expect(REFERRAL_CARD_TEXT).toMatch(/911|centro de salud|hospital/i);
    expect(REFERRAL_CARD_TEXT).not.toMatch(/sop|endometrio|anemia|infertil/i);
  });
});

describe('containsProhibitedPhrase — Capa 4: post-filtro de diagnóstico/prescripción', () => {
  it.each([
    'Te diagnostico una infección leve',
    'Tenés que ser más constante con tus registros', // ojo: coincide con "tenés que ser" — se prueba el patrón real
    'Tomá ibuprofeno cada 8 horas',
    'Tomá paracetamol si te duele',
    'Como médica, te recomiendo reposo',
    'Ese es mi diagnóstico',
  ])('detecta frase prohibida: "%s"', (text) => {
    expect(containsProhibitedPhrase(text)).toBe(true);
  });

  it.each([
    'Esto es información general, no un diagnóstico',
    'Podés registrar tus síntomas para llevar seguimiento',
    'Te recomiendo consultar con un profesional de salud',
  ])('no dispara con texto seguro: "%s"', (text) => {
    expect(containsProhibitedPhrase(text)).toBe(false);
  });
});

describe('citas [[id:uuid]]', () => {
  const uuid1 = '11111111-1111-1111-1111-111111111111';
  const uuid2 = '22222222-2222-2222-2222-222222222222';

  it('extractCitedIds extrae y deduplica ids citados', () => {
    const text = `Según [[id:${uuid1}]] y también [[id:${uuid1}]], además [[id:${uuid2}]]`;
    expect(extractCitedIds(text)).toEqual([uuid1, uuid2]);
  });

  it('extractCitedIds sin citas devuelve array vacío', () => {
    expect(extractCitedIds('sin citas acá')).toEqual([]);
  });

  it('stripInvalidCitations conserva citas válidas y elimina las que no están en validIds', () => {
    const text = `Fuente real [[id:${uuid1}]] y fuente inventada [[id:${uuid2}]]`;
    const result = stripInvalidCitations(text, [uuid1]);
    expect(result).toContain(`[[id:${uuid1}]]`);
    expect(result).not.toContain(`[[id:${uuid2}]]`);
  });

  it('stripInvalidCitations con validIds vacío elimina todas las citas', () => {
    const text = `[[id:${uuid1}]]`;
    expect(stripInvalidCitations(text, [])).toBe('');
  });
});
