import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { IApiResponse } from './use-materials-queries';

export interface ExportFormValues {
  transactionMode: 'export';
  materialId: string;
  requesterName: string;
  quantity: number;
  date: string;
  destinationPurpose: string;
}

export function useCreateExportMutation(options?: {
  onSuccess?: (data: IApiResponse<unknown>) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, ExportFormValues>({
    mutationFn: async (newExport) => {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'FarmManager',
        },
        body: JSON.stringify(newExport),
      });

      if (!response.ok) {
        const payload: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to record export transaction');
      }

      return response.json();
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
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
