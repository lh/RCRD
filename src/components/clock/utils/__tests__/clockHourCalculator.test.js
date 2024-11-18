/**
 * @jest-environment jsdom
 */

import { segmentToHour, segmentIdToHour } from '../clockHourCalculator';

describe('clockHourCalculator', () => {
  describe('segmentToHour', () => {
    test('handles hour 12 segments correctly', () => {
      // Hour 12 spans segments 55-59 and 0-4
      expect(segmentToHour(55)).toBe(12);
      expect(segmentToHour(56)).toBe(12);
      expect(segmentToHour(57)).toBe(12);
      expect(segmentToHour(58)).toBe(12);
      expect(segmentToHour(59)).toBe(12);
      expect(segmentToHour(0)).toBe(12);
      expect(segmentToHour(1)).toBe(12);
      expect(segmentToHour(2)).toBe(12);
      expect(segmentToHour(3)).toBe(12);
      expect(segmentToHour(4)).toBe(12);
    });

    test('handles regular hours correctly', () => {
      // Hour 1 spans segments 5-9
      expect(segmentToHour(5)).toBe(2);
      expect(segmentToHour(9)).toBe(2);

      // Hour 2 spans segments 10-14
      expect(segmentToHour(10)).toBe(3);
      expect(segmentToHour(14)).toBe(3);

      // Hour 11 spans segments 50-54
      expect(segmentToHour(50)).toBe(11);
      expect(segmentToHour(54)).toBe(11);
    });
  });

  describe('segmentIdToHour', () => {
    test('handles hour 12 segment IDs correctly', () => {
      expect(segmentIdToHour('segment55')).toBe(12);
      expect(segmentIdToHour('segment59')).toBe(12);
      expect(segmentIdToHour('segment0')).toBe(12);
      expect(segmentIdToHour('segment4')).toBe(12);
    });

    test('handles regular hour segment IDs correctly', () => {
      expect(segmentIdToHour('segment5')).toBe(2);  // Hour 1
      expect(segmentIdToHour('segment10')).toBe(3); // Hour 2
      expect(segmentIdToHour('segment50')).toBe(11); // Hour 11
    });
  });
});
