import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { GET, POST } from '@/app/api/materials/route';
import Material from '@/models/Material';
import Import from '@/models/Import';
import Export from '@/models/Export';
import { NextRequest } from 'next/server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Import.deleteMany({});
  await Export.deleteMany({});
  await Material.deleteMany({});
});

describe('Materials API Integration Tests', () => {
  it('GET /api/materials - should return empty list initially', async () => {
    const req = new NextRequest('http://localhost/api/materials');
    const res = await GET(req);
    if (res.status !== 200) {
      console.log('GET API FAILED:', await res.clone().json());
    }
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it('POST /api/materials - should fail if unauthorized role', async () => {
    const req = new NextRequest('http://localhost/api/materials', {
      method: 'POST',
      headers: {
        'x-user-role': 'Operator',
      },
      body: JSON.stringify({
        name: 'Jasmine Seeds',
        type: 'Seeds',
        uom: 'kg',
        safetyStock: 10,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Unauthorized');
  });

  it('POST /api/materials - should successfully create material with valid manager role', async () => {
    const req = new NextRequest('http://localhost/api/materials', {
      method: 'POST',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        name: 'Premium NPK Fertilizer',
        type: 'Fertilizers',
        uom: 'bags',
        safetyStock: 20,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe('Premium NPK Fertilizer');
    expect(body.data.currentStock).toBe(0);

    // Verify in DB
    const dbMaterial = await Material.findOne({ name: 'Premium NPK Fertilizer' });
    expect(dbMaterial).toBeDefined();
    expect(dbMaterial?.safetyStock).toBe(20);
  });

  it('POST /api/materials - should reject duplicate names', async () => {
    await Material.create({
      name: 'Duplicate Tool',
      type: 'Tools',
      uom: 'units',
      safetyStock: 5,
    });

    const req = new NextRequest('http://localhost/api/materials', {
      method: 'POST',
      headers: {
        'x-user-role': 'FarmManager',
      },
      body: JSON.stringify({
        name: 'Duplicate Tool',
        type: 'Tools',
        uom: 'units',
        safetyStock: 10,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('already exists');
  });

  it('GET /api/materials - should return list sorted alphabetically', async () => {
    await Material.create([
      { name: 'Cabbage Seeds', type: 'Seeds', uom: 'g', safetyStock: 100 },
      { name: 'Apple Tree Seeds', type: 'Seeds', uom: 'units', safetyStock: 10 },
      { name: 'Banana Fertilizer', type: 'Fertilizers', uom: 'kg', safetyStock: 50 },
    ]);

    const req = new NextRequest('http://localhost/api/materials');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBe(3);

    // Verify alphabetical sorting by name: Apple -> Banana -> Cabbage
    expect(body.data[0].name).toBe('Apple Tree Seeds');
    expect(body.data[1].name).toBe('Banana Fertilizer');
    expect(body.data[2].name).toBe('Cabbage Seeds');
  });

  it('GET /api/materials?view=dashboard - should return dashboard metrics and alert-ranked stock items', async () => {
    const nearExpiryDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const outsideWindowDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

    const [riceSeed, nutrientMix] = await Material.create([
      { name: 'Rice Seed', type: 'Seeds', uom: 'kg', safetyStock: 10, currentStock: 12 },
      { name: 'Nutrient Mix', type: 'Fertilizers', uom: 'bags', safetyStock: 5, currentStock: 2 },
    ]);

    await Import.create([
      {
        date: new Date('2026-05-01T09:00:00.000Z'),
        supplierName: 'Seed Source',
        materialId: riceSeed._id,
        quantity: 12,
        unitPrice: 5,
        batchCode: 'SEED-45D',
        expirationDate: outsideWindowDate,
      },
      {
        date: new Date('2026-05-03T09:00:00.000Z'),
        supplierName: 'Field Supply',
        materialId: nutrientMix._id,
        quantity: 2,
        unitPrice: 20,
        batchCode: 'NPK-10D',
        expirationDate: nearExpiryDate,
      },
    ]);

    await Export.create({
      date: new Date('2026-05-05T09:00:00.000Z'),
      requesterName: 'Field A',
      materialId: nutrientMix._id,
      quantity: 1,
      destinationPurpose: 'Soil treatment',
    });

    const req = new NextRequest('http://localhost/api/materials?view=dashboard');
    const res = await GET(req);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.totalMaterials).toBe(2);
    expect(body.data.activeAlerts).toBe(1);
    expect(body.data.totalPortfolioValue).toBe(100);
    expect(body.data.stockItems[0].name).toBe('Nutrient Mix');
    expect(body.data.stockItems[0].alertStatus).toBe('low');
    expect(body.data.stockItems[0].totalExportedQuantity).toBe(1);
    expect(body.data.stockItems[1].name).toBe('Rice Seed');
    expect(body.data.lowStockWarnings).toHaveLength(1);
    expect(body.data.lowStockWarnings[0].name).toBe('Nutrient Mix');
    expect(body.data.nearExpiryAlerts).toHaveLength(1);
    expect(body.data.nearExpiryAlerts[0].batchCode).toBe('NPK-10D');
    expect(body.data.nearExpiryAlerts[0].daysRemaining).toBeGreaterThanOrEqual(0);
    expect(body.data.nearExpiryAlerts[0].daysRemaining).toBeLessThanOrEqual(30);
  });
});
