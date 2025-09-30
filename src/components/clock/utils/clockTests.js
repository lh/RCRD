// clockTests.js
// This is a standalone test utility file for manual testing
// It's not part of the main application or test suite

/* eslint-disable */

// Commented out as these functions are not exported from their modules
// import { formatDetachmentHours } from './formatDetachmentHours.js';
// import { getClockHour } from './getClockHour.js';
// import { getSegmentRanges } from './getSegmentRanges.js';

const runTests = () => {
    console.log('🧪 Running Clock Face Utility Tests...\n');
    
    const results = [];
    
    // Test 1: convertToClockHours
    console.log('Test 1: convertToClockHours');
    results.push((() => {
        const tests = [
            { input: 0, expected: 3 },
            { input: 30, expected: 2 },
            { input: 60, expected: 1 },
            { input: 90, expected: 12 },
            { input: 120, expected: 11 },
            { input: 150, expected: 10 },
            { input: 180, expected: 9 },
            { input: 210, expected: 8 },
            { input: 240, expected: 7 },
            { input: 270, expected: 6 },
            { input: 300, expected: 5 },
            { input: 330, expected: 4 },
            { input: 360, expected: 3 },
            { input: -30, expected: 4 },
            { input: 390, expected: 2 }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = convertToClockHours(test.input);
            if (result !== test.expected) {
                console.log(`  ❌ convertToClockHours(${test.input}) = ${result}, expected ${test.expected}`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All convertToClockHours tests passed');
        return passed;
    })());
    
    // Test 2: normalizeAngle
    console.log('\nTest 2: normalizeAngle');
    results.push((() => {
        const tests = [
            { input: 0, expected: 0 },
            { input: 90, expected: 90 },
            { input: 180, expected: 180 },
            { input: 270, expected: 270 },
            { input: 360, expected: 0 },
            { input: 450, expected: 90 },
            { input: -90, expected: 270 },
            { input: -180, expected: 180 },
            { input: 720, expected: 0 },
            { input: -450, expected: 270 }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = normalizeAngle(test.input);
            if (Math.abs(result - test.expected) > 0.001) {
                console.log(`  ❌ normalizeAngle(${test.input}) = ${result}, expected ${test.expected}`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All normalizeAngle tests passed');
        return passed;
    })());
    
    // Test 3: isAngleInRange
    console.log('\nTest 3: isAngleInRange');
    results.push((() => {
        const tests = [
            { angle: 45, start: 0, end: 90, expected: true },
            { angle: 0, start: 0, end: 90, expected: true },
            { angle: 90, start: 0, end: 90, expected: true },
            { angle: 91, start: 0, end: 90, expected: false },
            { angle: 45, start: 270, end: 90, expected: true },
            { angle: 315, start: 270, end: 90, expected: true },
            { angle: 180, start: 270, end: 90, expected: false },
            { angle: 0, start: 330, end: 30, expected: true },
            { angle: 15, start: 330, end: 30, expected: true },
            { angle: 345, start: 330, end: 30, expected: true },
            { angle: 45, start: 330, end: 30, expected: false }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = isAngleInRange(test.angle, test.start, test.end);
            if (result !== test.expected) {
                console.log(`  ❌ isAngleInRange(${test.angle}, ${test.start}, ${test.end}) = ${result}, expected ${test.expected}`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All isAngleInRange tests passed');
        return passed;
    })());
    
    // Test 4: getClockHourRange
    console.log('\nTest 4: getClockHourRange');
    results.push((() => {
        const tests = [
            { hour: 12, expected: { start: 75, end: 105 } },
            { hour: 1, expected: { start: 45, end: 75 } },
            { hour: 2, expected: { start: 15, end: 45 } },
            { hour: 3, expected: { start: 345, end: 15 } },
            { hour: 6, expected: { start: 255, end: 285 } },
            { hour: 9, expected: { start: 165, end: 195 } }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = getClockHourRange(test.hour);
            if (result.start !== test.expected.start || result.end !== test.expected.end) {
                console.log(`  ❌ getClockHourRange(${test.hour}) = {${result.start}, ${result.end}}, expected {${test.expected.start}, ${test.expected.end}}`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All getClockHourRange tests passed');
        return passed;
    })());
    
    // Test 5: getAngleFromPoint
    console.log('\nTest 5: getAngleFromPoint');
    results.push((() => {
        const tests = [
            { x: 100, y: 50, cx: 50, cy: 50, expected: 0 },
            { x: 50, y: 0, cx: 50, cy: 50, expected: 90 },
            { x: 0, y: 50, cx: 50, cy: 50, expected: 180 },
            { x: 50, y: 100, cx: 50, cy: 50, expected: 270 }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = getAngleFromPoint(test.x, test.y, test.cx, test.cy);
            if (Math.abs(result - test.expected) > 1) {
                console.log(`  ❌ getAngleFromPoint(${test.x}, ${test.y}, ${test.cx}, ${test.cy}) = ${result}, expected ${test.expected}`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All getAngleFromPoint tests passed');
        return passed;
    })());
    
    // Test 6: getHourFromAngle
    console.log('\nTest 6: getHourFromAngle');
    results.push((() => {
        const tests = [
            { angle: 0, expected: 3 },
            { angle: 30, expected: 2 },
            { angle: 60, expected: 1 },
            { angle: 90, expected: 12 },
            { angle: 120, expected: 11 },
            { angle: 150, expected: 10 },
            { angle: 180, expected: 9 },
            { angle: 210, expected: 8 },
            { angle: 240, expected: 7 },
            { angle: 270, expected: 6 },
            { angle: 300, expected: 5 },
            { angle: 330, expected: 4 }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = getHourFromAngle(test.angle);
            if (result !== test.expected) {
                console.log(`  ❌ getHourFromAngle(${test.angle}) = ${result}, expected ${test.expected}`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All getHourFromAngle tests passed');
        return passed;
    })());
    
    // Test 7: calculateSelectedHours
    console.log('\nTest 7: calculateSelectedHours');
    results.push((() => {
        const tests = [
            { 
                segments: [{ startAngle: 75, endAngle: 105, hour: 12 }],
                expected: [12]
            },
            { 
                segments: [
                    { startAngle: 75, endAngle: 105, hour: 12 },
                    { startAngle: 45, endAngle: 75, hour: 1 }
                ],
                expected: [12, 1]
            },
            { 
                segments: [
                    { startAngle: 345, endAngle: 15, hour: 3 },
                    { startAngle: 15, endAngle: 45, hour: 2 }
                ],
                expected: [2, 3]
            }
        ];
        
        let passed = true;
        for (const test of tests) {
            const result = calculateSelectedHours(test.segments);
            const resultStr = result.sort().join(',');
            const expectedStr = test.expected.sort().join(',');
            if (resultStr !== expectedStr) {
                console.log(`  ❌ calculateSelectedHours(...) = [${resultStr}], expected [${expectedStr}]`);
                passed = false;
            }
        }
        
        if (passed) console.log('  ✅ All calculateSelectedHours tests passed');
        return passed;
    })());
    
    // Summary
    const allPassed = results.every(r => r);
    
    console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    return allPassed;
};

// Run tests if this file is executed directly
// To run: node src/components/clock/utils/clockTests.js
if (require.main === module) {
    runTests();
}