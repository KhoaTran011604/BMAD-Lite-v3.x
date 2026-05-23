import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';

export interface IMaterial {
  _id: string;
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const fetchMaterials = async (): Promise<IApiResponse<IMaterial[]>> => {
  const res = await fetch('/api/materials');

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to fetch catalog materials');
  }

  return res.json();
};

export function useMaterialsQuery() {
  return useQuery<IApiResponse<IMaterial[]>, Error>({
    queryKey: queryKeys.materials.all,
    queryFn: fetchMaterials,
  });
}
