/**
 * @jest-environment jsdom
 */

import { segmentToHour, segmentIdToHour } from '../clockHourCalculator';

describe('clockHourCalculator', () => {
  describe('segmentToHour', () => {
    test('handles hour 12 segments correctly', () => {
      // Hour 12 spans segments 23 and 0 in 24-segment system
      expect(segmentToHour(23)).toBe(12);
      expect(segmentToHour(0)).toBe(12);
    });

    test('handles regular hours correctly', () => {
      // Hour 1 spans segments 1-2
      expect(segmentToHour(1)).toBe(1);
      expect(segmentToHour(2)).toBe(1);

      // Hour 2 spans segments 3-4
      expect(segmentToHour(3)).toBe(2);
      expect(segmentToHour(4)).toBe(2);

      // Hour 3 spans segments 5-6
      expect(segmentToHour(5)).toBe(3);
      expect(segmentToHour(6)).toBe(3);

      // Hour 11 spans segments 21-22
      expect(segmentToHour(21)).toBe(11);
      expect(segmentToHour(22)).toBe(11);
    });
  });

  describe('segmentIdToHour', () => {
    test('handles hour 12 segment IDs correctly', () => {
      expect(segmentIdToHour('segment23')).toBe(12);
      expect(segmentIdToHour('segment0')).toBe(12);
    });

    test('handles regular hour segment IDs correctly', () => {
      expect(segmentIdToHour('segment1')).toBe(1);  // Hour 1
      expect(segmentIdToHour('segment2')).toBe(1);  // Hour 1
      expect(segmentIdToHour('segment5')).toBe(3);  // Hour 3
      expect(segmentIdToHour('segment10')).toBe(5); // Hour 5
      expect(segmentIdToHour('segment21')).toBe(11); // Hour 11
    });
  });
});
