import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAppointment } from '@/features/appointments/api';
import { cancelScheduled } from '@/features/reminders/notifications';
import { useSession } from '@/shared/hooks/useSession';
import type { Database } from '@/shared/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];

export function useDeleteAppointment() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: Appointment) => {
      if (appointment.notification_identifier) {
        await cancelScheduled(appointment.notification_identifier);
      }
      await deleteAppointment(appointment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
    },
  });
}
