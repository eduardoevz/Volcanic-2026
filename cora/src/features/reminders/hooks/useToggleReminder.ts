import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateReminderState } from '@/features/reminders/api';
import { cancelScheduled, scheduleDaily } from '@/features/reminders/notifications';
import { useSession } from '@/shared/hooks/useSession';
import type { Database } from '@/shared/types/database.types';

type Reminder = Database['public']['Tables']['reminders']['Row'];

export function useToggleReminder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminder: Reminder) => {
      if (reminder.is_active) {
        if (reminder.notification_identifier) {
          await cancelScheduled(reminder.notification_identifier);
        }
        await updateReminderState(reminder.id, { is_active: false, notification_identifier: null });
      } else {
        const identifier = await scheduleDaily(reminder.title, reminder.hour, reminder.minute);
        await updateReminderState(reminder.id, { is_active: true, notification_identifier: identifier });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
    },
  });
}
