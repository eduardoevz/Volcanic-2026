-- 0021_push_token_format_check.sql
-- Fase 19: hallazgo real al verificar en el emulador — un bug en
-- subscribeToPushTokenRotation (src/features/notifications/pushTokens.ts)
-- guardó un token FCM crudo en vez de un ExponentPushToken[...] (ya
-- corregido en el cliente). Se agrega el CHECK como última línea de
-- defensa (§9 del plan: "PostgreSQL: CHECK... última línea, siempre se
-- cumple") — un token con el formato equivocado nunca puede insertarse,
-- sin depender de que el cliente nunca vuelva a tener este bug.

alter table public.device_push_tokens
  add constraint device_push_tokens_format_check
  check (expo_push_token like 'ExponentPushToken[%');
