/**
 * Maps segment numbers (0-59) to clock hours (1-12)
 * @type {number[]}
 */
export const segmentToClockHourMap = Array(60).fill(0).map((_, segment) => {
  if ([0,1,2,3,56,57,58,59].includes(segment)) return 12;
  if ([4,5,6,7,8].includes(segment)) return 1;
  if ([9,10,11,12,13].includes(segment)) return 2;
  if ([14,15,16,17,18].includes(segment)) return 3;
  if ([19,20,21,22,23].includes(segment)) return 4;
  if ([24,25,26].includes(segment)) return 5;
  if ([27,28,29,30,31,32].includes(segment)) return 6;
  if ([33,34,35].includes(segment)) return 7;
  if ([36,37,38,39,40].includes(segment)) return 8;
  if ([41,42,43,44,45].includes(segment)) return 9;
  if ([46,47,48,49,50].includes(segment)) return 10;
  if ([51,52,53,54,55].includes(segment)) return 11;
  return 0; // Should never happen with 0-59 segments
});

/**
* Converts a segment number to its corresponding clock hour
* @param {number} segment - The segment number (0-59)
* @returns {number} The clock hour (1-12)
*/
export const segmentToClockHour = (segment) => {
  return segmentToClockHourMap[segment];
};

/**
* Maps clock hours to their corresponding segments
* @type {Map<number, number[]>}
*/
export const clockHourToSegmentsMap = new Map([
  [12, [0,1,2,3,56,57,58,59]],
  [1, [4,5,6,7,8]],
  [2, [9,10,11,12,13]],
  [3, [14,15,16,17,18]],
  [4, [19,20,21,22,23]],
  [5, [24,25,26]],
  [6, [27,28,29,30,31,32]],
  [7, [33,34,35]],
  [8, [36,37,38,39,40]],
  [9, [41,42,43,44,45]],
  [10, [46,47,48,49,50]],
  [11, [51,52,53,54,55]]
]);

/**
* Gets all segments corresponding to a given clock hour
* @param {number} hour - The clock hour (1-12)
* @returns {number[]} Array of segment numbers for that hour
*/
export const getSegmentsForClockHour = (hour) => {
  return clockHourToSegmentsMap.get(hour) || [];
};

// Run tests only if this file is executed directly
if (import.meta.url === import.meta.resolve('./clockMapping.js')) {
  const runClockMappingTests = () => {
      const testCases = [
          // Test segmentToClockHour
          {
              name: "Segment to hour mapping - hour 12",
              fn: () => {
                  const segments = [0, 1, 2, 3, 56, 57, 58, 59];
                  return segments.every(seg => segmentToClockHour(seg) === 12);
              }
          },
          {
              name: "Segment to hour mapping - regular hours",
              fn: () => {
                  const cases = [
                      { seg: 5, hour: 1 },
                      { seg: 10, hour: 2 },
                      { seg: 15, hour: 3 },
                      { seg: 30, hour: 6 },
                      { seg: 45, hour: 9 }
                  ];
                  return cases.every(({ seg, hour }) => segmentToClockHour(seg) === hour);
              }
          },
          // Test getSegmentsForClockHour
          {
              name: "Hour to segments mapping - hour 12",
              fn: () => {
                  const segments = getSegmentsForClockHour(12);
                  const expected = [0, 1, 2, 3, 56, 57, 58, 59];
                  return JSON.stringify(segments) === JSON.stringify(expected);
              }
          },
          {
              name: "Hour to segments mapping - hour 6",
              fn: () => {
                  const segments = getSegmentsForClockHour(6);
                  const expected = [27, 28, 29, 30, 31, 32];
                  return JSON.stringify(segments) === JSON.stringify(expected);
              }
          },
          {
              name: "Invalid hour returns empty array",
              fn: () => {
                  const segments = getSegmentsForClockHour(13);
                  return segments.length === 0;
              }
          },
          // Test consistency between maps
          {
              name: "Bidirectional mapping consistency",
              fn: () => {
                  return Array.from(clockHourToSegmentsMap.entries()).every(([hour, segments]) => {
                      return segments.every(segment => segmentToClockHour(segment) === hour);
                  });
              }
          }
      ];

      // Run tests and collect results
      const results = testCases.map(testCase => {
          const passed = testCase.fn();
          return {
              name: testCase.name,
              passed: passed
          };
      });

      // Print results
      results.forEach(result => {
          console.log(`\nTest: ${result.name}`);
          console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
      });

      // Return overall test status
      return results.every(r => r.passed);
  };

  // Run the tests
  const testsPassed = runClockMappingTests();
  console.log(`\nAll tests ${testsPassed ? 'PASSED' : 'FAILED'}`);
}