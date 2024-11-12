# clockMapping Implementation Notes

## Core Data Structures

### 1. segmentToClockHourMap
```javascript
export const segmentToClockHourMap = Array(60).fill(0).map((_, segment) => {
  // Maps each segment (0-59) to its corresponding clock hour (1-12)
});
```
- Fixed-size array of 60 elements
- Each index represents a segment number
- Each value represents the corresponding clock hour

### 2. clockHourToSegmentsMap
```javascript
export const clockHourToSegmentsMap = new Map([
  [12, [0,1,2,3,56,57,58,59]],
  [1, [4,5,6,7,8]],
  // ...
]);
```
- Map structure for reverse lookup
- Keys are clock hours (1-12)
- Values are arrays of corresponding segments

## Segment Distribution

### Hour 12 (Special Case)
- Segments: [0,1,2,3,56,57,58,59]
- Wraps around midnight
- 8 segments total (larger than other hours)

### Regular Hours
1. Hour 1: [4,5,6,7,8] (5 segments)
2. Hour 2: [9,10,11,12,13] (5 segments)
3. Hour 3: [14,15,16,17,18] (5 segments)
4. Hour 4: [19,20,21,22,23] (5 segments)
5. Hour 5: [24,25,26] (3 segments)
6. Hour 6: [27,28,29,30,31,32] (6 segments)
7. Hour 7: [33,34,35] (3 segments)
8. Hour 8: [36,37,38,39,40] (5 segments)
9. Hour 9: [41,42,43,44,45] (5 segments)
10. Hour 10: [46,47,48,49,50] (5 segments)
11. Hour 11: [51,52,53,54,55] (5 segments)

### Special Cases
1. Hour 5 and 7: 3 segments each (smaller than standard)
2. Hour 6: 6 segments (larger than standard)
3. Hour 12: 8 segments (largest, wraps around)

## Functions

### segmentToClockHour
```javascript
export const segmentToClockHour = (segment) => {
  return segmentToClockHourMap[segment];
};
```
- Direct lookup in pre-computed map
- Returns undefined for out-of-bounds segments
- O(1) time complexity

### getSegmentsForClockHour
```javascript
export const getSegmentsForClockHour = (hour) => {
  return clockHourToSegmentsMap.get(hour) || [];
};
```
- Direct lookup in Map structure
- Returns empty array for invalid hours
- O(1) time complexity

## Verified Behaviors

### Segment to Hour Mapping
1. Hour 12 segments correctly identified
2. Regular hour segments correctly mapped
3. No invalid mappings (no zeros)
4. Out-of-bounds segments return undefined

### Hour to Segments Mapping
1. All hours 1-12 present in map
2. Hour 12 segments include wraparound
3. Hour 6 has extended segment range
4. Invalid hours return empty array

### Bidirectional Consistency
1. segment→hour→segments maintains segment membership
2. hour→segments→hour maintains hour value
3. No loss of information in either direction

## Implementation Considerations

### 1. Performance
- Uses pre-computed maps for O(1) lookups
- Avoids runtime calculations
- Memory trade-off for speed

### 2. Error Handling
- Returns undefined for invalid segments
- Returns empty array for invalid hours
- No exceptions thrown

### 3. Special Cases
- Hour 12 wraparound handled explicitly
- Hour 6 extended range preserved
- Hours 5 and 7 reduced range preserved

### 4. Data Integrity
- Bidirectional mapping consistency verified
- No duplicate segments across hours
- All segments mapped to valid hours

## Usage Notes

1. Segment Validation
   - Always check segment range (0-59)
   - Handle undefined returns for invalid segments

2. Hour Validation
   - Valid hours are 1-12
   - Handle empty arrays for invalid hours

3. Performance Considerations
   - Use direct lookups when possible
   - Avoid runtime calculations
   - Cache results if needed

## Future Considerations

1. Input Validation
   - Could add explicit range checks
   - Could throw errors for invalid input
   - Could add TypeScript types

2. Performance Optimization
   - Could use bit masks for segment sets
   - Could optimize memory usage
   - Could add caching layer

3. API Improvements
   - Could add range validation methods
   - Could add segment set operations
   - Could add hour arithmetic utilities

4. Documentation
   - Could add more JSDoc comments
   - Could document medical significance
   - Could add usage examples
