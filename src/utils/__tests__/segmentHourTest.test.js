/**
 * Tests for segmentHourTest utility
 * Tests segment to hour mapping function
 */

import { segmentToHour } from '../segmentHourTest';

describe('segmentToHour', () => {
  describe('Basic Mapping', () => {
    it('should map segments 0 and 23 to hour 12', () => {
      expect(segmentToHour(0)).toBe(12);
      expect(segmentToHour(23)).toBe(12);
    });

    it('should map segments 1-2 to hour 1', () => {
      expect(segmentToHour(1)).toBe(1);
      expect(segmentToHour(2)).toBe(1);
    });

    it('should map segments 3-4 to hour 2', () => {
      expect(segmentToHour(3)).toBe(2);
      expect(segmentToHour(4)).toBe(2);
    });

    it('should map segments 5-6 to hour 3', () => {
      expect(segmentToHour(5)).toBe(3);
      expect(segmentToHour(6)).toBe(3);
    });

    it('should map segments 7-8 to hour 4', () => {
      expect(segmentToHour(7)).toBe(4);
      expect(segmentToHour(8)).toBe(4);
    });

    it('should map segments 9-10 to hour 5', () => {
      expect(segmentToHour(9)).toBe(5);
      expect(segmentToHour(10)).toBe(5);
    });

    it('should map segments 11-12 to hour 6', () => {
      expect(segmentToHour(11)).toBe(6);
      expect(segmentToHour(12)).toBe(6);
    });

    it('should map segments 13-14 to hour 7', () => {
      expect(segmentToHour(13)).toBe(7);
      expect(segmentToHour(14)).toBe(7);
    });

    it('should map segments 15-16 to hour 8', () => {
      expect(segmentToHour(15)).toBe(8);
      expect(segmentToHour(16)).toBe(8);
    });

    it('should map segments 17-18 to hour 9', () => {
      expect(segmentToHour(17)).toBe(9);
      expect(segmentToHour(18)).toBe(9);
    });

    it('should map segments 19-20 to hour 10', () => {
      expect(segmentToHour(19)).toBe(10);
      expect(segmentToHour(20)).toBe(10);
    });

    it('should map segments 21-22 to hour 11', () => {
      expect(segmentToHour(21)).toBe(11);
      expect(segmentToHour(22)).toBe(11);
    });
  });

  describe('Complete Mapping Table', () => {
    it('should produce correct mapping for all 24 segments', () => {
      const expectedMappings = {
        0: 12, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3,
        6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 6,
        12: 6, 13: 7, 14: 7, 15: 8, 16: 8, 17: 9,
        18: 9, 19: 10, 20: 10, 21: 11, 22: 11, 23: 12
      };

      for (let segment = 0; segment < 24; segment++) {
        expect(segmentToHour(segment)).toBe(expectedMappings[segment]);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative segments by normalizing', () => {
      expect(segmentToHour(-1)).toBe(12); // -1 normalizes to 23
      expect(segmentToHour(-2)).toBe(11); // -2 normalizes to 22
      expect(segmentToHour(-3)).toBe(11); // -3 normalizes to 21
      expect(segmentToHour(-24)).toBe(12); // -24 normalizes to 0
    });

    it('should handle segments greater than 23 by wrapping', () => {
      expect(segmentToHour(24)).toBe(12); // 24 wraps to 0
      expect(segmentToHour(25)).toBe(1);  // 25 wraps to 1
      expect(segmentToHour(26)).toBe(1);  // 26 wraps to 2
      expect(segmentToHour(47)).toBe(12); // 47 wraps to 23
      expect(segmentToHour(48)).toBe(12); // 48 wraps to 0
    });

    it('should handle very large positive segments', () => {
      expect(segmentToHour(100)).toBe(2); // 100 % 24 = 4 -> hour 2
      expect(segmentToHour(1000)).toBe(8); // 1000 % 24 = 16 -> hour 8
      expect(segmentToHour(12345)).toBe(5); // 12345 % 24 = 9 -> hour 5
    });

    it('should handle very large negative segments', () => {
      expect(segmentToHour(-100)).toBe(10); // Normalizes correctly
      expect(segmentToHour(-1000)).toBe(4); // Normalizes correctly
    });
  });

  describe('Mathematical Properties', () => {
    it('should maintain periodicity of 24', () => {
      for (let segment = 0; segment < 24; segment++) {
        const hour1 = segmentToHour(segment);
        const hour2 = segmentToHour(segment + 24);
        const hour3 = segmentToHour(segment - 24);
        const hour4 = segmentToHour(segment + 48);
        
        expect(hour1).toBe(hour2);
        expect(hour1).toBe(hour3);
        expect(hour1).toBe(hour4);
      }
    });

    it('should map pairs of consecutive segments to same hour', () => {
      for (let hour = 1; hour <= 11; hour++) {
        const segment1 = (hour - 1) * 2 + 1;
        const segment2 = (hour - 1) * 2 + 2;
        
        expect(segmentToHour(segment1)).toBe(hour);
        expect(segmentToHour(segment2)).toBe(hour);
      }
    });

    it('should follow the formula correctly', () => {
      // Testing the formula: x = (segment + 24) / 2; hour = x > 12 ? x - 12 : x
      for (let segment = 0; segment < 24; segment++) {
        const normalizedSegment = ((segment % 24) + 24) % 24;
        const x = (normalizedSegment + 24) / 2;
        let expectedHour = x > 12 ? x - 12 : x;
        expectedHour = Math.ceil(expectedHour);
        if (expectedHour === 0) expectedHour = 12;
        
        expect(segmentToHour(segment)).toBe(expectedHour);
      }
    });
  });

  describe('Boundary Values', () => {
    it('should handle segment 0 correctly', () => {
      expect(segmentToHour(0)).toBe(12);
    });

    it('should handle segment 23 correctly', () => {
      expect(segmentToHour(23)).toBe(12);
    });

    it('should handle transitions between hours', () => {
      // Test the boundary between each hour
      expect(segmentToHour(2)).toBe(1);
      expect(segmentToHour(3)).toBe(2);
      
      expect(segmentToHour(4)).toBe(2);
      expect(segmentToHour(5)).toBe(3);
      
      expect(segmentToHour(22)).toBe(11);
      expect(segmentToHour(23)).toBe(12);
    });
  });

  describe('Type Handling', () => {
    it('should handle numeric strings', () => {
      expect(segmentToHour('5')).toBe(3);
      expect(segmentToHour('23')).toBe(12);
      expect(segmentToHour('0')).toBe(12);
    });

    it('should handle floating point segments', () => {
      expect(segmentToHour(5.5)).toBe(3);
      expect(segmentToHour(5.9)).toBe(3);
      expect(segmentToHour(6.1)).toBe(4); // 6.1 rounds to segment 6, then follows normal mapping
    });

    it('should handle special numeric values', () => {
      // NaN becomes NaN through calculations, which fails comparisons
      const nanResult = segmentToHour(NaN);
      expect(Number.isNaN(nanResult)).toBe(true);
      
      // Infinity and -Infinity don't normalize well
      const infResult = segmentToHour(Infinity);
      expect(Number.isNaN(infResult)).toBe(true);
      
      const negInfResult = segmentToHour(-Infinity);
      expect(Number.isNaN(negInfResult)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large batches efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        segmentToHour(i % 24);
      }
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(100); // Should process 10000 calls in under 100ms
    });
  });

  describe('Clock Face Correlation', () => {
    it('should map segments to correct clock positions', () => {
      // Segments 23, 0 = 12 o'clock
      expect(segmentToHour(23)).toBe(12);
      expect(segmentToHour(0)).toBe(12);
      
      // Segments 5, 6 = 3 o'clock
      expect(segmentToHour(5)).toBe(3);
      expect(segmentToHour(6)).toBe(3);
      
      // Segments 11, 12 = 6 o'clock
      expect(segmentToHour(11)).toBe(6);
      expect(segmentToHour(12)).toBe(6);
      
      // Segments 17, 18 = 9 o'clock
      expect(segmentToHour(17)).toBe(9);
      expect(segmentToHour(18)).toBe(9);
    });
  });
});