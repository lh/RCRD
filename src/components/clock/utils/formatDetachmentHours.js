// Import required functions (shown here for clarity)
// In actual implementation, these would be imported from their respective files
const { getSegmentRanges } = require('./getSegmentRanges');
const { getClockHour } = require('./getClockHour');

export const formatDetachmentHours = (segments) => {
    // Handle empty input
    if (!segments || segments.length === 0) {
        return "None";
    }

    // Handle total detachment case
    if (segments.length >= 55) {
        return "1-12 o'clock (Total)";
    }

    // Get continuous ranges of segments
    const ranges = getSegmentRanges(segments);

    // Convert each range to clock hours
    const hourRanges = ranges.map(range => {
        const startHour = getClockHour(range.start);
        const endSegment = (range.start + range.length - 1) % 60;
        const endHour = getClockHour(endSegment);
        return { startHour, endHour };
    });

    // Format the ranges into a string
    const formattedRanges = hourRanges.map(range => {
        if (range.startHour === range.endHour) {
            return `${range.startHour}`;
        }
        return `${range.startHour}-${range.endHour}`;
    });

    return formattedRanges.join('; ') + " o'clock";
}



// Run tests only if this file is executed directly
if (require.main === module) {
    function runFormatDetachmentTests() {
        const testCases = [
            {
                name: "Empty input",
                input: [],
                expected: "None"
            },
            {
                name: "Total detachment",
                input: Array.from({ length: 56 }, (_, i) => i),
                expected: "1-12 o'clock (Total)"
            },
            {
                name: "Single hour at 12",
                input: [0, 1],
                expected: "12 o'clock"
            },
            {
                name: "Simple range within hour",
                input: [5, 6, 7],
                expected: "1 o'clock"
            },
            {
                name: "Range crossing midnight",
                input: [58, 59, 0, 1],
                expected: "12 o'clock"
            },
            {
                name: "Big Range crossing midnight",
                input: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 0, 1, 2, 3, 4, 5, 6],
                expected: "10-1 o'clock"
            },
            {
                name: "Multiple separate ranges",
                input: [0, 1, 2, 25, 26, 27, 28],
                expected: "12; 5-6 o'clock"
            },
            {
                name: "Hour 6 special case",
                input: [24, 25, 26, 27, 28],
                expected: "5-6 o'clock"
            },
            {
                name: "Single segment at boundary",
                input: [5],
                expected: "1 o'clock"
            },
            {
                name: "Single segment at 12",
                input: [59],
                expected: "12 o'clock"
            }
        ];

        return testCases.map(testCase => {
            const result = formatDetachmentHours(testCase.input);
            const passed = result === testCase.expected;

            return {
                name: testCase.name,
                input: testCase.input,
                expected: testCase.expected,
                actual: result,
                passed: passed,
                detail: passed ? '' : `Got "${result}", expected "${testCase.expected}"`
            };
        });
    }

    // Run tests
    const results = runFormatDetachmentTests();
    console.log("\nFormat Detachment Hours Tests:");
    results.forEach(result => {
        console.log(`\nTest: ${result.name}`);
        console.log(`Input: [${result.input.join(', ')}]`);
        console.log(`Expected: "${result.expected}"`);
        console.log(`Actual: "${result.actual}"`);
        console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
        if (!result.passed) {
            console.log(`Detail: ${result.detail}`);
        }
    });
}