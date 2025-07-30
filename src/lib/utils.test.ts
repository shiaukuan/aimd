// ABOUTME: Unit tests for utility functions using Vitest and colocation testing pattern
// ABOUTME: Tests the cn function and other utility functions for correct behavior

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('bg-red-500', 'text-white');
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class');
      expect(result).toBe('base-class valid-class');
    });

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'another-class');
      expect(result).toBe('base-class another-class');
    });

    it('should merge conflicting Tailwind classes', () => {
      // tailwind-merge should handle conflicting classes
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        'active': true,
        'inactive': false,
        'base': true,
      });
      expect(result).toBe('active base');
    });

    it('should return empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle complex mixed inputs', () => {
      const result = cn(
        'base-class',
        ['array-class1', 'array-class2'],
        {
          'conditional-true': true,
          'conditional-false': false,
        },
        'final-class'
      );
      expect(result).toBe('base-class array-class1 array-class2 conditional-true final-class');
    });
  });
});