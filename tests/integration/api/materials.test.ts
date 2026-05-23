import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { GET, POST } from '@/app/api/materials/route';
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
});
