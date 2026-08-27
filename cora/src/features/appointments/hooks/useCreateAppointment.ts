import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAppointment } from '@/features/appointments/api';
import { requestNotificationPermission, scheduleOnce } from '@/features/reminders/notifications';
import { useSession } from '@/shared/hooks/useSession';

export function useCreateAppointment() {
  const { session } = useSession();
  const userId = session?.user.id as string;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      specialistName: string;
      location: string;
      notes: string;
      scheduledAt: Date;
    }) => {
      const granted = await requestNotificationPermission();
      const identifier = granted ? await scheduleOnce(input.title, input.scheduledAt) : null;

      return createAppointment({
        userId,
        title: input.title,
        specialistName: input.specialistName || null,
        location: input.location || null,
        notes: input.notes || null,
        scheduledAt: input.scheduledAt.toISOString(),
        notificationIdentifier: identifier,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
    },
  });
}
