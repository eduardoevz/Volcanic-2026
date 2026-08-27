import { useQuery } from '@tanstack/react-query';

import { fetchAppointments } from '@/features/appointments/api';
import { useSession } from '@/shared/hooks/useSession';

export function useAppointments() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => fetchAppointments(userId as string),
    enabled: !!userId,
  });
}
