// Centralized Query Key Factory
// Rule 5: Manage all query keys here to prevent stale cache invalidation issues.
export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    liveStock: () => [...queryKeys.dashboard.all, 'live-stock'] as const,
  },
  materials: {
    all: ['materials'] as const,
    lists: () => [...queryKeys.materials.all, 'list'] as const,
    list: (filters: { search?: string; type?: string }) =>
      [...queryKeys.materials.lists(), filters] as const,
    details: () => [...queryKeys.materials.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.materials.details(), id] as const,
  },
  imports: {
    all: ['imports'] as const,
    lists: () => [...queryKeys.imports.all, 'list'] as const,
  },
  exports: {
    all: ['exports'] as const,
    lists: () => [...queryKeys.exports.all, 'list'] as const,
  },
};
