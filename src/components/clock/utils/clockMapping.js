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

