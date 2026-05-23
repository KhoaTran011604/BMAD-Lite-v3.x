import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { IMaterial, IApiResponse } from './use-materials-queries';

export interface IImport {
  _id: string;
  date: string;
  supplierName: string;
  materialId: IMaterial;
  quantity: number;
  unitPrice: number;
  batchCode?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

const fetchImports = async (): Promise<IApiResponse<IImport[]>> => {
  const response = await fetch('/api/imports');

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to fetch import transaction logs');
  }

  return response.json();
};

export function useImportsQuery() {
  return useQuery<IApiResponse<IImport[]>, Error>({
    queryKey: queryKeys.imports.all,
    queryFn: fetchImports,
  });
}
