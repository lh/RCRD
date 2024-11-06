// Core function for detecting if segments are adjacent
function areSegmentsAdjacent(seg1, seg2) {
    // Normal adjacency
    if (Math.abs(seg1 - seg2) === 1) return true;
    
    // Wraparound adjacency
    if (seg1 === 59 && seg2 === 0) return true;
    if (seg1 === 0 && seg2 === 59) return true;
    
    return false;
}

// Main range detection function
function getSegmentRanges(segments) {
    if (segments.length === 0) return [];
    
    // Start with single-segment ranges
    let numbers = [...segments];
    let ranges = [{ start: numbers[0], length: 1 }];
    numbers.splice(0, 1);
    
    // Keep trying to grow ranges until we can't
    let madeChange;
    do {
        madeChange = false;
        
        // For each range
        for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
            const range = ranges[rangeIndex];
            const rangeStart = range.start;
            const rangeEnd = (range.start + range.length - 1) % 60;
            
            // Look at all remaining numbers
            for (let numIndex = numbers.length - 1; numIndex >= 0; numIndex--) {
                const num = numbers[numIndex];
                
                // If number can extend range at either end
                if (areSegmentsAdjacent(rangeStart - 1, num) || 
                    areSegmentsAdjacent(rangeEnd, num)) {
                    // Add to range
                    range.length++;
                    // Remove from numbers
                    numbers.splice(numIndex, 1);
                    madeChange = true;
                }
            }
        }
    } while (madeChange && numbers.length > 0);
    
    // If any numbers left, recursively process them
    if (numbers.length > 0) {
        const remainingRanges = getSegmentRanges(numbers);
        ranges = ranges.concat(remainingRanges);
    }
    
    return ranges;
}

// Test suite
function runSegmentRangeTests() {
    const testCases = [
        {
            name: "Multiple wraparounds",
            input: [58, 59, 0, 1, 30, 31, 45, 46],
            expected: [
                { start: 58, length: 4 },
                { start: 30, length: 2 },
                { start: 45, length: 2 }
            ]
        },
        {
            name: "Single wraparound",
            input: [58, 59, 0, 1],
            expected: [
                { start: 58, length: 4 }
            ]
        },
        {
            name: "Two separate ranges with one wrapping",
            input: [58, 59, 0, 1, 30, 31, 32],
            expected: [
                { start: 58, length: 4 },
                { start: 30, length: 3 }
            ]
        },
        {
            name: "Regular continuous range",
            input: [5, 6, 7, 8],
            expected: [
                { start: 5, length: 4 }
            ]
        },
        {
            name: "Empty input",
            input: [],
            expected: []
        },
        {
            name: "Single segment",
            input: [5],
            expected: [
                { start: 5, length: 1 }
            ]
        }
    ];

    // Run tests and collect results
    const results = testCases.map(testCase => {
        const result = getSegmentRanges(testCase.input);
        const resultStr = JSON.stringify(result);
        const expectedStr = JSON.stringify(testCase.expected);
        const passed = resultStr === expectedStr;
        
        return {
            name: testCase.name,
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
            passed: passed
        };
    });

    // Return results rather than logging them
    return results;
}
module.exports = {
    getSegmentRanges,
    areSegmentsAdjacent
};


// Example of how to verify test results:
// const results = runSegmentRangeTests();
// results.forEach(result => {
//     console.log(`\nTest: ${result.name}`);
//     console.log(`Input: [${result.input.join(', ')}]`);
//     console.log('Expected:', JSON.stringify(result.expected));
//     console.log('Actual:', JSON.stringify(result.actual));
//     console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
// });

