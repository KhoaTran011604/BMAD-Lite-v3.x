import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { PUT } from '@/app/api/materials/[id]/route';
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

describe('Material PUT API Integration Tests', () => {
  it('PUT /api/materials/[id] - should fail if unauthorized role', async () => {
    const material = await Material.create({
      name: 'Old Fertilizer',
      type: 'Fertilizers',
      uom: 'bags',
      safetyStock: 10,
    });

    const req = new NextRequest(`http://localhost/api/materials/${material._id}`, {
      method: 'PUT',
      headers: {
        'x-user-role': 'Operator',
      },
      body: JSON.stringify({
        name: 'New Fertilizer Name',
        type: 'Fertilizers',
        uom: 'bags',
        safetyStock: 15,
      }),
    });

    const res = await PUT(req, { params: { id: material._id.toString() } });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Unauthorized');
  });

  it('PUT /api/materials/[id] - should update successfully with valid admin role', async () => {
    const material = await Material.create({
      name: 'Seeds to Update',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 5,
    });

    const req = new NextRequest(`http://localhost/api/materials/${material._id}`, {
      method: 'PUT',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        name: 'Seeds Updated Name',
        type: 'Seeds',
        uom: 'bags',
        safetyStock: 8,
      }),
    });

    const res = await PUT(req, { params: { id: material._id.toString() } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe('Seeds Updated Name');
    expect(body.data.safetyStock).toBe(8);
    expect(body.data.uom).toBe('bags');

    // Confirm database update
    const updatedInDb = await Material.findById(material._id);
    expect(updatedInDb?.name).toBe('Seeds Updated Name');
    expect(updatedInDb?.safetyStock).toBe(8);
  });

  it('PUT /api/materials/[id] - should reject invalid parameter types', async () => {
    const material = await Material.create({
      name: 'Seeds Parameter Check',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 5,
    });

    const req = new NextRequest(`http://localhost/api/materials/${material._id}`, {
      method: 'PUT',
      headers: {
        'x-user-role': 'FarmManager',
      },
      body: JSON.stringify({
        name: 'Seeds Parameter Check',
        type: 'Seeds',
        uom: 'kg',
        safetyStock: -5, // Negative stock threshold should be rejected
      }),
    });

    const res = await PUT(req, { params: { id: material._id.toString() } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('non-negative');
  });

  it('PUT /api/materials/[id] - should reject name collision with other materials', async () => {
    const target = await Material.create({
      name: 'Unique Seed Name',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 5,
    });

    await Material.create({
      name: 'Existing Seed Name',
      type: 'Seeds',
      uom: 'kg',
      safetyStock: 10,
    });

    const req = new NextRequest(`http://localhost/api/materials/${target._id}`, {
      method: 'PUT',
      headers: {
        'x-user-role': 'Manager',
      },
      body: JSON.stringify({
        name: 'Existing Seed Name', // Collision!
        type: 'Seeds',
        uom: 'kg',
        safetyStock: 5,
      }),
    });

    const res = await PUT(req, { params: { id: target._id.toString() } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('already exists');
  });
});
