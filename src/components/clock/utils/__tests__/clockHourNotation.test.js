/**
 * Tests for ClockHourNotation utility
 * Focus: Hour notation formatting and segment calculations
 * 
 * The clock face is divided into 60 segments (5 per hour):
 * Hour 1: 0-4
 * Hour 2: 5-9
 * Hour 3: 10-14
 * Hour 4: 15-19
 * Hour 5: 20-24
 * Hour 6: 25-29
 * Hour 7: 30-34
 * Hour 8: 35-39
 * Hour 9: 40-44
 * Hour 10: 45-49
 * Hour 11: 50-54
 * Hour 12: 55-59
 * 
 * Special Cases:
 * - Hour 12 includes both segments 55-59 and segments 0-4 for wraparound
 * - Hour 3 is included when segments 10-14 OR 20-24 are present
 * - Hour 9 is included when segments 40-44 OR 50-54 are present
 * - Hour 6 is automatically included if hours 5 or 7 are present
 */

import { ClockHourNotation } from '../clockHourNotation';

describe('ClockHourNotation', () => {
  describe('segmentsTouchHour', () => {
    test('correctly identifies segments touching hour 12', () => {
      expect(ClockHourNotation.segmentsTouchHour([55, 56, 57], 12)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([0, 1, 2], 12)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([30, 31, 32], 12)).toBe(false);
    });

    test('correctly identifies segments touching regular hours', () => {
      expect(ClockHourNotation.segmentsTouchHour([5, 6, 7], 2)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([10, 11, 12], 3)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([5, 6, 7], 3)).toBe(false);
    });

    test('handles edge cases', () => {
      expect(ClockHourNotation.segmentsTouchHour([], 1)).toBe(false);
      expect(ClockHourNotation.segmentsTouchHour([59, 0], 12)).toBe(true);
    });
  });

  describe('buildRanges', () => {
    test('handles simple consecutive hours', () => {
      const hours = new Set([1, 2, 3]);
      expect(ClockHourNotation.buildRanges(hours)).toEqual([
        { start: 1, end: 3 }
      ]);
    });

    test('handles midnight crossing with 11-1', () => {
      const hours = new Set([11, 12, 1]);
      expect(ClockHourNotation.buildRanges(hours)).toEqual([
        { start: 11, end: 1 }
      ]);
    });

    test('handles multiple ranges', () => {
      const hours = new Set([1, 2, 3, 6, 7, 8]);
      expect(ClockHourNotation.buildRanges(hours)).toEqual([
        { start: 1, end: 3 },
        { start: 6, end: 8 }
      ]);
    });

    test('handles single hour', () => {
      const hours = new Set([6]);
      expect(ClockHourNotation.buildRanges(hours)).toEqual([
        { start: 6, end: 6 }
      ]);
    });

    test('handles complex midnight crossing', () => {
      const hours = new Set([10, 11, 12, 1, 2]);
      expect(ClockHourNotation.buildRanges(hours)).toEqual([
        { start: 11, end: 2 },
        { start: 10, end: 10 }
      ]);
    });
  });

  describe('formatDetachment', () => {
    test('handles empty or null segments', () => {
      expect(ClockHourNotation.formatDetachment(null)).toBe('None');
      expect(ClockHourNotation.formatDetachment([])).toBe('None');
    });

    test('handles total detachment', () => {
      const segments = Array.from({ length: 55 }, (_, i) => i);
      expect(ClockHourNotation.formatDetachment(segments)).toBe('1-12 o\'clock (Total)');
    });

    test('handles single hour', () => {
      expect(ClockHourNotation.formatDetachment([0, 1, 2, 3, 4])).toBe('12-1 o\'clock');
    });

    test('handles midnight crossing', () => {
      const segments = [53, 54, 55, 56, 57, 58, 59, 0, 1, 2];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('11-1; 9-9 o\'clock');
    });

    test('handles multiple ranges', () => {
      const segments = [25, 26, 27, 28, 29, 30, 40, 41, 42];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('6-7; 9-9 o\'clock');
    });

    test('includes hour 6 when hour 5 is present', () => {
      const segments = [20, 21, 22, 23, 24, 25];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('3-3; 5-6 o\'clock');
    });

    test('includes hour 6 when hour 7 is present', () => {
      const segments = [30, 31, 32, 33, 34];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('6-7 o\'clock');
    });

    test('includes hour 3 for specific segments', () => {
      const segments = [10, 11, 12, 13, 14];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('3-3 o\'clock');
    });

    test('includes hour 9 for specific segments', () => {
      const segments = [40, 41, 42, 43, 44];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('9-9 o\'clock');
    });

    test('handles complex midnight crossing with multiple ranges', () => {
      const segments = [
        ...Array.from({ length: 5 }, (_, i) => i + 50), // Hour 11
        ...Array.from({ length: 5 }, (_, i) => i + 55), // Hour 12
        ...Array.from({ length: 5 }, (_, i) => i),      // Hour 1
        ...Array.from({ length: 5 }, (_, i) => i + 25), // Hour 6
      ];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('11-1; 6-6; 9-9 o\'clock');
    });

    test('handles special case from screenshot', () => {
      const segments = [
        ...Array.from({ length: 15 }, (_, i) => i + 40), // Hours 9-11
        ...Array.from({ length: 25 }, (_, i) => i + 10)  // Hours 3-7
      ];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('3-7; 9-11 o\'clock');
    });
  });
});
