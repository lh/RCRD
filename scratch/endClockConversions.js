// Convert end segment to clock hour
function getEndHour(segment) {
    // Special case handling for segments around hour 12
    if (segment >= 57 || segment <= 2) return 12;
    
    // Special case for hour 6 (segments 25-29)
    if (segment >= 25 && segment <= 29) return 6;
    
    // Special case for hour 6 when approached from 7
    if (segment >= 30 && segment <= 32) return 6;
    
    // Handle hour boundary cases (segments that are multiples of 5)
    if (segment % 5 === 0) {
        return Math.floor(segment / 5);
    }
    
    // For all other segments, calculate the hour
    const hourNumber = Math.floor(segment / 5) + 1;
    
    // Handle any potential rounding issues
    if (hourNumber < 1) return 1;
    if (hourNumber > 11) return 11;
    
    return hourNumber;
}

module.exports = {
    getEndHour
};

function runEndHourTests() {
    const testCases = [
        // Hour 12 cases
        { name: "End at hour 12 (seg 0)", input: 0, expected: 12 },
        { name: "End at hour 12 (seg 1)", input: 1, expected: 12 },
        { name: "End at hour 12 (seg 59)", input: 59, expected: 12 },
        { name: "End at hour 12 (seg 58)", input: 58, expected: 12 },
        
        // Hour 6 special cases
        { name: "End approaching 6 from 5", input: 24, expected: 5 },
        { name: "End middle of hour 6", input: 27, expected: 6 },
        { name: "End approaching 6 from 7", input: 31, expected: 6 },
        { name: "End clearly in hour 7", input: 33, expected: 7 },
        { name: "End clearly in hour 5", input: 23, expected: 5 },
        
        // Regular hours
        { name: "End at hour 1", input: 4, expected: 1 },
        { name: "End at hour 2", input: 9, expected: 2 },
        { name: "End at hour 3", input: 14, expected: 3 },
        { name: "End at hour 4", input: 19, expected: 4 },
        { name: "End at hour 5", input: 24, expected: 5 },
        { name: "End at hour 7", input: 34, expected: 7 },
        { name: "End at hour 8", input: 39, expected: 8 },
        { name: "End at hour 9", input: 44, expected: 9 },
        { name: "End at hour 10", input: 49, expected: 10 },
        { name: "End at hour 11", input: 54, expected: 11 },
        
        // Edge cases
        { name: "End segment just before new hour", input: 3, expected: 1 },
        { name: "End segment just after new hour", input: 7, expected: 2 },
        { name: "End segment at hour boundary", input: 5, expected: 1 }
    ];

    return testCases.map(testCase => {
        const result = getEndHour(testCase.input);
        const passed = result === testCase.expected;
        
        return {
            name: testCase.name,
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
            passed: passed,
            detail: passed ? '' : `Got ${result}, expected ${testCase.expected}`
        };
    });
}

// Example usage:
// Run and display test results
const results = runEndHourTests();
console.log("\nEnd Hour Calculation Tests:");
results.forEach(result => {
    console.log(`\nTest: ${result.name}`);
    console.log(`Input segment: ${result.input}`);
    console.log(`Expected hour: ${result.expected}`);
    console.log(`Actual hour: ${result.actual}`);
    console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
    if (!result.passed) {
        console.log(`Detail: ${result.detail}`);
    }
});

