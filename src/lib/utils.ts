// Centralized Query Key Factory
// Rule 5: Manage all query keys here to prevent stale cache invalidation issues.
export const queryKeys = {
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

export const sortByDateDesc = <T extends { date: string }>(records: T[]): T[] =>
  [...records].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

export const filterImportHistory = <
  T extends {
    supplierName: string;
    materialId?: {
      name?: string;
    };
  },
>(
  records: T[],
  searchTerm: string
): T[] => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return records;
  }

  return records.filter((entry) => {
    const materialName = entry.materialId?.name?.toLowerCase() ?? '';
    return (
      entry.supplierName.toLowerCase().includes(normalizedSearchTerm) ||
      materialName.includes(normalizedSearchTerm)
    );
  });
};

export const filterExportHistory = <
  T extends {
    requesterName: string;
    destinationPurpose: string;
    materialId?: {
      name?: string;
    };
  },
>(
  records: T[],
  searchTerm: string
): T[] => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return records;
  }

  return records.filter((entry) => {
    const materialName = entry.materialId?.name?.toLowerCase() ?? '';
    return (
      entry.requesterName.toLowerCase().includes(normalizedSearchTerm) ||
      entry.destinationPurpose.toLowerCase().includes(normalizedSearchTerm) ||
      materialName.includes(normalizedSearchTerm)
    );
  });
};

// Utility to merge CSS classes (custom pure implementation avoiding external dependencies)
export function cn(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}
