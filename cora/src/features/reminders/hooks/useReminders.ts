import { useQuery } from '@tanstack/react-query';

import { fetchReminders } from '@/features/reminders/api';
import { useSession } from '@/shared/hooks/useSession';

export function useReminders() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['reminders', userId],
    queryFn: () => fetchReminders(userId as string),
    enabled: !!userId,
  });
}
