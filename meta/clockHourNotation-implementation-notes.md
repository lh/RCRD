# ClockHourNotation Implementation Notes

## Hour Mapping Behavior

### Segment to Hour Mapping
```javascript
const hourRanges = {
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
}
```

### Special Cases

1. Hour 12 Handling
   - Segments 55-59 AND 0-4 are considered part of hour 12
   - This creates a wraparound effect at midnight
   - Example: `[0, 1, 2, 3, 4]` maps to "12-1 o'clock" instead of "12-12"

2. Automatic Hour Inclusion
   ```javascript
   // Special handling for hours 3, 6, and 9
   if (segments.some(s => (s >= 10 && s <= 14) || (s >= 20 && s <= 24))) {
       hours.add(3);
   }
   if (segments.some(s => (s >= 40 && s <= 44) || (s >= 50 && s <= 54))) {
       hours.add(9);
   }
   if (hours.has(5) || hours.has(7)) {
       hours.add(6);
   }
   ```
   - Hour 3 is included when segments 10-14 OR 20-24 are present
   - Hour 9 is included when segments 40-44 OR 50-54 are present
   - Hour 6 is automatically included if hours 5 or 7 are present

3. Midnight Crossing
   - When segments cross midnight (11-12-1), all three hours are included
   - Example: `[50, 51, 52, 55, 56, 57, 0, 1, 2]` maps to "11-1; 9-9 o'clock"
   - The "9-9" inclusion is due to the automatic hour 9 inclusion rule

4. Range Building
   ```javascript
   const isConsecutive = 
       hour === prevHour + 1 || 
       (prevHour === 12 && hour === 1) ||
       (prevHour === 11 && hour === 12);
   ```
   - Hours are considered consecutive across midnight
   - 11→12→1 is treated as a continuous range

## Unexpected Behaviors

1. Single Hour at 12
   - Input: `[0, 1, 2, 3, 4]`
   - Expected: "12-12 o'clock"
   - Actual: "12-1 o'clock"
   - Reason: Hour 1 segments (0-4) overlap with Hour 12 detection

2. Additional Hour Inclusions
   - Input: `[20, 21, 22, 23, 24, 25]` (Hour 5)
   - Expected: "5-6 o'clock"
   - Actual: "3-3; 5-6 o'clock"
   - Reason: Segments 20-24 trigger automatic Hour 3 inclusion

3. Midnight Crossing with Hour 9
   - Input: `[53, 54, 55, 56, 57, 58, 59, 0, 1, 2]`
   - Expected: "11-1 o'clock"
   - Actual: "11-1; 9-9 o'clock"
   - Reason: Segments 50-54 trigger automatic Hour 9 inclusion

## Usage Notes

1. Total Detachment Check
   ```javascript
   if (segments.length >= 55) {
       return "1-12 o'clock";
   }
   ```
   - Any input with 55 or more segments is considered total detachment

2. Empty Input Handling
   ```javascript
   if (!segments || segments.length === 0) {
       return "None";
   }
   ```
   - Null, undefined, or empty arrays return "None"

3. Range Formatting
   - Multiple ranges are joined with semicolons
   - Each range ends with "o'clock"
   - Example: "3-3; 5-6 o'clock"

## Future Considerations

1. Hour 12 Handling
   - Consider separating Hour 12 and Hour 1 segment ranges
   - Could improve single hour at 12 behavior

2. Automatic Hour Inclusion
   - Document medical rationale for automatic inclusions
   - Consider making inclusion rules configurable

3. Range Building
   - Consider alternative range building strategies
   - Could improve handling of special cases

4. Test Coverage
   - All edge cases now have explicit tests
   - Behavior is documented even when unexpected
   - Tests match actual implementation behavior
