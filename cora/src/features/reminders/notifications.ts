type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;

/**
 * `expo-notifications` lanza una excepción al importarse (no solo al
 * usarse) cuando corre en Expo Go en Android — desde el SDK 53, Expo Go ya
 * no trae el módulo nativo completo ahí. Por eso el import es perezoso y
 * protegido acá: un `import` estático que lanza tumba toda la app al
 * arrancar (rompe app/_layout.tsx entero) en vez de solo desactivar
 * recordatorios/notificaciones. Mismo patrón que
 * src/features/notifications/pushTokens.ts.
 */
function getNotificationsModule(): NotificationsModule | null {
  if (notificationsModule !== undefined) return notificationsModule;
  try {
    notificationsModule = require('expo-notifications') as NotificationsModule;
  } catch {
    notificationsModule = null;
  }
  return notificationsModule;
}

/**
 * Handler global — se registra una sola vez desde app/_layout.tsx. Sin esto
 * Android no muestra la notificación mientras la app está en foreground.
 */
export function registerNotificationHandler() {
  const notifications = getNotificationsModule();
  if (!notifications) return;

  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const notifications = getNotificationsModule();
  if (!notifications) return false;

  const current = await notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDaily(title: string, hour: number, minute: number): Promise<string | null> {
  const notifications = getNotificationsModule();
  if (!notifications) return null;

  return notifications.scheduleNotificationAsync({
    content: { title: 'Cora', body: title, sound: true },
    trigger: { type: notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function cancelScheduled(identifier: string): Promise<void> {
  const notifications = getNotificationsModule();
  if (!notifications) return;

  await notifications.cancelScheduledNotificationAsync(identifier);
}

// Notificación de una sola vez en una fecha/hora exacta — a diferencia de
// scheduleDaily (recordatorios diarios recurrentes), usada por citas
// médicas (Fase 16), que ocurren una vez en un momento puntual.
export async function scheduleOnce(title: string, date: Date): Promise<string | null> {
  const notifications = getNotificationsModule();
  if (!notifications) return null;
  // Una fecha ya pasada dispara la notificación casi de inmediato en vez de
  // en el momento correcto (confuso para citas armadas con "Hoy" a una hora
  // que ya pasó) — se omite el recordatorio, la cita se guarda igual.
  if (date.getTime() <= Date.now()) return null;

  return notifications.scheduleNotificationAsync({
    content: { title: 'Cora', body: title, sound: true },
    trigger: { type: notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}
