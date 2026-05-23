import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { GET, POST } from '@/app/api/imports/route';
import Import from '@/models/Import';
import Material from '@/models/Material';
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
  await Material.deleteMany({});
});

describe('Imports API Integration Tests', () => {
  it('GET /api/imports - should return empty list initially', async () => {
    const req = new NextRequest('http://localhost/api/imports');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it('POST /api/imports - should fail if unauthorized role', async () => {
    const material = await Material.create({
      name: 'Corn Seeds',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 10,
    });

    const req = new NextRequest('http://localhost/api/imports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Operator', // Non-admin role
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        supplierName: 'Seed Co',
        materialId: material._id.toString(),
        quantity: 50,
        unitPrice: 5.5,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Unauthorized');
  });

  it('POST /api/imports - should fail if quantity is zero or negative', async () => {
    const material = await Material.create({
      name: 'Pesticide X',
      type: 'Pesticides',
      uom: 'liters',
      safetyStock: 5,
    });

    const reqZero = new NextRequest('http://localhost/api/imports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        supplierName: 'Agro Chem',
        materialId: material._id.toString(),
        quantity: 0,
        unitPrice: 15.0,
      }),
    });

    const resZero = await POST(reqZero);
    expect(resZero.status).toBe(400);
    const bodyZero = await resZero.json();
    expect(bodyZero.error).toContain('greater than zero');

    const reqNeg = new NextRequest('http://localhost/api/imports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        supplierName: 'Agro Chem',
        materialId: material._id.toString(),
        quantity: -10,
        unitPrice: 15.0,
      }),
    });

    const resNeg = await POST(reqNeg);
    expect(resNeg.status).toBe(400);
  });

  it('POST /api/imports - should successfully record import and increment stock', async () => {
    const material = await Material.create({
      name: 'Organic Compost',
      type: 'Fertilizers',
      uom: 'bags',
      safetyStock: 20,
      currentStock: 5, // initial stock
    });

    const req = new NextRequest('http://localhost/api/imports', {
      method: 'POST',
      headers: {
        'x-user-role': 'FarmManager',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        supplierName: 'Earth Supply',
        materialId: material._id.toString(),
        quantity: 35,
        unitPrice: 12.0,
        batchCode: 'COMP-091',
        expirationDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.supplierName).toBe('Earth Supply');
    expect(body.data.quantity).toBe(35);
    expect(body.data.unitPrice).toBe(12.0);
    expect(body.data.batchCode).toBe('COMP-091');
    expect(body.data.materialId._id).toBe(material._id.toString()); // check populated material reference

    // Verify stock is incremented: 5 + 35 = 40
    const dbMaterial = await Material.findById(material._id);
    expect(dbMaterial?.currentStock).toBe(40);

    // Verify import is logged in DB
    const dbImport = await Import.findOne({ supplierName: 'Earth Supply' });
    expect(dbImport).toBeDefined();
    expect(dbImport?.quantity).toBe(35);
  });

  it('POST /api/imports - should reject if referenced materialId does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const req = new NextRequest('http://localhost/api/imports', {
      method: 'POST',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        supplierName: 'Farming Co',
        materialId: fakeId,
        quantity: 10,
        unitPrice: 1.5,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('does not exist');
  });

  it('GET /api/imports - should return imports sorted descending by date', async () => {
    const material = await Material.create({
      name: 'Hand Trowel',
      type: 'Tools',
      uom: 'units',
      safetyStock: 2,
    });

    // Create 3 imports at different dates
    const date1 = new Date('2026-05-01T10:00:00.000Z');
    const date2 = new Date('2026-05-15T12:00:00.000Z');
    const date3 = new Date('2026-05-10T14:00:00.000Z');

    await Import.create([
      { date: date1, supplierName: 'Supplier A', materialId: material._id, quantity: 5, unitPrice: 8.5 },
      { date: date2, supplierName: 'Supplier B', materialId: material._id, quantity: 10, unitPrice: 7.9 },
      { date: date3, supplierName: 'Supplier C', materialId: material._id, quantity: 15, unitPrice: 8.0 },
    ]);

    const req = new NextRequest('http://localhost/api/imports');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBe(3);

    // Verify date descending ordering: Supplier B (May 15) -> Supplier C (May 10) -> Supplier A (May 1)
    expect(body.data[0].supplierName).toBe('Supplier B');
    expect(body.data[1].supplierName).toBe('Supplier C');
    expect(body.data[2].supplierName).toBe('Supplier A');
  });
});
