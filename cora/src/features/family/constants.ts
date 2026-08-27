// 'appointments' existe en el enum share_scope desde 0001_init.sql (pensado
// para esta fase), pero la tabla `appointments` no existe hasta Fase 16
// (docs/PLAN_DE_IMPLEMENTACION.md líneas 2581-2584). Un grant con ese scope
// sería inerte hoy, así que se excluye del selector para no prometer algo
// que todavía no funciona — desviación consciente, documentada.
export const SHARE_SCOPES = ['cycle_dates', 'reminders', 'mood_summary'] as const;

export type ShareScope = (typeof SHARE_SCOPES)[number];
