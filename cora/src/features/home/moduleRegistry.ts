import type { FC } from 'react';

import type { LifeStage } from '@/shared/constants/lifeStages';

import { CycleStatusModule } from './modules/CycleStatusModule';
import { DailyCheckInModule } from './modules/DailyCheckInModule';
import { FirstPeriodGuideModule } from './modules/FirstPeriodGuideModule';
import { HydrationModule } from './modules/HydrationModule';
import { MascotModule } from './modules/MascotModule';
import { PregnancyWeekModule } from './modules/PregnancyWeekModule';
import { RecommendedArticleModule } from './modules/RecommendedArticleModule';
import { RemindersModule } from './modules/RemindersModule';
import { SymptomTrendsModule } from './modules/SymptomTrendsModule';
import { WellbeingTipModule } from './modules/WellbeingTipModule';

export type ModuleId =
  | 'daily-check-in'
  | 'cycle-status'
  | 'mascot'
  | 'recommended-article'
  | 'pregnancy-week'
  | 'wellbeing-tip'
  | 'reminders'
  | 'first-period-guide'
  | 'symptom-trends'
  | 'hydration';

export const MODULES: Record<ModuleId, FC> = {
  'daily-check-in': DailyCheckInModule,
  'cycle-status': CycleStatusModule,
  mascot: MascotModule,
  'recommended-article': RecommendedArticleModule,
  'pregnancy-week': PregnancyWeekModule,
  'wellbeing-tip': WellbeingTipModule,
  reminders: RemindersModule,
  'first-period-guide': FirstPeriodGuideModule,
  'symptom-trends': SymptomTrendsModule,
  hydration: HydrationModule,
};

// Ver docs/PLAN_DE_IMPLEMENTACION.md §13 — la etapa es un dato, no una rama de código.
// Agregar una etapa nueva = una fila acá + claves i18n, cero pantallas nuevas.
export const HOME_LAYOUT: Record<LifeStage, ModuleId[]> = {
  adolescencia: [
    'daily-check-in',
    'first-period-guide',
    'cycle-status',
    'mascot',
    'recommended-article',
  ],
  adultez: ['cycle-status', 'daily-check-in', 'symptom-trends', 'mascot', 'recommended-article'],
  embarazo: ['pregnancy-week', 'daily-check-in', 'reminders', 'mascot', 'recommended-article'],
  perimenopausia: [
    'daily-check-in',
    'symptom-trends',
    'wellbeing-tip',
    'mascot',
    'recommended-article',
  ],
  mayor: ['daily-check-in', 'wellbeing-tip', 'reminders', 'mascot', 'recommended-article'],
};
