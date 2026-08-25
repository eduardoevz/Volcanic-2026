import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteReminder } from '@/features/reminders/api';
import { cancelScheduled } from '@/features/reminders/notifications';
import { useSession } from '@/shared/hooks/useSession';
import type { Database } from '@/shared/types/database.types';

type Reminder = Database['public']['Tables']['reminders']['Row'];

export function useDeleteReminder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminder: Reminder) => {
      if (reminder.is_active && reminder.notification_identifier) {
        await cancelScheduled(reminder.notification_identifier);
      }
      await deleteReminder(reminder.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
    },
  });
}
