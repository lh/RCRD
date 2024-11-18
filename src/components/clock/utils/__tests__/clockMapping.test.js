import { MAPPING_TYPE, getSegmentForAngle, getHourMapping, getHoursFromSegments, getSegmentsForHours } from '../clockMapping.js';
import { CLOCK } from '../clockConstants.js';

describe('clockMapping', () => {
    describe('getSegmentForAngle', () => {
        test('converts angles to segments correctly', () => {
            // Test every 15 degrees (one segment)
            expect(getSegmentForAngle(0)).toBe(0);    // 12 o'clock
            expect(getSegmentForAngle(15)).toBe(1);   // First segment after 12
            expect(getSegmentForAngle(30)).toBe(2);   // Second segment
            expect(getSegmentForAngle(345)).toBe(23); // Last segment
        });

        test('handles angle normalization', () => {
            expect(getSegmentForAngle(360)).toBe(0);  // Full circle
            expect(getSegmentForAngle(-15)).toBe(23); // Negative angle
            expect(getSegmentForAngle(375)).toBe(1);  // More than 360
        });
    });

    describe('getHourMapping', () => {
        test('maps segments to hours correctly', () => {
            // Test hour 12 segments
            expect(getHourMapping(23).hours).toEqual(new Set([12]));
            expect(getHourMapping(0).hours).toEqual(new Set([12]));

            // Test regular hours
            expect(getHourMapping(1).hours).toEqual(new Set([1]));
            expect(getHourMapping(2).hours).toEqual(new Set([1]));
            expect(getHourMapping(3).hours).toEqual(new Set([2]));
            expect(getHourMapping(4).hours).toEqual(new Set([2]));
        });

        test('handles DISPLAY mapping type', () => {
            // Test midnight crossing segments
            const segment23 = getHourMapping(23, MAPPING_TYPE.DISPLAY);
            expect(segment23.hours).toEqual(new Set([11, 12]));

            const segment0 = getHourMapping(0, MAPPING_TYPE.DISPLAY);
            expect(segment0.hours).toEqual(new Set([12, 1]));
        });

        test('handles MEDICAL mapping type', () => {
            // Test hour 6 inclusion rule
            const hour5seg = getHourMapping(10, MAPPING_TYPE.MEDICAL); // Hour 5 segment
            expect(hour5seg.hours).toContain(6);

            const hour7seg = getHourMapping(14, MAPPING_TYPE.MEDICAL); // Hour 7 segment
            expect(hour7seg.hours).toContain(6);
        });
    });

    describe('getHoursFromSegments', () => {
        test('converts segment arrays to hours', () => {
            // Test regular segments
            expect(getHoursFromSegments([1, 2])).toEqual(new Set([1]));
            expect(getHoursFromSegments([3, 4])).toEqual(new Set([2]));
        });

        test('handles string segment IDs', () => {
            expect(getHoursFromSegments(['segment1', 'segment2'])).toEqual(new Set([1]));
            expect(getHoursFromSegments(['segment23', 'segment0'])).toEqual(new Set([12]));
        });

        test('handles midnight crossing', () => {
            const segments = ['segment21', 'segment22', 'segment23', 'segment0', 'segment1', 'segment2'];
            const hours = getHoursFromSegments(segments, MAPPING_TYPE.DISPLAY);
            expect(hours).toEqual(new Set([11, 12, 1]));
        });

        test('applies medical rules when specified', () => {
            // Test hour 6 inclusion rule
            const segments = ['segment9', 'segment10']; // Hour 5 segments
            const hours = getHoursFromSegments(segments, MAPPING_TYPE.MEDICAL);
            expect(hours).toContain(6);
        });
    });

    describe('getSegmentsForHours', () => {
        test('gets correct segments for single hour', () => {
            expect(getSegmentsForHours(1, 1)).toEqual([1, 2]);
            expect(getSegmentsForHours(6, 6)).toEqual([11, 12]);
        });

        test('gets correct segments for hour range', () => {
            expect(getSegmentsForHours(1, 3)).toEqual([1, 2, 3, 4, 5, 6]);
        });

        test('handles midnight crossing', () => {
            const segments = getSegmentsForHours(11, 1);
            expect(segments).toEqual([21, 22, 23, 0, 1, 2]);
        });

        test('handles full clock', () => {
            const segments = getSegmentsForHours(12, 12);
            expect(segments).toEqual(Array.from({ length: 24 }, (_, i) => i));
        });
    });
});
