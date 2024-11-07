
/**
 * Interpolates between non-adjacent segments to create continuous ranges
 * @param {number[]} segments - Array of segment numbers (0-59)
 * @returns {number[]} Array of segments including interpolated values
 */
export const interpolateSegments = (segments) => {
    if (segments.length <= 1) return segments;
    
    // Create a new array and sort the input segments
    const sortedSegments = [...segments].sort((a, b) => a - b);
    const result = [];
    
    // Handle wraparound case first
    if (sortedSegments[0] === 0 && sortedSegments[sortedSegments.length - 1] >= 55) {
        // Move segments > 55 to the front of our processing queue
        while (sortedSegments.length > 0 && sortedSegments[sortedSegments.length - 1] >= 55) {
            const seg = sortedSegments.pop();
            sortedSegments.unshift(seg);
        }
    }
    
    // Process each pair of segments
    for (let i = 0; i < sortedSegments.length - 1; i++) {
        const current = sortedSegments[i];
        const next = sortedSegments[i + 1];
        result.push(current);
        
        // Calculate the gap size (handling wraparound)
        let gap = next - current;
        if (gap < 0) gap += 60; // Wraparound case
        
        // If segments are more than 1 unit but less than 7 units apart, interpolate
        if (gap > 1 && gap <= 7) {
            for (let j = 1; j < gap; j++) {
                result.push((current + j) % 60);
            }
        }
    }
    
    // Add the last segment
    result.push(sortedSegments[sortedSegments.length - 1]);
    
    return result;
};

// // Run tests only if this file is executed directly
// will need to import  files
// import { getSegmentRanges } from './getSegmentRanges.js';
// import { getClockHour } from './getClockHour.js';
// import { formatDetachmentHours } from './formatDetachmentHours.js';
//
// if (import.meta.url === import.meta.resolve('./interpolateSegments.js')) {
//     const testCases = [
//         {
//             name: 'Test 1',
//             input: [58, 1, 2, 5, 10],
//             expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 58],
//             expectedFormatted: '12-2; 12 o\'clock'
//         },
//         {
//             name: 'Test 2',
//             input: [0, 1, 2, 3, 4, 5],
//             expected: [0, 1, 2, 3, 4, 5],
//             expectedFormatted: '12-1 o\'clock'
//         },
//         {
//             name: 'Test 3',
//             input: [10, 20, 30, 40, 50],
//             expected: [10, 20, 30, 40, 50],
//             expectedFormatted: '2; 4; 6; 8; 10 o\'clock'
//         },
//         {
//             name: 'Test 4',
//             input: [55, 0, 5, 10, 15],
//             expected: [55, 56, 57, 58, 59, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
//             expectedFormatted: '11-3 o\'clock'
//         }
//     ];

//     // Run tests
//     const results = testCases.map(testCase => {
//         const interpolated = interpolateSegments(testCase.input);
//         const formatted = formatDetachmentHours(interpolated);
//         const interpolatedMatch = JSON.stringify(interpolated) === JSON.stringify(testCase.expected);
//         const formattedMatch = formatted === testCase.expectedFormatted;

//         return {
//             name: testCase.name,
//             input: testCase.input,
//             interpolatedResult: interpolated,
//             interpolatedExpected: testCase.expected,
//             interpolatedMatch,
//             formattedResult: formatted,
//             formattedExpected: testCase.expectedFormatted,
//             formattedMatch,
//             passed: interpolatedMatch && formattedMatch
//         };
//     });

//     // Print results
//     results.forEach(result => {
//         console.log(`\nTest: ${result.name}`);
//         console.log(`Input: [${result.input.join(', ')}]`);
//         console.log(`Interpolated Result: [${result.interpolatedResult.join(', ')}]`);
//         console.log(`Interpolated Expected: [${result.interpolatedExpected.join(', ')}]`);
//         console.log(`Formatted Result: ${result.formattedResult}`);
//         console.log(`Formatted Expected: ${result.formattedExpected}`);
//         console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
//     });

//     // Print overall status
//     const testsPassed = results.every(r => r.passed);
//     console.log(`\nAll tests ${testsPassed ? 'PASSED' : 'FAILED'}`);
// }