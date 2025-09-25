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
      // Hour 12 uses segments 23-0 in 24-segment model
      expect(ClockHourNotation.segmentsTouchHour([23, 0], 12)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([0, 1], 12)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([10, 11], 12)).toBe(false);
    });

    test('correctly identifies segments touching regular hours', () => {
      // Hour 2: segments 3-4, Hour 3: segments 5-6
      expect(ClockHourNotation.segmentsTouchHour([3, 4], 2)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([5, 6], 3)).toBe(true);
      expect(ClockHourNotation.segmentsTouchHour([3, 4], 3)).toBe(false);
    });

    test('handles edge cases', () => {
      expect(ClockHourNotation.segmentsTouchHour([], 1)).toBe(false);
      // Hour 12 spans segments 23-0
      expect(ClockHourNotation.segmentsTouchHour([23, 0], 12)).toBe(true);
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
      // Total detachment needs 23+ segments in 24-segment model
      const segments = Array.from({ length: 23 }, (_, i) => i);
      expect(ClockHourNotation.formatDetachment(segments)).toBe('1-12 o\'clock (Total)');
    });

    test('handles single hour', () => {
      // Hour 12: segments 23-0, Hour 1: segments 1-2
      expect(ClockHourNotation.formatDetachment([23, 0, 1, 2])).toBe('12-1 o\'clock');
    });

    test('handles midnight crossing', () => {
      // Hour 11: segments 21-22, Hour 12: segments 23-0, Hour 1: segments 1-2
      const segments = [21, 22, 23, 0, 1, 2];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('11-1 o\'clock');
    });

    test('handles multiple ranges', () => {
      // Hour 6: segments 11-12, Hour 7: segments 13-14, Hour 9: segments 17-18
      const segments = [11, 12, 13, 14, 17, 18];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('6-7; 9-9 o\'clock');
    });

    test('includes hour 6 when hour 5 is present', () => {
      // Hour 5: segments 9-10, Hour 6: segments 11-12
      const segments = [9, 10, 11, 12];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('5-6 o\'clock');
    });

    test('includes hour 6 when hour 7 is present', () => {
      // Hour 6: segments 11-12, Hour 7: segments 13-14
      const segments = [11, 12, 13, 14];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('6-7 o\'clock');
    });

    test('includes hour 3 for specific segments', () => {
      // Hour 3: segments 5-6
      const segments = [5, 6];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('3-3 o\'clock');
    });

    test('includes hour 9 for specific segments', () => {
      // Hour 9: segments 17-18
      const segments = [17, 18];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('9-9 o\'clock');
    });

    test('handles complex midnight crossing with multiple ranges', () => {
      const segments = [
        21, 22,  // Hour 11
        23, 0,   // Hour 12 
        1, 2,    // Hour 1
        11, 12,  // Hour 6
        17, 18   // Hour 9
      ];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('11-1; 6-6; 9-9 o\'clock');
    });

    test('handles special case from screenshot', () => {
      const segments = [
        5, 6, 7, 8, 9, 10, 11, 12, 13, 14,  // Hours 3-7
        17, 18, 19, 20, 21, 22               // Hours 9-11
      ];
      expect(ClockHourNotation.formatDetachment(segments)).toBe('3-7; 9-11 o\'clock');
    });
  });
});
