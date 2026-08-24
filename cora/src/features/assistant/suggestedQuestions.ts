import type { LifeStage } from '@/shared/constants/lifeStages';

export const SUGGESTED_QUESTIONS: Record<LifeStage, string[]> = {
  adolescencia: [
    '¿Es normal que mi período sea irregular al principio?',
    '¿Qué esperar en mi primera menstruación?',
  ],
  adultez: [
    '¿Por qué cambia mi ánimo durante el ciclo?',
    '¿Cuándo debería consultar por mis síntomas?',
  ],
  embarazo: [
    '¿Qué cambios son normales en el primer trimestre?',
    '¿Qué señales de alerta debo vigilar?',
  ],
  perimenopausia: ['¿Por qué tengo sofocos?', '¿Cómo cuido mi salud ósea ahora?'],
  mayor: ['¿Qué chequeos son importantes en esta etapa?', '¿Cómo mantener mi bienestar general?'],
};
