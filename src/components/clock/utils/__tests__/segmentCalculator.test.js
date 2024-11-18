/**
 * @jest-environment jsdom
 */

import { calculateSegmentsForHourRange } from '../segmentCalculator';

describe('calculateSegmentsForHourRange', () => {
  test('handles 11-12 range correctly', () => {
    const segments = calculateSegmentsForHourRange(11, 12);
    // Should include segments 50-59 (hour 11 and 12)
    const expected = Array.from({ length: 10 }, (_, i) => i + 50);
    expect(segments).toEqual(expected);
  });

  test('handles 11-1 range correctly', () => {
    const segments = calculateSegmentsForHourRange(11, 1);
    // Should include segments 50-59 (hour 11), 0-4 (hour 1)
    const expected = [
      ...Array.from({ length: 10 }, (_, i) => i + 50), // Hour 11
      ...Array.from({ length: 5 }, (_, i) => i)        // Hour 1
    ];
    expect(segments).toEqual(expected);
  });

  test('handles 12-12 range correctly', () => {
    const segments = calculateSegmentsForHourRange(12, 12);
    // Should return all segments (0-59)
    const expected = Array.from({ length: 60 }, (_, i) => i);
    expect(segments).toEqual(expected);
  });

  test('handles 12-1 range correctly', () => {
    const segments = calculateSegmentsForHourRange(12, 1);
    // Should include segments 55-59 (hour 12) and 0-4 (hour 1)
    const expected = [
      ...Array.from({ length: 5 }, (_, i) => i + 55), // Hour 12
      ...Array.from({ length: 5 }, (_, i) => i)       // Hour 1
    ];
    expect(segments).toEqual(expected);
  });

  test('handles regular range correctly', () => {
    const segments = calculateSegmentsForHourRange(3, 5);
    // Should include segments 10-24 (hours 3-5)
    const expected = Array.from({ length: 15 }, (_, i) => i + 10);
    expect(segments).toEqual(expected);
  });
});
