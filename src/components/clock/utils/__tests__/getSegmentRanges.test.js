import { getSegmentRanges } from '../getSegmentRanges';

describe('getSegmentRanges', () => {
    describe('edge cases', () => {
        test('should handle empty input', () => {
            expect(getSegmentRanges([])).toEqual([]);
        });

        test('should handle single segment', () => {
            expect(getSegmentRanges([5])).toEqual([
                { start: 5, length: 1 }
            ]);
        });
    });

    describe('wraparound cases', () => {
        test('should handle single wraparound', () => {
            expect(getSegmentRanges([58, 59, 0, 1])).toEqual([
                { start: 58, length: 4 }
            ]);
        });

        test('should handle multiple wraparounds', () => {
            expect(getSegmentRanges([58, 59, 0, 1, 30, 31, 45, 46])).toEqual([
                { start: 58, length: 4 },
                { start: 30, length: 2 },
                { start: 45, length: 2 }
            ]);
        });

        test('should handle two separate ranges with one wrapping', () => {
            expect(getSegmentRanges([58, 59, 0, 1, 30, 31, 32])).toEqual([
                { start: 58, length: 4 },
                { start: 30, length: 3 }
            ]);
        });
    });

    describe('continuous ranges', () => {
        test('should handle regular continuous range', () => {
            expect(getSegmentRanges([5, 6, 7, 8])).toEqual([
                { start: 5, length: 4 }
            ]);
        });

        test('should handle multiple continuous ranges', () => {
            expect(getSegmentRanges([1, 2, 3, 20, 21, 22, 40, 41, 42])).toEqual([
                { start: 1, length: 3 },
                { start: 20, length: 3 },
                { start: 40, length: 3 }
            ]);
        });
    });

    describe('complex cases', () => {
        test('should handle non-adjacent segments', () => {
            expect(getSegmentRanges([1, 3, 5])).toEqual([
                { start: 1, length: 1 },
                { start: 3, length: 1 },
                { start: 5, length: 1 }
            ]);
        });

        test('should handle mixed continuous and non-continuous segments', () => {
            expect(getSegmentRanges([1, 2, 3, 5, 7, 8, 9])).toEqual([
                { start: 1, length: 3 },
                { start: 5, length: 1 },
                { start: 7, length: 3 }
            ]);
        });

        test('should handle segments with wraparound and gaps', () => {
            expect(getSegmentRanges([57, 58, 59, 0, 2, 3, 4])).toEqual([
                { start: 57, length: 4 },
                { start: 2, length: 3 }
            ]);
        });
    });

    describe('boundary cases', () => {
        test('should handle segments at start of clock (0)', () => {
            expect(getSegmentRanges([0, 1, 2])).toEqual([
                { start: 0, length: 3 }
            ]);
        });

        test('should handle segments at end of clock (59)', () => {
            expect(getSegmentRanges([57, 58, 59])).toEqual([
                { start: 57, length: 3 }
            ]);
        });

        test('should handle single segments at boundaries', () => {
            expect(getSegmentRanges([0])).toEqual([{ start: 0, length: 1 }]);
            expect(getSegmentRanges([59])).toEqual([{ start: 59, length: 1 }]);
        });
    });

    describe('validation', () => {
        test('should maintain segment order in ranges', () => {
            // Test that segments maintain their relative positions
            const result = getSegmentRanges([58, 59, 0, 1]);
            expect(result).toEqual([{ start: 58, length: 4 }]);
            
            // Verify the range covers the segments in order
            const range = result[0];
            expect(range.start).toBe(58);
            expect(range.length).toBe(4);
        });

        test('should handle unordered input segments correctly', () => {
            const result = getSegmentRanges([1, 0, 59, 58]);
            
            // Verify properties that should be true regardless of order:
            // 1. All ranges should be continuous
            result.forEach(range => {
                expect(range.length).toBeGreaterThan(0);
            });

            // 2. Total number of segments should match input
            const totalSegments = result.reduce((sum, range) => sum + range.length, 0);
            expect(totalSegments).toBe(4);

            // 3. Each range should have valid start position (0-59)
            result.forEach(range => {
                expect(range.start).toBeGreaterThanOrEqual(0);
                expect(range.start).toBeLessThanOrEqual(59);
            });

            // 4. Each range should be properly formed (no negative lengths)
            result.forEach(range => {
                expect(range.length).toBeGreaterThan(0);
            });
        });
    });
});
