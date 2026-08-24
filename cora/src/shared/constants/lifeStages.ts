import type { Database } from '@/shared/types/database.types';

export type LifeStage = Database['public']['Enums']['life_stage'];

export const LIFE_STAGES: LifeStage[] = [
  'adolescencia',
  'adultez',
  'embarazo',
  'perimenopausia',
  'mayor',
];

export const LIFE_STAGE_META: Record<
  LifeStage,
  { label: string; emoji: string; description: string }
> = {
  adolescencia: {
    label: 'Adolescencia',
    emoji: '🌱',
    description: 'Estás conociendo tu ciclo y tu cuerpo por primera vez.',
  },
  adultez: {
    label: 'Adultez',
    emoji: '🌸',
    description: 'Seguís tu ciclo, tus síntomas y tu bienestar día a día.',
  },
  embarazo: {
    label: 'Embarazo',
    emoji: '🤰',
    description: 'Estás esperando y querés acompañamiento semana a semana.',
  },
  perimenopausia: {
    label: 'Perimenopausia / Menopausia',
    emoji: '🌙',
    description: 'Tu cuerpo está en transición y querés entenderlo mejor.',
  },
  mayor: {
    label: 'Adultez mayor',
    emoji: '🌳',
    description: 'Priorizás tu bienestar general y tu independencia.',
  },
};
