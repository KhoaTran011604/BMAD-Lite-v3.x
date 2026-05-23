import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { PUT } from '@/app/api/materials/[id]/route';
import Material from '@/models/Material';
import { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, createSessionToken } from '@/lib/auth-helper';
import type { UserRole } from '@/lib/auth-helper';

let mongoServer: MongoMemoryServer;
const createSessionCookie = (role: UserRole): string =>
  `${SESSION_COOKIE_NAME}=${createSessionToken({
    username: `${role.toLowerCase()}-user`,
    role,
  })}`;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.AUTH_SECRET = 'integration-test-secret';
  
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
  it('PUT /api/materials/[id] - should fail when session cookie is missing', async () => {
    const material = await Material.create({
      name: 'Old Fertilizer',
      type: 'Fertilizers',
      uom: 'bags',
      safetyStock: 10,
    });

    const req = new NextRequest(`http://localhost/api/materials/${material._id}`, {
      method: 'PUT',
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

  it('PUT /api/materials/[id] - should fail with 403 for worker role', async () => {
    const material = await Material.create({
      name: 'Worker Update Attempt',
      type: 'Fertilizers',
      uom: 'bags',
      safetyStock: 10,
    });

    const req = new NextRequest(`http://localhost/api/materials/${material._id}`, {
      method: 'PUT',
      headers: {
        cookie: createSessionCookie('Worker'),
      },
      body: JSON.stringify({
        name: 'Worker Updated Name',
        type: 'Fertilizers',
        uom: 'bags',
        safetyStock: 15,
      }),
    });

    const res = await PUT(req, { params: { id: material._id.toString() } });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
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
        cookie: createSessionCookie('Manager'),
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
        cookie: createSessionCookie('FarmManager'),
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
        cookie: createSessionCookie('Manager'),
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
