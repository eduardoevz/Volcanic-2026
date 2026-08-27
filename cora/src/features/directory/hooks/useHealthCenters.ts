import { useQuery } from '@tanstack/react-query';

import { fetchHealthCenters } from '@/features/directory/api';
import type { Database } from '@/shared/types/database.types';

type HealthCenterType = Database['public']['Enums']['health_center_type'];

export function useHealthCenters({
  department,
  type,
}: {
  department?: string;
  type?: HealthCenterType;
} = {}) {
  return useQuery({
    queryKey: ['health-centers', department ?? null, type ?? null],
    queryFn: () => fetchHealthCenters({ department, type }),
  });
}
