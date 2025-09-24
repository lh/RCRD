#!/usr/bin/env node

/**
 * Visual verification of segment-to-hour mapping
 * This script shows exactly how the 24-segment system maps to clock hours
 * based on the actual code in the codebase
 */

// Import the actual constants from the codebase
const CLOCK = {
  SEGMENTS: 24,
  SEGMENTS_PER_HOUR: 2,
  HOUR_SEGMENTS: {
    1: [1, 2],     // Hour 1
    2: [3, 4],     // Hour 2
    3: [5, 6],     // Hour 3
    4: [7, 8],     // Hour 4
    5: [9, 10],    // Hour 5
    6: [11, 12],   // Hour 6
    7: [13, 14],   // Hour 7
    8: [15, 16],   // Hour 8
    9: [17, 18],   // Hour 9
    10: [19, 20],  // Hour 10
    11: [21, 22],  // Hour 11
    12: [23, 0]    // Hour 12 (wraps around)
  }
};

// Function from segmentHourMapping.js
function segmentToHour(segment) {
  const normalizedSegment = ((segment % 24) + 24) % 24;
  const x = (normalizedSegment + 24) / 2;
  const hour = x > 12 ? x - 12 : x;
  return Math.round(hour);
}

// Visual display
console.log('================================================================================');
console.log('                    24-SEGMENT TO HOUR MAPPING VERIFICATION                     ');
console.log('================================================================================\n');

console.log('CURRENT SYSTEM (24 segments, 2 per hour):');
console.log('------------------------------------------');

// Show the mapping for each segment
console.log('\nSegment → Hour Mapping:');
console.log('----------------------');
for (let seg = 0; seg < 24; seg++) {
  const hour = segmentToHour(seg);
  const angle = (seg * 15); // 360/24 = 15 degrees per segment
  console.log(`  Segment ${seg.toString().padStart(2)}: Hour ${hour.toString().padStart(2)} (${angle.toString().padStart(3)}°)`);
}

// Show hour groupings
console.log('\n\nHour → Segments Mapping:');
console.log('------------------------');
for (let hour = 1; hour <= 12; hour++) {
  const segments = CLOCK.HOUR_SEGMENTS[hour];
  console.log(`  Hour ${hour.toString().padStart(2)}: Segments [${segments.join(', ')}]`);
}

// Show visual clock face
console.log('\n\nVisual Clock Face (24 segments):');
console.log('---------------------------------');
console.log('');
console.log('                    12');
console.log('                [23] [0]');
console.log('            [22]       [1]');
console.log('        11 [21]         [2] 1');
console.log('       [20]               [3]');
console.log('   10 [19]                 [4] 2');
console.log('     [18]                   [5]');
console.log('  9 [17]                     [6] 3');
console.log('     [16]                   [7]');
console.log('    8 [15]                 [8] 4');
console.log('       [14]               [9]');
console.log('        7 [13]         [10] 5');
console.log('            [12]       [11]');
console.log('                [11] [12]');
console.log('                    6');
console.log('');

// Test inferior hours detection (hours 3-9)
console.log('\n\nInferior Hours Detection (3-9):');
console.log('--------------------------------');
const inferiorHours = [3, 4, 5, 6, 7, 8, 9];
console.log('Inferior hours:', inferiorHours.join(', '));
console.log('Segments in inferior region:');

const inferiorSegments = [];
for (const hour of inferiorHours) {
  const segs = CLOCK.HOUR_SEGMENTS[hour];
  inferiorSegments.push(...segs);
  console.log(`  Hour ${hour}: segments [${segs.join(', ')}]`);
}
console.log(`Total inferior segments: [${inferiorSegments.sort((a,b) => a-b).join(', ')}]`);

// Compare with incorrect 60-segment mapping
console.log('\n\n================================================================================');
console.log('                      COMPARISON WITH INCORRECT 60-SEGMENT MODEL                ');
console.log('================================================================================\n');

console.log('INCORRECT clockHourNotation.js mapping (60 segments, 5 per hour):');
console.log('------------------------------------------------------------------');
const incorrect60SegmentRanges = {
  1: [0, 4],      // Hour 1: 0-4
  2: [5, 9],      // Hour 2: 5-9
  3: [10, 14],    // Hour 3: 10-14
  4: [15, 19],    // Hour 4: 15-19
  5: [20, 24],    // Hour 5: 20-24
  6: [25, 29],    // Hour 6: 25-29
  7: [30, 34],    // Hour 7: 30-34
  8: [35, 39],    // Hour 8: 35-39
  9: [40, 44],    // Hour 9: 40-44
  10: [45, 49],   // Hour 10: 45-49
  11: [50, 54],   // Hour 11: 50-54
  12: [55, 59]    // Hour 12: 55-59
};

console.log('\nIncorrect Hour → Segments Mapping:');
for (let hour = 1; hour <= 12; hour++) {
  const range = incorrect60SegmentRanges[hour];
  console.log(`  Hour ${hour.toString().padStart(2)}: Segments ${range[0]}-${range[1]}`);
}

// Show the problem with segments 1-10
console.log('\n\nTHE BUG: When segments [1,2,3,4,5,6,7,8,9,10] are selected:');
console.log('-------------------------------------------------------------');
console.log('\nCORRECT 24-segment interpretation:');
const testSegments = [1,2,3,4,5,6,7,8,9,10];
const hours24 = new Set();
for (const seg of testSegments) {
  hours24.add(segmentToHour(seg));
}
console.log(`  Segments [${testSegments.join(',')}] → Hours [${Array.from(hours24).sort((a,b) => a-b).join(', ')}]`);

// Count inferior hours
const inferiorIn24 = Array.from(hours24).filter(h => h >= 3 && h <= 9);
console.log(`  Inferior hours touched: [${inferiorIn24.join(', ')}] (${inferiorIn24.length} hours)`);

console.log('\nINCORRECT 60-segment interpretation (current bug):');
console.log('  Segments [1,2,3,4,5,6,7,8,9,10] in 60-segment model:');
console.log('  - Segments 0-4 = Hour 1');
console.log('  - Segments 5-9 = Hour 2'); 
console.log('  - Segments 10-14 = Hour 3');
console.log('  So segments 1-10 only touch hours 1, 2, and start of 3');
console.log('  Inferior hours touched: [3] (only 1 hour) ❌ WRONG!');

console.log('\n================================================================================');
console.log('                                   SUMMARY                                      ');
console.log('================================================================================');
console.log('\n✅ The UI correctly uses 24 segments (2 per hour)');
console.log('❌ clockHourNotation.js incorrectly uses 60-segment hour ranges');
console.log('🔧 Fix: Update clockHourNotation.js to use the 24-segment mapping shown above');
console.log('\n');