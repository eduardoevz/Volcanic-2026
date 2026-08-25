import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createReminder } from '@/features/reminders/api';
import { requestNotificationPermission, scheduleDaily } from '@/features/reminders/notifications';
import { useSession } from '@/shared/hooks/useSession';

export function useCreateReminder() {
  const { session } = useSession();
  const userId = session?.user.id as string;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, hour, minute }: { title: string; hour: number; minute: number }) => {
      const granted = await requestNotificationPermission();
      if (!granted) throw new Error('Sin permiso de notificaciones.');

      const identifier = await scheduleDaily(title, hour, minute);
      return createReminder({ userId, title, hour, minute, notificationIdentifier: identifier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
    },
  });
}
