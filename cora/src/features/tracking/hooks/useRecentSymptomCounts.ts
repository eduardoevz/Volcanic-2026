import { format, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { fetchRecentSymptomCounts } from '@/features/tracking/api';
import { useSession } from '@/shared/hooks/useSession';

export function useRecentSymptomCounts() {
  const { session } = useSession();
  const userId = session?.user.id;

  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['symptom-counts', userId, fromDate, toDate],
    queryFn: () => fetchRecentSymptomCounts(userId as string, fromDate, toDate),
    enabled: !!userId,
  });
}
