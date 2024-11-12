/**
 * Tests for getClockHour utility
 * Focus: Converting segment numbers to clock hours
 */

import { getClockHour } from '../getClockHour';

describe('getClockHour', () => {
  describe('special cases around hour 12', () => {
    test('handles segments before midnight', () => {
      expect(getClockHour(57)).toBe(12);
      expect(getClockHour(58)).toBe(12);
      expect(getClockHour(59)).toBe(12);
    });

    test('handles segments after midnight', () => {
      expect(getClockHour(0)).toBe(12);
      expect(getClockHour(1)).toBe(12);
      expect(getClockHour(2)).toBe(12);
    });
  });

  describe('special cases around hour 6', () => {
    test('handles segments around hour 6', () => {
      expect(getClockHour(28)).toBe(6); // start of hour 6
      expect(getClockHour(30)).toBe(6); // middle of hour 6
      expect(getClockHour(32)).toBe(6); // end of hour 6
    });
  });

  describe('regular hour calculations', () => {
    const regularHours = [
      { segment: 5, hour: 1 },
      { segment: 10, hour: 2 },
      { segment: 15, hour: 3 },
      { segment: 20, hour: 4 },
      { segment: 25, hour: 5 },
      { segment: 35, hour: 7 },
      { segment: 40, hour: 8 },
      { segment: 45, hour: 9 },
      { segment: 50, hour: 10 },
      { segment: 55, hour: 11 }
    ];

    test.each(regularHours)(
      'converts segment $segment to hour $hour',
      ({ segment, hour }) => {
        expect(getClockHour(segment)).toBe(hour);
      }
    );
  });

  describe('boundary cases', () => {
    test('handles segments just after hour 12', () => {
      expect(getClockHour(3)).toBe(1);
    });

    test('handles segments just before hour 12', () => {
      expect(getClockHour(56)).toBe(11);
    });

    test('handles segments at hour boundaries', () => {
      // Test segments at the start of each hour
      expect(getClockHour(5)).toBe(1);  // Hour 1 start
      expect(getClockHour(10)).toBe(2); // Hour 2 start
      expect(getClockHour(15)).toBe(3); // Hour 3 start
      
      // Test segments at the end of each hour
      expect(getClockHour(9)).toBe(2);  // Hour 1 end
      expect(getClockHour(14)).toBe(3); // Hour 2 end
      expect(getClockHour(19)).toBe(4); // Hour 3 end
    });
  });

  describe('hour calculation rules', () => {
    test('handles segments within 2 of hour boundary', () => {
      // For segments within 2 of a multiple of 5, use floor division
      expect(getClockHour(7)).toBe(1);  // 7 % 5 = 2
      expect(getClockHour(12)).toBe(2); // 12 % 5 = 2
      expect(getClockHour(17)).toBe(3); // 17 % 5 = 2
    });

    test('handles segments more than 2 from hour boundary', () => {
      // For segments more than 2 from a multiple of 5, round up to next hour
      expect(getClockHour(8)).toBe(2);  // 8 % 5 = 3
      expect(getClockHour(13)).toBe(3); // 13 % 5 = 3
      expect(getClockHour(18)).toBe(4); // 18 % 5 = 3
    });
  });

  describe('out-of-bounds behavior', () => {
    test('treats negative segments as hour 12', () => {
      expect(getClockHour(-5)).toBe(12);
      expect(getClockHour(-10)).toBe(12);
    });

    test('treats segments above 59 as hour 12', () => {
      expect(getClockHour(65)).toBe(12);
      expect(getClockHour(70)).toBe(12);
    });
  });
});
