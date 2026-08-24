import { useQuery } from '@tanstack/react-query';

import { fetchDailyLog } from '@/features/tracking/api';
import { useSession } from '@/shared/hooks/useSession';

export function useDailyLog(logDate: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['daily-log', userId, logDate],
    queryFn: () => fetchDailyLog(userId as string, logDate),
    enabled: !!userId,
  });
}
