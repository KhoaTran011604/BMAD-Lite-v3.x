export { queryKeys } from './query-keys';

type MaterialReference = string | { _id?: string | { toString(): string } } | { toString(): string };

export interface DashboardMaterialRecord {
  _id: string | { toString(): string };
  name: string;
  type: string;
  uom: string;
  safetyStock: number;
  currentStock: number;
}

export interface DashboardImportRecord {
  materialId: MaterialReference;
  quantity: number;
  unitPrice: number;
  date: Date | string;
  batchCode?: string;
  expirationDate?: Date | string;
}

export interface DashboardExportRecord {
  materialId: MaterialReference;
  quantity: number;
  date: Date | string;
}

export interface DashboardStockItem {
  materialId: string;
  name: string;
  type: string;
  uom: string;
  currentStock: number;
  safetyStock: number;
  averageUnitPrice: number;
  stockValue: number;
  totalImportedQuantity: number;
  totalExportedQuantity: number;
  lastTransactionDate: string | null;
  alertStatus: 'healthy' | 'low' | 'out';
}

export interface DashboardSummary {
  totalMaterials: number;
  activeAlerts: number;
  totalPortfolioValue: number;
  stockItems: DashboardStockItem[];
  lowStockWarnings: DashboardLowStockWarning[];
  nearExpiryAlerts: DashboardNearExpiryAlert[];
}

export interface DashboardLowStockWarning {
  materialId: string;
  name: string;
  type: string;
  uom: string;
  currentStock: number;
  safetyStock: number;
  shortageQuantity: number;
}

export interface DashboardNearExpiryAlert {
  materialId: string;
  materialName: string;
  batchCode: string;
  expirationDate: string;
  daysRemaining: number;
}

const getMaterialReferenceId = (materialReference: MaterialReference): string => {
  if (typeof materialReference === 'string') {
    return materialReference;
  }

  if ('_id' in materialReference && materialReference._id) {
    return typeof materialReference._id === 'string'
      ? materialReference._id
      : materialReference._id.toString();
  }

  return materialReference.toString();
};

const getLatestDate = (...dateValues: Array<Date | string | null>): string | null => {
  const timestamps = dateValues
    .filter((value): value is Date | string => value !== null)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
};

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const getStartOfDayUtcTimestamp = (dateValue: Date): number =>
  Date.UTC(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate());

const getMaterialNameFromReference = (materialReference: MaterialReference): string | null => {
  if (typeof materialReference === 'string') {
    return null;
  }

  if ('name' in materialReference && typeof materialReference.name === 'string') {
    return materialReference.name;
  }

  return null;
};

export const calculateAverageUnitPrice = (
  imports: DashboardImportRecord[],
  materialId: string
): number => {
  const matchingImports = imports.filter((entry) => getMaterialReferenceId(entry.materialId) === materialId);

  if (matchingImports.length === 0) {
    return 0;
  }

  const weightedTotals = matchingImports.reduce(
    (accumulator, entry) => {
      accumulator.quantity += entry.quantity;
      accumulator.value += entry.quantity * entry.unitPrice;
      return accumulator;
    },
    { quantity: 0, value: 0 }
  );

  if (weightedTotals.quantity === 0) {
    return 0;
  }

  return Number((weightedTotals.value / weightedTotals.quantity).toFixed(2));
};

export const buildLowStockWarnings = (
  stockItems: DashboardStockItem[]
): DashboardLowStockWarning[] =>
  stockItems
    .filter((item) => item.currentStock < item.safetyStock)
    .map((item) => ({
      materialId: item.materialId,
      name: item.name,
      type: item.type,
      uom: item.uom,
      currentStock: item.currentStock,
      safetyStock: item.safetyStock,
      shortageQuantity: Number((item.safetyStock - item.currentStock).toFixed(2)),
    }))
    .sort((left, right) => {
      const leftOutOfStockRank = left.currentStock === 0 ? 0 : 1;
      const rightOutOfStockRank = right.currentStock === 0 ? 0 : 1;

      if (leftOutOfStockRank !== rightOutOfStockRank) {
        return leftOutOfStockRank - rightOutOfStockRank;
      }

      const leftShortageRatio = left.safetyStock === 0 ? 0 : left.shortageQuantity / left.safetyStock;
      const rightShortageRatio = right.safetyStock === 0 ? 0 : right.shortageQuantity / right.safetyStock;

      if (leftShortageRatio !== rightShortageRatio) {
        return rightShortageRatio - leftShortageRatio;
      }

      if (left.shortageQuantity !== right.shortageQuantity) {
        return right.shortageQuantity - left.shortageQuantity;
      }

      return left.name.localeCompare(right.name);
    });

