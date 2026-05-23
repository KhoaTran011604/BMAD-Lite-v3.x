import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

import { POST as login } from '@/app/api/auth/login/route';
import { GET as me } from '@/app/api/auth/me/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { POST as register } from '@/app/api/auth/register/route';
import { SESSION_COOKIE_NAME } from '@/lib/auth-helper';
import User from '@/models/User';

let mongoServer: MongoMemoryServer;

const extractSessionTokenFromCookie = (setCookieHeader: string | null): string => {
  if (!setCookieHeader) {
    throw new Error('Set-Cookie header is missing');
  }

  const cookiePart = setCookieHeader.split(';')[0];
  const cookiePrefix = `${SESSION_COOKIE_NAME}=`;

  if (!cookiePart.startsWith(cookiePrefix)) {
    throw new Error('Session cookie not found in response');
  }

  return cookiePart.slice(cookiePrefix.length);
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGODB_URI = uri;
  process.env.AUTH_SECRET = 'integration-test-secret';
  process.env.AUTH_PBKDF2_ITERATIONS = '10000';

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
  await User.deleteMany({});
});

describe('Auth API Integration Tests', () => {
  it('POST /api/auth/register - should enforce register schema rules', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'ab',
        password: '123',
        role: 'Operator',
      }),
    });

    const res = await register(req);

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain('Username must be at least 3 characters');
    expect(body.error).toContain('Password must be at least 6 characters');
    expect(body.error).toContain('Role must be one of: Manager, FarmManager, Worker');
  });

  it('POST /api/auth/register - should create a user with hashed password and salt', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'Manager01',
        password: 'secret123',
        role: 'Manager',
      }),
    });

    const res = await register(req);

    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.data.username).toBe('manager01');
    expect(body.data.role).toBe('Manager');

    const createdUser = await User.findOne({ username: 'manager01' });

    expect(createdUser).toBeDefined();
    expect(createdUser?.passwordHash).toBeDefined();
    expect(createdUser?.salt).toBeDefined();
    expect(createdUser?.passwordHash).not.toBe('secret123');
  });

  it('POST /api/auth/login - should issue secure session cookie with 24-hour expiration', async () => {
    await register(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'FarmAdmin',
          password: 'secret123',
          role: 'FarmManager',
        }),
      })
    );

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'FarmAdmin',
        password: 'secret123',
      }),
    });

    const res = await login(req);

    expect(res.status).toBe(200);

    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Secure');
    expect(setCookieHeader).toContain('SameSite=lax');
    expect(setCookieHeader).toContain('Max-Age=86400');
  });

  it('POST /api/auth/login - should reject invalid credentials', async () => {
    await register(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'worker01',
          password: 'workerpass',
          role: 'Worker',
        }),
      })
    );

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'worker01',
        password: 'wrongpass',
      }),
    });

    const res = await login(req);

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe('Invalid username or password');
  });

  it('GET /api/auth/me - should return authenticated user data with valid cookie', async () => {
    await register(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'sessionuser',
          password: 'secret123',
          role: 'Worker',
        }),
      })
    );

    const loginRes = await login(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'sessionuser',
          password: 'secret123',
        }),
      })
    );

    const token = extractSessionTokenFromCookie(loginRes.headers.get('set-cookie'));

    const meReq = new NextRequest('http://localhost/api/auth/me', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const meRes = await me(meReq);

    expect(meRes.status).toBe(200);

    const body = await meRes.json();
    expect(body.data.username).toBe('sessionuser');
    expect(body.data.role).toBe('Worker');
  });

  it('GET /api/auth/me - should return unauthorized when cookie is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/me');

    const res = await me(req);

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('POST /api/auth/logout - should clear session cookie', async () => {
    const res = await logout();

    expect(res.status).toBe(200);

    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookieHeader).toContain('Max-Age=0');
    expect(setCookieHeader).toContain('Expires=Thu, 01 Jan 1970');
  });
});
