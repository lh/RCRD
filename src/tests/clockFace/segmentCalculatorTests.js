import { calculateSegmentsForHourRange } from '../../components/clock/utils/segmentCalculator.js';

const runSegmentCalculatorTests = () => {
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

    let allTestsPassed = true;

    testCases.forEach(test => {
        const result = calculateSegmentsForHourRange(test.input.start, test.input.end);
        const resultStr = JSON.stringify(result);
        const expectedStr = JSON.stringify(test.expected);
        const passed = resultStr === expectedStr;
        
        console.log('\n' + '='.repeat(50));
        console.log(`Test: ${test.name}`);
        console.log('-'.repeat(50));
        console.log(`Input: ${test.input.start} to ${test.input.end} o'clock`);
        console.log('Expected segments:', test.expected.join(', '));
        console.log('Got segments:', result.join(', '));
        console.log('Expected count:', test.expectedCount);
        console.log('Got count:', result.length);
        console.log('Test passed:', passed ? '✓ YES' : '✗ NO');
        
        if (!passed) {
            allTestsPassed = false;
            console.log('\nDifferences found:');
            const missing = test.expected.filter(x => !result.includes(x));
            const extra = result.filter(x => !test.expected.includes(x));
            if (missing.length) console.log('Missing:', missing.join(', '));
            if (extra.length) console.log('Extra:', extra.join(', '));
        }
    });

    return allTestsPassed;
};

// Run tests if this file is executed directly
if (import.meta.url === import.meta.resolve('./segmentCalculatorTests.js')) {
    const passed = runSegmentCalculatorTests();
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Overall test status: ${passed ? '✓ PASSED' : '✗ FAILED'}`);
    console.log('='.repeat(50));
}