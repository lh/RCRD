// clockTests.js
import { formatDetachmentHours } from './formatDetachmentHours.js';
import { getClockHour } from './getClockHour.js';
import { getSegmentRanges } from './getSegmentRanges.js';

const runTests = () => {
    const testCases = [
        {
            name: "12 to 3 selection",
            segments: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], // Segments for 12-3
            expectedHours: "12-3 o'clock",
            debug: true
        },
        {
            name: "11 to 2 selection",
            segments: [55,56,57,58,59,0,1,2,3,4,5,6,7,8,9],
            expectedHours: "11-2 o'clock",
            debug: true
        },
        {
            name: "Single hour at 12",
            segments: [58,59,0,1,2],
            expectedHours: "12 o'clock"
        },
        {
            name: "Wraparound 11-1",
            segments: [55,56,57,58,59,0,1,2,3,4,5],
            expectedHours: "11-1 o'clock"
        }
    ];

    console.log('Starting clock hour conversion tests...');

    const runSingleTest = (testCase) => {
        console.log(`\n=== ${testCase.name} ===`);
        
        if (testCase.debug) {
            // Debug segment to hour conversion
            console.log('Input segments:', testCase.segments.join(', '));
            
            // Debug ranges
            const ranges = getSegmentRanges(testCase.segments);
            console.log('Segment ranges:', JSON.stringify(ranges, null, 2));
            
            // Debug hour conversion for each segment
            console.log('\nHour conversion for each segment:');
            const hourConversions = testCase.segments.map(seg => ({
                segment: seg,
                hour: getClockHour(seg)
            }));
            console.table(hourConversions);
        }

        const result = formatDetachmentHours(testCase.segments);
        const passed = result === testCase.expectedHours;
        
        console.log(`\nResult:   ${result}`);
        console.log(`Expected: ${testCase.expectedHours}`);
        console.log(`Status:   ${passed ? '✅ PASSED' : '❌ FAILED'}`);
        
        return passed;
    };

    // Run all tests
    const results = testCases.map(runSingleTest);
    const allPassed = results.every(r => r);
    
    console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    return allPassed;
};

// Run tests if this file is executed directly
if (import.meta.url === import.meta.resolve('./clockTests.js')) {
    runTests();
}