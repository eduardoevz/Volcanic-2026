// Fase 19 — CORA-113. Registro del token de push remoto (Expo → FCM), no
// confundir con src/features/reminders/notifications.ts (notificaciones
// LOCALES, programadas en el dispositivo, sin servidor de por medio).
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { requestNotificationPermission } from '@/features/reminders';

/**
 * Pide permiso y obtiene el token de Expo, luego lo guarda (upsert) en
 * device_push_tokens. `projectId` viene de app.json (extra.eas.projectId) —
 * getExpoPushTokenAsync lo requiere en dev builds/standalone.
 * Silencioso ante cualquier fallo: registrar el push nunca debe bloquear el
 * arranque de la app ni ningún otro flujo (mismo criterio que
 * awardConversationPoints en la Edge Function cora-ai).
 */
export async function registerForPushNotifications(userId: string): Promise<void> {
  try {
    if (Platform.OS !== 'android') return;

    const granted = await requestNotificationPermission();
    if (!granted) return;

    await fetchAndStoreExpoPushToken(userId);
  } catch {
    // silencioso a propósito — ver nota arriba
  }
}

async function fetchAndStoreExpoPushToken(userId: string): Promise<void> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  await upsertPushToken(userId, data);
}

async function upsertPushToken(userId: string, expoPushToken: string): Promise<void> {
  await supabase
    .from('device_push_tokens')
    .upsert(
      { user_id: userId, expo_push_token: expoPushToken, device_info: `${Device.modelName ?? Platform.OS} · Android ${Platform.Version}` },
      { onConflict: 'user_id,expo_push_token' }
    );
}

/**
 * `addPushTokenListener` NO entrega un token de Expo — entrega el token
 * nativo crudo (FCM en Android, APNs en iOS) cada vez que el sistema lo
 * rota. Guardarlo tal cual (bug real encontrado al verificar esto en el
 * emulador: quedó una fila con un token FCM crudo en vez de
 * `ExponentPushToken[...]`) rompe el envío real, porque la Expo Push API
 * solo acepta el formato `ExponentPushToken[...]`. La rotación solo debe
 * usarse como señal para volver a pedirle el token de Expo al SDK.
 */
export function subscribeToPushTokenRotation(userId: string): () => void {
  const subscription = Notifications.addPushTokenListener(() => {
    fetchAndStoreExpoPushToken(userId).catch(() => {
      // silencioso a propósito
    });
  });
  return () => subscription.remove();
}
