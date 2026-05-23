import { describe, expect, it } from 'vitest';

import { loginSchema } from '@/shemas/loginSchema';
import { registerSchema } from '@/shemas/registerSchema';

describe('Auth Schemas Unit Tests', () => {
  it('should validate a correct login payload', () => {
    const result = loginSchema.safeParse({
      username: 'operator01',
      password: 'strong-password',
    });

    expect(result.success).toBe(true);
  });

  it('should reject an empty login payload', () => {
    const result = loginSchema.safeParse({
      username: '',
      password: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.errors.map((item) => item.message);
      expect(messages).toContain('Username is required');
      expect(messages).toContain('Password is required');
    }
  });

  it('should validate a correct register payload', () => {
    const result = registerSchema.safeParse({
      username: 'manager01',
      password: 'secret123',
      confirmPassword: 'secret123',
      role: 'Manager',
    });

    expect(result.success).toBe(true);
  });

  it('should reject register payload with unmatched passwords', () => {
    const result = registerSchema.safeParse({
      username: 'worker01',
      password: 'secret123',
      confirmPassword: 'different123',
      role: 'Worker',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.errors.map((item) => item.message);
      expect(messages).toContain('Confirm password must match password');
    }
  });

  it('should reject register payload with invalid role', () => {
    const result = registerSchema.safeParse({
      username: 'worker01',
      password: 'secret123',
      confirmPassword: 'secret123',
      role: 'FarmManager',
    });

    expect(result.success).toBe(false);
  });
});
