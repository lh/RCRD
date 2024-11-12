/**
 * Tests for clockMapping utility
 * Focus: Bidirectional mapping between segments and clock hours
 */

import {
  segmentToClockHourMap,
  segmentToClockHour,
  clockHourToSegmentsMap,
  getSegmentsForClockHour
} from '../clockMapping';

describe('clockMapping', () => {
  describe('segmentToClockHourMap', () => {
    test('has correct length', () => {
      expect(segmentToClockHourMap.length).toBe(60);
    });

    test('maps hour 12 segments correctly', () => {
      const hour12Segments = [0, 1, 2, 3, 56, 57, 58, 59];
      hour12Segments.forEach(segment => {
        expect(segmentToClockHourMap[segment]).toBe(12);
      });
    });

    test('maps regular hours correctly', () => {
      const hourMappings = [
        { segments: [4, 5, 6, 7, 8], hour: 1 },
        { segments: [9, 10, 11, 12, 13], hour: 2 },
        { segments: [14, 15, 16, 17, 18], hour: 3 },
        { segments: [19, 20, 21, 22, 23], hour: 4 },
        { segments: [24, 25, 26], hour: 5 },
        { segments: [27, 28, 29, 30, 31, 32], hour: 6 },
        { segments: [33, 34, 35], hour: 7 },
        { segments: [36, 37, 38, 39, 40], hour: 8 },
        { segments: [41, 42, 43, 44, 45], hour: 9 },
        { segments: [46, 47, 48, 49, 50], hour: 10 },
        { segments: [51, 52, 53, 54, 55], hour: 11 }
      ];

      hourMappings.forEach(({ segments, hour }) => {
        segments.forEach(segment => {
          expect(segmentToClockHourMap[segment]).toBe(hour);
        });
      });
    });

    test('never returns 0 for valid segments', () => {
      segmentToClockHourMap.forEach((hour, segment) => {
        if (segment >= 0 && segment < 60) {
          expect(hour).not.toBe(0);
        }
      });
    });
  });

  describe('segmentToClockHour', () => {
    test('returns correct hour for hour 12 segments', () => {
      const hour12Segments = [0, 1, 2, 3, 56, 57, 58, 59];
      hour12Segments.forEach(segment => {
        expect(segmentToClockHour(segment)).toBe(12);
      });
    });

    test('returns correct hour for regular segments', () => {
      const testCases = [
        { segment: 5, hour: 1 },
        { segment: 10, hour: 2 },
        { segment: 15, hour: 3 },
        { segment: 30, hour: 6 },
        { segment: 45, hour: 9 }
      ];

      testCases.forEach(({ segment, hour }) => {
        expect(segmentToClockHour(segment)).toBe(hour);
      });
    });

    test('handles out-of-bounds segments', () => {
      expect(segmentToClockHour(-1)).toBeUndefined();
      expect(segmentToClockHour(60)).toBeUndefined();
    });
  });

  describe('clockHourToSegmentsMap', () => {
    test('contains all hours 1-12', () => {
      for (let hour = 1; hour <= 12; hour++) {
        expect(clockHourToSegmentsMap.has(hour)).toBe(true);
      }
    });

    test('maps hour 12 correctly', () => {
      const segments = clockHourToSegmentsMap.get(12);
      expect(segments).toEqual([0, 1, 2, 3, 56, 57, 58, 59]);
    });

    test('maps hour 6 correctly', () => {
      const segments = clockHourToSegmentsMap.get(6);
      expect(segments).toEqual([27, 28, 29, 30, 31, 32]);
    });

    test('maps regular hours correctly', () => {
      const testCases = [
        { hour: 1, count: 5 },
        { hour: 2, count: 5 },
        { hour: 3, count: 5 },
        { hour: 4, count: 5 },
        { hour: 5, count: 3 },
        { hour: 6, count: 6 },
        { hour: 7, count: 3 },
        { hour: 8, count: 5 },
        { hour: 9, count: 5 },
        { hour: 10, count: 5 },
        { hour: 11, count: 5 }
      ];

      testCases.forEach(({ hour, count }) => {
        const segments = clockHourToSegmentsMap.get(hour);
        expect(segments.length).toBe(count);
      });
    });
  });

  describe('getSegmentsForClockHour', () => {
    test('returns correct segments for hour 12', () => {
      const segments = getSegmentsForClockHour(12);
      expect(segments).toEqual([0, 1, 2, 3, 56, 57, 58, 59]);
    });

    test('returns correct segments for hour 6', () => {
      const segments = getSegmentsForClockHour(6);
      expect(segments).toEqual([27, 28, 29, 30, 31, 32]);
    });

    test('returns empty array for invalid hour', () => {
      expect(getSegmentsForClockHour(0)).toEqual([]);
      expect(getSegmentsForClockHour(13)).toEqual([]);
      expect(getSegmentsForClockHour(-1)).toEqual([]);
    });
  });

  describe('bidirectional mapping consistency', () => {
    test('segment→hour→segments maintains segment membership', () => {
      // For each segment, get its hour, then get all segments for that hour
      // The original segment should be in that set
      for (let segment = 0; segment < 60; segment++) {
        const hour = segmentToClockHour(segment);
        const segments = getSegmentsForClockHour(hour);
        expect(segments).toContain(segment);
      }
    });

    test('hour→segments→hour maintains hour value', () => {
      // For each hour, get its segments, then map each segment back to hour
      // Should always get the original hour
      for (let hour = 1; hour <= 12; hour++) {
        const segments = getSegmentsForClockHour(hour);
        segments.forEach(segment => {
          expect(segmentToClockHour(segment)).toBe(hour);
        });
      }
    });
  });
});
