/**
 * Converts a segment number (0-59) to its corresponding clock hour (1-12)
 * @param {number} segment - The segment number (0-59)
 * @returns {number} The clock hour (1-12)
 */
export const getClockHour = (segment) => {
    // Special case handling for segments around hour 12
    if (segment >= 57 || segment <= 2) return 12;
    
    // Special case for hour 6
    if (segment >= 28 && segment <= 32) return 6;
    
    // Handle hour boundary cases
    if (segment % 5 <= 2) {
        return Math.floor(segment / 5);
    }
    
    // For all other segments, calculate the hour
    const hourNumber = Math.floor(segment / 5) + 1;
    
    // Ensure the hour is within valid bounds
    return Math.min(Math.max(hourNumber, 1), 11);
};

// Run tests only if this file is executed directly
// if (import.meta.url === import.meta.resolve('./getClockHour.js')) {
//     const runClockHourTests = () => {
//         const testCases = [
//             // Special cases around hour 12
//             { segment: 57, expected: 12, name: "Hour 12 - start" },
//             { segment: 59, expected: 12, name: "Hour 12 - middle" },
//             { segment: 0, expected: 12, name: "Hour 12 - midnight" },
//             { segment: 2, expected: 12, name: "Hour 12 - end" },
            
//             // Special cases around hour 6
//             { segment: 28, expected: 6, name: "Hour 6 - start" },
//             { segment: 30, expected: 6, name: "Hour 6 - middle" },
//             { segment: 32, expected: 6, name: "Hour 6 - end" },
            
//             // Regular hours
//             { segment: 5, expected: 1, name: "Hour 1" },
//             { segment: 10, expected: 2, name: "Hour 2" },
//             { segment: 15, expected: 3, name: "Hour 3" },
//             { segment: 20, expected: 4, name: "Hour 4" },
//             { segment: 25, expected: 5, name: "Hour 5" },
//             { segment: 35, expected: 7, name: "Hour 7" },
//             { segment: 40, expected: 8, name: "Hour 8" },
//             { segment: 45, expected: 9, name: "Hour 9" },
//             { segment: 50, expected: 10, name: "Hour 10" },
//             { segment: 55, expected: 11, name: "Hour 11" },
            
//             // Boundary cases
//             { segment: 3, expected: 1, name: "Boundary - after 12" },
//             { segment: 56, expected: 11, name: "Boundary - before 12" }
//         ];

//         // Run tests and collect results
//         const results = testCases.map(testCase => {
//             const result = getClockHour(testCase.segment);
//             const passed = result === testCase.expected;

//             return {
//                 name: testCase.name,
//                 segment: testCase.segment,
//                 expected: testCase.expected,
//                 actual: result,
//                 passed: passed
//             };
//         });

//         // Print results
//         results.forEach(result => {
//             console.log(`\nTest: ${result.name}`);
//             console.log(`Segment: ${result.segment}`);
//             console.log(`Expected: ${result.expected}`);
//             console.log(`Actual: ${result.actual}`);
//             console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
//         });

//         // Return overall test status
//         return results.every(r => r.passed);
//     };

//     // Run the tests
//     const testsPassed = runClockHourTests();
//     console.log(`\nAll tests ${testsPassed ? 'PASSED' : 'FAILED'}`);
// }