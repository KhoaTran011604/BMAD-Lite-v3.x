import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { IApiResponse } from './use-materials-queries';

export interface ImportFormValues {
  transactionMode: 'import';
  materialId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  date: string;
  batchCode?: string;
  expirationDate?: string;
}

export function useCreateImportMutation(options?: {
  onSuccess?: (data: IApiResponse<unknown>) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, ImportFormValues>({
    mutationFn: async (newImport) => {
      const response = await fetch('/api/imports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newImport),
      });

      if (!response.ok) {
        const payload: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to record import delivery');
      }

      return response.json();
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.imports.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}
