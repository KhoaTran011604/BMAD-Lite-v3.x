import { describe, it, expect } from 'vitest';
import Material, { MaterialType } from '@/models/Material';
import {
  buildDashboardSummary,
  buildLowStockWarnings,
  buildNearExpiryAlerts,
  calculateAverageUnitPrice,
} from '@/lib/utils';

describe('Material Model Unit Tests', () => {
  it('should validate a correct material object', () => {
    const material = new Material({
      name: 'Premium Jasmine Seeds',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 50,
      currentStock: 0,
    });

    const error = material.validateSync();
    expect(error).toBeUndefined();
  });

  it('should fail validation if required fields are missing', () => {
    const material = new Material({});
    const error = material.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.name).toBeDefined();
    expect(error?.errors.type).toBeDefined();
    expect(error?.errors.uom).toBeDefined();
  });

  it('should fail validation if an invalid type is specified', () => {
    const material = new Material({
      name: 'Invalid Item',
      type: 'Electronics' as unknown as MaterialType, // Use compliant type casting instead of banned 'any'
      uom: 'pcs',
      safetyStock: 10,
    });

    const error = material.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.type).toBeDefined();
    expect(error?.errors.type.message).toContain('Electronics is not a valid material type');
  });

  it('should fail validation if safetyStock is negative', () => {
    const material = new Material({
      name: 'Negative Threshold',
      type: 'Tools',
      uom: 'units',
      safetyStock: -5,
    });

    const error = material.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.safetyStock).toBeDefined();
    expect(error?.errors.safetyStock.message).toContain('Safety Stock must be a positive number');
  });

  it('should fail validation if currentStock is negative', () => {
    const material = new Material({
      name: 'Negative Stock',
      type: 'Tools',
      uom: 'units',
      safetyStock: 5,
      currentStock: -10,
    });

    const error = material.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.currentStock).toBeDefined();
  });

  it('should calculate a weighted average unit price for dashboard valuation', () => {
    const averageUnitPrice = calculateAverageUnitPrice(
      [
        { materialId: 'material-1', quantity: 10, unitPrice: 4, date: '2026-05-01T00:00:00.000Z' },
        { materialId: 'material-1', quantity: 30, unitPrice: 6, date: '2026-05-02T00:00:00.000Z' },
      ],
      'material-1'
    );

    expect(averageUnitPrice).toBe(5.5);
  });

  it('should build dashboard totals and alert rankings from stock activity', () => {
    const summary = buildDashboardSummary(
      [
        {
          _id: 'material-1',
          name: 'Alpha Seeds',
          type: 'Seeds',
          uom: 'kg',
          safetyStock: 5,
          currentStock: 10,
        },
        {
          _id: 'material-2',
          name: 'Bravo Fertilizer',
          type: 'Fertilizers',
          uom: 'bags',
          safetyStock: 6,
          currentStock: 2,
        },
      ],
      [
        { materialId: 'material-1', quantity: 20, unitPrice: 3, date: '2026-05-10T00:00:00.000Z' },
        { materialId: 'material-2', quantity: 10, unitPrice: 8, date: '2026-05-12T00:00:00.000Z' },
      ],
      [{ materialId: 'material-2', quantity: 3, date: '2026-05-15T00:00:00.000Z' }]
    );

    expect(summary.totalMaterials).toBe(2);
    expect(summary.activeAlerts).toBe(1);
    expect(summary.totalPortfolioValue).toBe(46);
    expect(summary.stockItems[0].name).toBe('Bravo Fertilizer');
    expect(summary.stockItems[0].alertStatus).toBe('low');
    expect(summary.stockItems[0].lastTransactionDate).toBe('2026-05-15T00:00:00.000Z');
    expect(summary.lowStockWarnings.length).toBe(1);
    expect(summary.lowStockWarnings[0].name).toBe('Bravo Fertilizer');
  });

  it('should prioritize low-stock warnings by urgency and shortage depth', () => {
    const lowStockWarnings = buildLowStockWarnings([
      {
        materialId: 'material-1',
        name: 'Tool Kit',
        type: 'Tools',
        uom: 'units',
        currentStock: 1,
        safetyStock: 2,
        averageUnitPrice: 0,
        stockValue: 0,
        totalImportedQuantity: 0,
        totalExportedQuantity: 0,
        lastTransactionDate: null,
        alertStatus: 'low',
      },
      {
        materialId: 'material-2',
        name: 'Fertilizer A',
        type: 'Fertilizers',
        uom: 'bags',
        currentStock: 0,
        safetyStock: 8,
        averageUnitPrice: 0,
        stockValue: 0,
        totalImportedQuantity: 0,
        totalExportedQuantity: 0,
        lastTransactionDate: null,
        alertStatus: 'out',
      },
      {
        materialId: 'material-3',
        name: 'Seed Pack',
        type: 'Seeds',
        uom: 'kg',
        currentStock: 2,
        safetyStock: 10,
        averageUnitPrice: 0,
        stockValue: 0,
        totalImportedQuantity: 0,
        totalExportedQuantity: 0,
        lastTransactionDate: null,
        alertStatus: 'low',
      },
    ]);

    expect(lowStockWarnings.length).toBe(3);
    expect(lowStockWarnings[0].name).toBe('Fertilizer A');
    expect(lowStockWarnings[1].name).toBe('Seed Pack');
    expect(lowStockWarnings[2].name).toBe('Tool Kit');
    expect(lowStockWarnings[0].shortageQuantity).toBe(8);
  });

  it('should derive near-expiry alerts for batches expiring within 30 days', () => {
    const nearExpiryAlerts = buildNearExpiryAlerts(
      [
        {
          materialId: 'material-1',
          quantity: 40,
          unitPrice: 3,
          date: '2026-05-01T00:00:00.000Z',
          batchCode: 'BATCH-9D',
          expirationDate: '2026-06-03T00:00:00.000Z',
        },
        {
          materialId: 'material-1',
          quantity: 40,
          unitPrice: 3,
          date: '2026-05-01T00:00:00.000Z',
          batchCode: 'BATCH-35D',
          expirationDate: '2026-06-29T00:00:00.000Z',
        },
      ],
      [
        {
          _id: 'material-1',
          name: 'Rice Seed',
          type: 'Seeds',
          uom: 'kg',
          safetyStock: 10,
          currentStock: 12,
        },
      ],
      new Date('2026-05-25T08:00:00.000Z')
    );

    expect(nearExpiryAlerts.length).toBe(1);
    expect(nearExpiryAlerts[0].batchCode).toBe('BATCH-9D');
    expect(nearExpiryAlerts[0].materialName).toBe('Rice Seed');
    expect(nearExpiryAlerts[0].daysRemaining).toBe(9);
  });
});
