import i18n from '@/lib/i18n';
import type { LifeStage } from '@/shared/constants/lifeStages';

// Copy con sufijo de etapa + fallback automático, ver docs/PLAN_DE_IMPLEMENTACION.md §13.
export function tStage(key: string, stage: LifeStage): string {
  return i18n.t([`${key}.${stage}`, `${key}.default`]);
}
