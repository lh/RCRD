/**
 * Tests for interpolateSegments utility
 * Focus: Segment interpolation and gap filling
 */

import { interpolateSegments } from '../interpolateSegments';

describe('interpolateSegments', () => {
  describe('basic functionality', () => {
    test('returns empty array for empty input', () => {
      expect(interpolateSegments([])).toEqual([]);
    });

    test('returns same array for single segment', () => {
      expect(interpolateSegments([5])).toEqual([5]);
    });

    test('returns sorted segments when no interpolation needed', () => {
      expect(interpolateSegments([5, 3, 4])).toEqual([3, 4, 5]);
    });
  });

  describe('gap interpolation', () => {
    test('interpolates small gaps (≤ 7 segments)', () => {
      // Gap of 2
      expect(interpolateSegments([1, 3])).toEqual([1, 2, 3]);
      
      // Gap of 3
      expect(interpolateSegments([1, 4])).toEqual([1, 2, 3, 4]);
      
      // Gap of 7
      expect(interpolateSegments([1, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test('does not interpolate large gaps (> 7 segments)', () => {
      expect(interpolateSegments([1, 10])).toEqual([1, 10]);
    });

    test('interpolates all gaps ≤ 7 segments', () => {
      // The implementation interpolates all gaps ≤ 7
      expect(interpolateSegments([1, 3, 10, 12]))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });

  describe('wraparound handling', () => {
    test('handles wraparound at hour 12', () => {
      // Test case from original tests
      expect(interpolateSegments([58, 1, 2, 5, 10]))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 58]);
    });

    test('handles continuous range around hour 12', () => {
      // Test case from original tests
      expect(interpolateSegments([55, 0, 5, 10, 15]))
        .toEqual([55, 56, 57, 58, 59, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    test('handles simple wraparound case', () => {
      expect(interpolateSegments([58, 0, 2]))
        .toEqual([58, 59, 0, 1, 2]);
    });
  });

  describe('edge cases', () => {
    test('handles consecutive segments', () => {
      expect(interpolateSegments([0, 1, 2, 3, 4, 5]))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });

    test('handles non-consecutive but distant segments', () => {
      expect(interpolateSegments([10, 20, 30, 40, 50]))
        .toEqual([10, 20, 30, 40, 50]);
    });

    test('preserves duplicate segments', () => {
      // The implementation preserves duplicates
      expect(interpolateSegments([1, 1, 3, 3]))
        .toEqual([1, 1, 2, 3, 3]);
    });

    test('handles out-of-order input', () => {
      expect(interpolateSegments([5, 2, 8, 1]))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('validation', () => {
    test('preserves segment numbers outside 0-59 range', () => {
      // The implementation does not apply modulo 60
      expect(interpolateSegments([60, 61, 62]))
        .toEqual([60, 61, 62]);
    });

    test('preserves negative numbers', () => {
      // The implementation preserves negative numbers
      expect(interpolateSegments([-1, 1]))
        .toEqual([-1, 0, 1]);
    });
  });
});
