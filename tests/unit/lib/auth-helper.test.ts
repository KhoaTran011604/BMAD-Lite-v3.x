import { beforeEach, describe, expect, it } from 'vitest';

import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from '@/lib/auth-helper';

beforeEach(() => {
  process.env.AUTH_SECRET = 'unit-test-secret';
  process.env.AUTH_PBKDF2_ITERATIONS = '10000';
});

describe('Auth Helper Unit Tests', () => {
  it('should hash and verify password successfully', async () => {
    const password = 'strong-password-123';
    const { passwordHash, salt } = await hashPassword(password);

    expect(passwordHash).not.toBe(password);
    expect(salt.length).toBeGreaterThan(0);

    const verified = await verifyPassword(password, passwordHash, salt);
    expect(verified).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const { passwordHash, salt } = await hashPassword('correct-password');

    const verified = await verifyPassword('wrong-password', passwordHash, salt);
    expect(verified).toBe(false);
  });

  it('should create and verify encrypted session token', () => {
    const token = createSessionToken({
      username: 'manager01',
      role: 'Manager',
    });

    const payload = verifySessionToken(token);

    expect(payload).toEqual({
      username: 'manager01',
      role: 'Manager',
    });
  });

  it('should reject tampered session token', () => {
    const token = createSessionToken({
      username: 'worker01',
      role: 'Worker',
    });

    const tamperedToken = `${token}tampered`;
    const payload = verifySessionToken(tamperedToken);

    expect(payload).toBeNull();
  });

  it('should reject expired session token', () => {
    const token = createSessionToken(
      {
        username: 'farmmanager01',
        role: 'FarmManager',
      },
      -1
    );

    const payload = verifySessionToken(token);
    expect(payload).toBeNull();
  });
});
