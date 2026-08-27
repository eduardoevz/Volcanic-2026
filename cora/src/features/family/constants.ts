// 'appointments' reactivado en Fase 16: la tabla `appointments` ya existe
// (0016_pregnancy_and_appointments.sql) con su política aditiva
// family_shared_select vía has_active_grant — el scope dejó de ser inerte.
export const SHARE_SCOPES = ['cycle_dates', 'reminders', 'mood_summary', 'appointments'] as const;

export type ShareScope = (typeof SHARE_SCOPES)[number];
