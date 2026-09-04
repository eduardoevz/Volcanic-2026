// Fase 26: rediseño de scopes — de acceso RLS directo a tablas crudas
// (cycle_dates, reminders, appointments-con-notas) a señales agregadas con
// un propósito explícito, todas vía RPC security definer (mismo patrón que
// mood_summary desde el inicio). Ver 0026_family_scopes_redesign.sql.
export const SHARE_SCOPES = ['mood_summary', 'care_alert', 'next_appointment'] as const;

export type ShareScope = (typeof SHARE_SCOPES)[number];
