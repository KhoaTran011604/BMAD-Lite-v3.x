import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

import { createTransactionSchema, type IMaterial } from '@/components/QuickActionDrawer';
import Export from '@/models/Export';
import { filterExportHistory, sortByDateDesc } from '@/lib/utils';

describe('Export Model Unit Tests', () => {
  it('should validate a correct export object', () => {
    const exportLog = new Export({
      date: new Date(),
      requesterName: 'Field Supervisor',
      materialId: new mongoose.Types.ObjectId(),
      quantity: 25,
      destinationPurpose: 'Field A',
    });

    const error = exportLog.validateSync();
    expect(error).toBeUndefined();
  });

  it('should fail validation if required fields are missing', () => {
    const exportLog = new Export({});
    const error = exportLog.validateSync();

    expect(error).toBeDefined();
    expect(error?.errors.date).toBeDefined();
    expect(error?.errors.requesterName).toBeDefined();
    expect(error?.errors.materialId).toBeDefined();
    expect(error?.errors.quantity).toBeDefined();
    expect(error?.errors.destinationPurpose).toBeDefined();
  });

  it('should fail validation if quantity is zero or negative', () => {
    const zeroQuantityExport = new Export({
      date: new Date(),
      requesterName: 'Field Supervisor',
      materialId: new mongoose.Types.ObjectId(),
      quantity: 0,
      destinationPurpose: 'Field A',
    });

    const zeroError = zeroQuantityExport.validateSync();
    expect(zeroError).toBeDefined();
    expect(zeroError?.errors.quantity).toBeDefined();
    expect(zeroError?.errors.quantity.message).toContain('must be greater than zero');

    const negativeQuantityExport = new Export({
      date: new Date(),
      requesterName: 'Field Supervisor',
      materialId: new mongoose.Types.ObjectId(),
      quantity: -3,
      destinationPurpose: 'Field A',
    });

    const negativeError = negativeQuantityExport.validateSync();
    expect(negativeError).toBeDefined();
    expect(negativeError?.errors.quantity).toBeDefined();
  });

  it('should reject export form values when quantity exceeds current stock', () => {
    const materials: IMaterial[] = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        name: 'Rice Seeds',
        type: 'Seeds',
        uom: 'kg',
        safetyStock: 10,
        currentStock: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const schema = createTransactionSchema(() => materials);

    const result = schema.safeParse({
      transactionMode: 'export',
      materialId: materials[0]._id,
      requesterName: 'Crew Alpha',
      quantity: 7,
      date: '2026-05-23',
      destinationPurpose: 'Field A',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quantity).toContain('Insufficient Stock');
    }
  });

  it('should require purpose or destination for export form values', () => {
    const materials: IMaterial[] = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        name: 'Safety Gloves',
        type: 'Tools',
        uom: 'pairs',
        safetyStock: 5,
        currentStock: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const schema = createTransactionSchema(() => materials);

    const result = schema.safeParse({
      transactionMode: 'export',
      materialId: materials[0]._id,
      requesterName: 'Crew Beta',
      quantity: 2,
      date: '2026-05-23',
      destinationPurpose: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.destinationPurpose).toContain('Purpose/Destination is required');
    }
  });

  it('should sort export history records by descending date', () => {
    const records = [
      {
        _id: 'record-a',
        date: '2026-05-01T10:00:00.000Z',
        requesterName: 'Crew A',
        materialId: {
          _id: 'material-a',
          name: 'Gloves',
          type: 'Tools' as const,
          uom: 'pairs',
          safetyStock: 5,
          currentStock: 40,
        },
        quantity: 2,
        destinationPurpose: 'Storage',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        _id: 'record-b',
        date: '2026-05-20T10:00:00.000Z',
        requesterName: 'Crew B',
        materialId: {
          _id: 'material-b',
          name: 'Rice Seeds',
          type: 'Seeds' as const,
          uom: 'kg',
          safetyStock: 10,
          currentStock: 100,
        },
        quantity: 12,
        destinationPurpose: 'Field East',
        createdAt: '2026-05-20T10:00:00.000Z',
        updatedAt: '2026-05-20T10:00:00.000Z',
      },
      {
        _id: 'record-c',
        date: '2026-05-12T10:00:00.000Z',
        requesterName: 'Crew C',
        materialId: {
          _id: 'material-c',
          name: 'Fertilizer',
          type: 'Fertilizers' as const,
          uom: 'bags',
          safetyStock: 6,
          currentStock: 22,
        },
        quantity: 4,
        destinationPurpose: 'Field West',
        createdAt: '2026-05-12T10:00:00.000Z',
        updatedAt: '2026-05-12T10:00:00.000Z',
      },
    ];

    const sorted = sortByDateDesc(records);

    expect(sorted.map((record) => record._id)).toEqual(['record-b', 'record-c', 'record-a']);
  });

  it('should filter export history records by requester, material, or destination', () => {
    const records = [
      {
        _id: 'record-a',
        date: '2026-05-01T10:00:00.000Z',
        requesterName: 'Crew Alpha',
        materialId: {
          _id: 'material-a',
          name: 'Gloves',
          type: 'Tools' as const,
          uom: 'pairs',
          safetyStock: 5,
          currentStock: 40,
        },
        quantity: 2,
        destinationPurpose: 'Storage',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        _id: 'record-b',
        date: '2026-05-20T10:00:00.000Z',
        requesterName: 'Field Lead',
        materialId: {
          _id: 'material-b',
          name: 'Rice Seeds',
          type: 'Seeds' as const,
          uom: 'kg',
          safetyStock: 10,
          currentStock: 100,
        },
        quantity: 12,
        destinationPurpose: 'Field East',
        createdAt: '2026-05-20T10:00:00.000Z',
        updatedAt: '2026-05-20T10:00:00.000Z',
      },
    ];

    expect(filterExportHistory(records, 'field lead')).toHaveLength(1);
    expect(filterExportHistory(records, 'field east')).toHaveLength(1);
    expect(filterExportHistory(records, 'rice')).toHaveLength(1);
    expect(filterExportHistory(records, 'unknown')).toHaveLength(0);
  });
});
