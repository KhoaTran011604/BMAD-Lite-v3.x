import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { DashboardSummary } from '@/lib/utils';

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const fetchDashboardSummary = async (): Promise<IApiResponse<DashboardSummary>> => {
  const response = await fetch('/api/materials?view=dashboard');

  if (!response.ok) {
    throw new Error('Unable to load live inventory metrics right now.');
  }

  return response.json();
};

export function useDashboardSummaryQuery() {
  return useQuery<IApiResponse<DashboardSummary>, Error>({
    queryKey: queryKeys.dashboard.liveStock(),
    queryFn: fetchDashboardSummary,
    refetchInterval: 30000,
  });
}
