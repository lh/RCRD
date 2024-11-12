import { calculateSegmentsForHourRange } from '../segmentCalculator.js';

describe('segmentCalculator', () => {
    const testCases = [
        {
            name: "Hours 1-4",
            input: { start: 1, end: 4 },
            expected: Array.from({ length: 20 }, (_, i) => i),  // 0-19
            expectedCount: 20
        },
        {
            name: "Single hour (hour 3)",
            input: { start: 3, end: 3 },
            expected: [10, 11, 12, 13, 14],
            expectedCount: 5
        },
        {
            name: "Wrap around midnight (11-1)",
            input: { start: 11, end: 1 },
            expected: [...Array.from({ length: 10 }, (_, i) => i + 50), 0, 1, 2, 3, 4],
            expectedCount: 15
        },
        {
            name: "Full clock (12-12)",
            input: { start: 12, end: 12 },
            expected: Array.from({ length: 60 }, (_, i) => i),
            expectedCount: 60
        }
    ];

    testCases.forEach(testCase => {
        test(testCase.name, () => {
            const result = calculateSegmentsForHourRange(testCase.input.start, testCase.input.end);
            
            // Test array equality
            expect(result).toEqual(testCase.expected);
            
            // Test length
            expect(result).toHaveLength(testCase.expectedCount);
            
            // Test array contents (useful for debugging if test fails)
            const missing = testCase.expected.filter(x => !result.includes(x));
            const extra = result.filter(x => !testCase.expected.includes(x));
            
            expect(missing).toHaveLength(0);
            expect(extra).toHaveLength(0);
        });
    });
});
