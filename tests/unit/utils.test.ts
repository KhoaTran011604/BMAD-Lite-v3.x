import { describe, it, expect } from 'vitest';
import { formatDateTime, formatCurrency } from '@/lib/utils';

describe('Shared Formatting Utilities Unit Tests', () => {
  describe('formatDateTime', () => {
    it('should format a valid ISO string with minutes in YYYY-MM-DD HH:mm format', () => {
      const dateStr = '2026-05-23T17:30:00.000Z';
      // Use local timezone offsets or UTC methods, but since standard new Date(2026, 4, 23, 17, 30) is safer:
      const date = new Date(2026, 4, 23, 17, 30); // May 23, 2026 17:30 (0-indexed month)
      const expected = '2026-05-23 17:30';
      expect(formatDateTime(date)).toBe(expected);
    });

    it('should return empty string if input is null or undefined', () => {
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
    });

    it('should return stringified invalid date if parsing fails', () => {
      expect(formatDateTime('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers to US locale format without currency symbol', () => {
      expect(formatCurrency(1234.56)).toBe('1,234.56');
      expect(formatCurrency(0)).toBe('0.00');
      expect(formatCurrency(-50)).toBe('-50.00');
    });
  });
});
