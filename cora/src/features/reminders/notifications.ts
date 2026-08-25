import * as Notifications from 'expo-notifications';

/**
 * Handler global — se registra una sola vez desde app/_layout.tsx. Sin esto
 * Android no muestra la notificación mientras la app está en foreground.
 */
export function registerNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDaily(title: string, hour: number, minute: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Cora', body: title, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function cancelScheduled(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
