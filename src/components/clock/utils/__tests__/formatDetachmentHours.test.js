// src/components/clock/utils/__tests__/formatDetachmentHours.test.js
import { formatDetachmentHours } from '../formatDetachmentHours';

describe('formatDetachmentHours', () => {
    describe('edge cases', () => {
        test('should handle empty input', () => {
            expect(formatDetachmentHours([])).toBe('None');
        });

        test('should handle null input', () => {
            expect(formatDetachmentHours(null)).toBe('None');
        });

        test('should handle undefined input', () => {
            expect(formatDetachmentHours(undefined)).toBe('None');
        });

        test('should handle total detachment (56+ segments)', () => {
            const segments = Array.from({ length: 56 }, (_, i) => i);
            expect(formatDetachmentHours(segments)).toBe("1-12 o'clock (Total)");
        });
    });

    describe('single hour cases', () => {
        test('should format single hour at 12', () => {
            expect(formatDetachmentHours([0, 1])).toBe("12 o'clock");
        });

        test('should format single segment at 12', () => {
            expect(formatDetachmentHours([59])).toBe("12 o'clock");
        });

        test('should format single segment at boundary', () => {
            expect(formatDetachmentHours([5])).toBe("1 o'clock");
        });

        test('should format simple range within hour', () => {
            expect(formatDetachmentHours([5, 6, 7])).toBe("1 o'clock");
        });
    });

    describe('range cases', () => {
        test('should format range crossing midnight', () => {
            expect(formatDetachmentHours([58, 59, 0, 1])).toBe("12 o'clock");
        });

        test('should format large range crossing midnight', () => {
            const segments = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 0, 1, 2, 3, 4, 5, 6];
            expect(formatDetachmentHours(segments)).toBe("10-1 o'clock");
        });

        test('should format multiple separate ranges', () => {
            expect(formatDetachmentHours([0, 1, 2, 25, 26, 27, 28])).toBe("12; 5-6 o'clock");
        });

        test('should handle hour 6 special case', () => {
            expect(formatDetachmentHours([24, 25, 26, 27, 28])).toBe("5-6 o'clock");
        });
    });

    describe('boundary cases', () => {
        test('should handle segments at hour boundaries', () => {
            // Test each hour boundary
            expect(formatDetachmentHours([4, 5])).toBe("1 o'clock"); // 12-1 boundary
            expect(formatDetachmentHours([9, 10])).toBe("2 o'clock"); // 1-2 boundary
            expect(formatDetachmentHours([14, 15])).toBe("3 o'clock"); // 2-3 boundary
            expect(formatDetachmentHours([19, 20])).toBe("4 o'clock"); // 3-4 boundary
            expect(formatDetachmentHours([24, 25])).toBe("5 o'clock"); // 4-5 boundary
            expect(formatDetachmentHours([29, 30])).toBe("6 o'clock"); // 5-6 boundary
            expect(formatDetachmentHours([34, 35])).toBe("7 o'clock"); // 6-7 boundary
            expect(formatDetachmentHours([39, 40])).toBe("8 o'clock"); // 7-8 boundary
            expect(formatDetachmentHours([44, 45])).toBe("9 o'clock"); // 8-9 boundary
            expect(formatDetachmentHours([49, 50])).toBe("10 o'clock"); // 9-10 boundary
            expect(formatDetachmentHours([54, 55])).toBe("11 o'clock"); // 10-11 boundary
            expect(formatDetachmentHours([59, 0])).toBe("12 o'clock"); // 11-12 boundary
        });
    });

    describe('complex cases', () => {
        test('should handle discontinuous segments', () => {
            // Each non-continuous segment should be treated as a separate range
            expect(formatDetachmentHours([5, 7, 9])).toBe("1; 1; 2 o'clock");
        });

        test('should handle multiple discontinuous ranges', () => {
            // Each non-continuous segment forms its own range
            expect(formatDetachmentHours([0, 2, 25, 27, 50, 52]))
                .toBe("12; 12; 5; 5; 10; 10 o'clock");
        });

        test('should handle segments spanning multiple hours with gaps', () => {
            const segments = [0, 1, // 12 o'clock
                            10, 11, // 2 o'clock
                            20, 21, // 4 o'clock
                            30, 31]; // 6 o'clock
            expect(formatDetachmentHours(segments)).toBe("12; 2; 4; 6 o'clock");
        });
    });
});
