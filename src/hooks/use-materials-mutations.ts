import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { IMaterial, IApiResponse, MaterialType } from './use-materials-queries';

export interface MaterialFormValues {
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
}

export function useCreateMaterialMutation(options?: {
  onSuccess?: (data: IApiResponse<IMaterial>) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IMaterial>, Error, MaterialFormValues>({
    mutationFn: async (newMaterial) => {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaterial),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create material');
      }

      return res.json();
    },
    onSuccess: (data) => {
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

export function useUpdateMaterialMutation(options?: {
  onSuccess?: (data: IApiResponse<IMaterial>) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IMaterial>, Error, { id: string; data: MaterialFormValues }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update material');
      }

      return res.json();
    },
    onSuccess: (data) => {
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
