import { useQuery } from '@tanstack/react-query';

import { fetchDailyLogsRange } from '@/features/tracking/api';
import { useSession } from '@/shared/hooks/useSession';

export function useDailyLogsRange(fromDate: string, toDate: string) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['daily-logs', userId, fromDate, toDate],
    queryFn: () => fetchDailyLogsRange(userId as string, fromDate, toDate),
    enabled: !!userId,
  });
}
