import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAppointmentStatus } from '@/features/appointments/api';
import { cancelScheduled } from '@/features/reminders/notifications';
import { useSession } from '@/shared/hooks/useSession';
import type { Database } from '@/shared/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];

export function useUpdateAppointmentStatus() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointment,
      status,
    }: {
      appointment: Appointment;
      status: 'completed' | 'cancelled';
    }) => {
      if (appointment.notification_identifier) {
        await cancelScheduled(appointment.notification_identifier);
      }
      await updateAppointmentStatus(appointment.id, { status, notification_identifier: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
    },
  });
}
