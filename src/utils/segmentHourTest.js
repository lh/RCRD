// Test script for segment to hour mapping
// Formula: 
// 1. x = (segment + 24) / 2
// 2. hour = x > 12 ? x - 12 : x

function segmentToHour(segment) {
    // Normalize segment to 0-23 range
    const normalizedSegment = ((segment % 24) + 24) % 24;
    
    // Step 1: Calculate x
    const x = (normalizedSegment + 24) / 2;
    
    // Step 2: Calculate hour
    let hour = x > 12 ? x - 12 : x;
    
    // Round to nearest hour
    hour = Math.ceil(hour);
    
    // Handle special case for hour 12
    return hour === 0 ? 12 : hour;
}

// Test all segments
console.log('Testing segment to hour mapping:');
console.log('--------------------------------');
for (let segment = 0; segment < 24; segment++) {
    const hour = segmentToHour(segment);
    console.log(`Segment ${segment} -> Hour ${hour}`);
}

// Test specific cases
console.log('\nTesting specific cases:');
console.log('--------------------------------');
const testCases = [
    { segment: 1, expectedHour: 1 },  // Hour 1
    { segment: 2, expectedHour: 1 },  // Hour 1
    { segment: 3, expectedHour: 2 },  // Hour 2
    { segment: 4, expectedHour: 2 },  // Hour 2
    { segment: 5, expectedHour: 3 },  // Hour 3
    { segment: 6, expectedHour: 3 },  // Hour 3
    { segment: 7, expectedHour: 4 },  // Hour 4
    { segment: 8, expectedHour: 4 },  // Hour 4
    { segment: 9, expectedHour: 5 },  // Hour 5
    { segment: 10, expectedHour: 5 }, // Hour 5
    { segment: 11, expectedHour: 6 }, // Hour 6
    { segment: 12, expectedHour: 6 }, // Hour 6
    { segment: 23, expectedHour: 12 }, // Hour 12
    { segment: 0, expectedHour: 12 }   // Hour 12
];

testCases.forEach(({ segment, expectedHour }) => {
    const actualHour = segmentToHour(segment);
    const passed = actualHour === expectedHour;
    console.log(
        `Segment ${segment.toString().padStart(2)} -> Hour ${actualHour} ` +
        `(Expected: ${expectedHour}) ${passed ? '✓' : '✗'}`
    );
});