export const buildNearExpiryAlerts = (
  imports: DashboardImportRecord[],
  materials: DashboardMaterialRecord[],
  now: Date = new Date()
): DashboardNearExpiryAlert[] => {
  const materialNameById = new Map<string, string>(
    materials.map((material) => [material._id.toString(), material.name])
  );
  const nowStartTimestamp = getStartOfDayUtcTimestamp(now);

  return imports
    .filter((entry) => Boolean(entry.expirationDate))
    .map((entry) => {
      const expirationDate = new Date(entry.expirationDate as Date | string);
      if (Number.isNaN(expirationDate.getTime())) {
        return null;
      }

      const expirationStartTimestamp = getStartOfDayUtcTimestamp(expirationDate);
      const daysRemaining = Math.ceil((expirationStartTimestamp - nowStartTimestamp) / DAY_IN_MILLISECONDS);

      if (daysRemaining < 0 || daysRemaining > 30) {
        return null;
      }

      const materialId = getMaterialReferenceId(entry.materialId);
      const materialName =
        getMaterialNameFromReference(entry.materialId) ??
        materialNameById.get(materialId) ??
        'Unknown Material';

      return {
        materialId,
        materialName,
        batchCode: entry.batchCode?.trim() || 'Batch not provided',
        expirationDate: expirationDate.toISOString(),
        daysRemaining,
      } satisfies DashboardNearExpiryAlert;
    })
    .filter((entry): entry is DashboardNearExpiryAlert => entry !== null)
    .sort((left, right) => {
      if (left.daysRemaining !== right.daysRemaining) {
        return left.daysRemaining - right.daysRemaining;
      }

      const leftTimestamp = new Date(left.expirationDate).getTime();
      const rightTimestamp = new Date(right.expirationDate).getTime();

      if (leftTimestamp !== rightTimestamp) {
        return leftTimestamp - rightTimestamp;
      }

      const materialNameComparison = left.materialName.localeCompare(right.materialName);
      if (materialNameComparison !== 0) {
        return materialNameComparison;
      }

      return left.batchCode.localeCompare(right.batchCode);
    });
};

export const buildDashboardSummary = (
  materials: DashboardMaterialRecord[],
  imports: DashboardImportRecord[],
  exports: DashboardExportRecord[]
): DashboardSummary => {
  const stockItems = materials
    .map((material) => {
      const materialId = material._id.toString();
      const averageUnitPrice = calculateAverageUnitPrice(imports, materialId);
      const relatedImports = imports.filter((entry) => getMaterialReferenceId(entry.materialId) === materialId);
      const relatedExports = exports.filter((entry) => getMaterialReferenceId(entry.materialId) === materialId);
      const totalImportedQuantity = relatedImports.reduce((sum, entry) => sum + entry.quantity, 0);
      const totalExportedQuantity = relatedExports.reduce((sum, entry) => sum + entry.quantity, 0);
      const alertStatus =
        material.currentStock === 0
          ? 'out'
          : material.currentStock <= material.safetyStock
            ? 'low'
            : 'healthy';

      return {
        materialId,
        name: material.name,
        type: material.type,
        uom: material.uom,
        currentStock: material.currentStock,
        safetyStock: material.safetyStock,
        averageUnitPrice,
        stockValue: Number((material.currentStock * averageUnitPrice).toFixed(2)),
        totalImportedQuantity,
        totalExportedQuantity,
        lastTransactionDate: getLatestDate(
          relatedImports[0]?.date ?? null,
          relatedExports[0]?.date ?? null
        ),
        alertStatus,
      } satisfies DashboardStockItem;
    })
    .sort((left, right) => {
      const severityRank = { out: 0, low: 1, healthy: 2 } as const;
      const severityDelta = severityRank[left.alertStatus] - severityRank[right.alertStatus];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      const leftTimestamp = left.lastTransactionDate ? new Date(left.lastTransactionDate).getTime() : 0;
      const rightTimestamp = right.lastTransactionDate ? new Date(right.lastTransactionDate).getTime() : 0;

      if (leftTimestamp !== rightTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return left.name.localeCompare(right.name);
    });

  const lowStockWarnings = buildLowStockWarnings(stockItems);
  const nearExpiryAlerts = buildNearExpiryAlerts(imports, materials);

  return {
    totalMaterials: materials.length,
    activeAlerts: stockItems.filter((item) => item.alertStatus !== 'healthy').length,
    totalPortfolioValue: Number(stockItems.reduce((sum, item) => sum + item.stockValue, 0).toFixed(2)),
    stockItems,
    lowStockWarnings,
    nearExpiryAlerts,
  };
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

/**
 * Formats a date string or Date object into a readable date and time including minutes.
 * E.g., "2026-05-23T17:30:00.000Z" -> "2026-05-23 17:30"
 */
export const formatDateTime = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Formats an amount into US numeric format with two decimal places.
 * E.g., 1234.56 -> "1,234.56"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

