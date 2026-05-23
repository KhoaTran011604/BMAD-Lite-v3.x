import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/exports/route';
import Export from '@/models/Export';
import Material from '@/models/Material';

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
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
  await Export.deleteMany({});
  await Material.deleteMany({});
});

describe('Exports API Integration Tests', () => {
  it('GET /api/exports - should return an empty list initially', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it('POST /api/exports - should fail if unauthorized role', async () => {
    const material = await Material.create({
      name: 'Fertilizer A',
      type: 'Fertilizers',
      uom: 'bags',
      safetyStock: 10,
      currentStock: 25,
    });

    const req = new NextRequest('http://localhost/api/exports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Operator',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        requesterName: 'Shift Lead',
        materialId: material._id.toString(),
        quantity: 5,
        destinationPurpose: 'Field B',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toContain('Unauthorized');
  });

  it('POST /api/exports - should reject invalid payloads', async () => {
    const material = await Material.create({
      name: 'Tool Kit',
      type: 'Tools',
      uom: 'units',
      safetyStock: 2,
      currentStock: 10,
    });

    const req = new NextRequest('http://localhost/api/exports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        requesterName: '',
        materialId: material._id.toString(),
        quantity: 0,
        destinationPurpose: '',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain('Requester name cannot be empty');
    expect(body.error).toContain('Quantity must be greater than zero');
    expect(body.error).toContain('Destination purpose cannot be empty');
  });

  it('POST /api/exports - should reject when stock is insufficient and keep stock unchanged', async () => {
    const material = await Material.create({
      name: 'Herbicide X',
      type: 'Pesticides',
      uom: 'liters',
      safetyStock: 3,
      currentStock: 4,
    });

    const req = new NextRequest('http://localhost/api/exports', {
      method: 'POST',
      headers: {
        'x-user-role': 'FarmManager',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        requesterName: 'Field Lead',
        materialId: material._id.toString(),
        quantity: 7,
        destinationPurpose: 'Field C',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe('Insufficient stock available');

    const dbMaterial = await Material.findById(material._id);
    expect(dbMaterial?.currentStock).toBe(4);

    const exportsCount = await Export.countDocuments();
    expect(exportsCount).toBe(0);
  });

  it('POST /api/exports - should create an export and decrement stock when inventory is available', async () => {
    const material = await Material.create({
      name: 'Rice Seeds',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 15,
      currentStock: 50,
    });

    const req = new NextRequest('http://localhost/api/exports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        date: new Date('2026-05-23T08:00:00.000Z').toISOString(),
        requesterName: 'Warehouse Lead',
        materialId: material._id.toString(),
        quantity: 12,
        destinationPurpose: 'Field North',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.data.requesterName).toBe('Warehouse Lead');
    expect(body.data.quantity).toBe(12);
    expect(body.data.destinationPurpose).toBe('Field North');
    expect(body.data.materialId._id).toBe(material._id.toString());

    const dbMaterial = await Material.findById(material._id);
    expect(dbMaterial?.currentStock).toBe(38);

    const dbExport = await Export.findOne({ requesterName: 'Warehouse Lead' });
    expect(dbExport).toBeDefined();
    expect(dbExport?.quantity).toBe(12);
  });

  it('POST /api/exports - should fall back when MongoDB transactions are unsupported', async () => {
    const material = await Material.create({
      name: 'Fallback Seeds',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 8,
      currentStock: 30,
    });

    const startSessionSpy = vi.spyOn(mongoose, 'startSession').mockResolvedValue({
      withTransaction: vi.fn().mockRejectedValue(
        new Error('Transaction numbers are only allowed on a replica set member or mongos')
      ),
      endSession: vi.fn().mockResolvedValue(undefined),
    } as unknown as mongoose.ClientSession);

    try {
      const req = new NextRequest('http://localhost/api/exports', {
        method: 'POST',
        headers: {
          'x-user-role': 'Manager',
        },
        body: JSON.stringify({
          date: new Date('2026-05-23T08:00:00.000Z').toISOString(),
          requesterName: 'Fallback Operator',
          materialId: material._id.toString(),
          quantity: 6,
          destinationPurpose: 'Field West',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.data.requesterName).toBe('Fallback Operator');

      const dbMaterial = await Material.findById(material._id);
      expect(dbMaterial?.currentStock).toBe(24);
    } finally {
      startSessionSpy.mockRestore();
    }
  });

  it('GET /api/exports - should return exports sorted descending by date', async () => {
    const material = await Material.create({
      name: 'Safety Gloves',
      type: 'Tools',
      uom: 'pairs',
      safetyStock: 5,
      currentStock: 100,
    });

    await Export.create([
      {
        date: new Date('2026-05-01T10:00:00.000Z'),
        requesterName: 'Crew A',
        materialId: material._id,
        quantity: 4,
        destinationPurpose: 'Storage',
      },
      {
        date: new Date('2026-05-15T10:00:00.000Z'),
        requesterName: 'Crew B',
        materialId: material._id,
        quantity: 7,
        destinationPurpose: 'Field D',
      },
      {
        date: new Date('2026-05-10T10:00:00.000Z'),
        requesterName: 'Crew C',
        materialId: material._id,
        quantity: 6,
        destinationPurpose: 'Field E',
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(3);
    expect(body.data[0].requesterName).toBe('Crew B');
    expect(body.data[1].requesterName).toBe('Crew C');
    expect(body.data[2].requesterName).toBe('Crew A');
  });
});
