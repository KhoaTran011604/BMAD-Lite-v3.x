import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { IMaterial, IApiResponse } from './use-materials-queries';

export interface IExport {
  _id: string;
  date: string;
  requesterName: string;
  materialId: IMaterial;
  quantity: number;
  destinationPurpose: string;
  createdAt: string;
  updatedAt: string;
}

const fetchExports = async (): Promise<IApiResponse<IExport[]>> => {
  const response = await fetch('/api/exports');

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to fetch export transaction logs');
  }

  return response.json();
};

export function useExportsQuery() {
  return useQuery<IApiResponse<IExport[]>, Error>({
    queryKey: queryKeys.exports.all,
    queryFn: fetchExports,
  });
}
