import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Import from '@/models/Import';

describe('Import Model Unit Tests', () => {
  it('should validate a correct import object', () => {
    const importLog = new Import({
      date: new Date(),
      supplierName: 'Agri Supply Corp',
      materialId: new mongoose.Types.ObjectId(),
      quantity: 150,
      unitPrice: 15.5,
      batchCode: 'BATCH-2026-001',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
    });

    const error = importLog.validateSync();
    expect(error).toBeUndefined();
  });

  it('should fail validation if required fields are missing', () => {
    const importLog = new Import({});
    const error = importLog.validateSync();
    
    expect(error).toBeDefined();
    expect(error?.errors.date).toBeDefined();
    expect(error?.errors.supplierName).toBeDefined();
    expect(error?.errors.materialId).toBeDefined();
    expect(error?.errors.quantity).toBeDefined();
    expect(error?.errors.unitPrice).toBeDefined();
  });

  it('should fail validation if quantity is zero or negative', () => {
    const importLog = new Import({
      date: new Date(),
      supplierName: 'Agri Supply Corp',
      materialId: new mongoose.Types.ObjectId(),
      quantity: 0,
      unitPrice: 10,
    });

    const error = importLog.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.quantity).toBeDefined();
    expect(error?.errors.quantity.message).toContain('must be greater than zero');

    const negativeLog = new Import({
      date: new Date(),
      supplierName: 'Agri Supply Corp',
      materialId: new mongoose.Types.ObjectId(),
      quantity: -5,
      unitPrice: 10,
    });
    const errorNeg = negativeLog.validateSync();
    expect(errorNeg).toBeDefined();
    expect(errorNeg?.errors.quantity).toBeDefined();
  });

  it('should fail validation if unitPrice is zero or negative', () => {
    const importLog = new Import({
      date: new Date(),
      supplierName: 'Agri Supply Corp',
      materialId: new mongoose.Types.ObjectId(),
      quantity: 50,
      unitPrice: 0,
    });

    const error = importLog.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.unitPrice).toBeDefined();
    expect(error?.errors.unitPrice.message).toContain('must be greater than zero');

    const negativeLog = new Import({
      date: new Date(),
      supplierName: 'Agri Supply Corp',
      materialId: new mongoose.Types.ObjectId(),
      quantity: 50,
      unitPrice: -2.5,
    });
    const errorNeg = negativeLog.validateSync();
    expect(errorNeg).toBeDefined();
    expect(errorNeg?.errors.unitPrice).toBeDefined();
  });
});
