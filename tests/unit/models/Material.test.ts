import { describe, it, expect } from 'vitest';
import Material, { MaterialType } from '@/models/Material';

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
});
