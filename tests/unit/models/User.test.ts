import { describe, expect, it } from 'vitest';

import User, { UserRole } from '@/models/User';

describe('User Model Unit Tests', () => {
  it('should validate a correct user object', () => {
    const user = new User({
      username: 'farmmanager01',
      passwordHash: 'hashed-password-value',
      salt: 'salt-value',
      role: 'FarmManager',
    });

    const error = user.validateSync();
    expect(error).toBeUndefined();
  });

  it('should fail validation if required fields are missing', () => {
    const user = new User({});
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error?.errors.username).toBeDefined();
    expect(error?.errors.passwordHash).toBeDefined();
    expect(error?.errors.salt).toBeDefined();
    expect(error?.errors.role).toBeDefined();
  });

  it('should fail validation when role is invalid', () => {
    const user = new User({
      username: 'invalidroleuser',
      passwordHash: 'hashed-password-value',
      salt: 'salt-value',
      role: 'Operator' as unknown as UserRole,
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error?.errors.role).toBeDefined();
    expect(error?.errors.role.message).toContain('Operator is not a valid user role');
  });

  it('should normalize username to lowercase', () => {
    const user = new User({
      username: 'CaseSensitiveUser',
      passwordHash: 'hashed-password-value',
      salt: 'salt-value',
      role: 'Worker',
    });

    expect(user.username).toBe('casesensitiveuser');
  });
});
