# Plan for Reducing Clock Segments from 60 to 24

## Overview
Convert the clock face from 60 segments (5 per hour) to 24 segments (2 per hour) to simplify hour mapping and improve usability.

## 1. Core Constants and Utilities

### clockConstants.js Changes
- Update SEGMENTS to 24
- Update SEGMENTS_PER_HOUR to 2
- Update DEGREES_PER_SEGMENT to 15 (360/24)
- Update segment ranges for each hour:
  ```javascript
  SEGMENTS: {
    1: [1, 2],     // Hour 1
    2: [3, 4],     // Hour 2
    ...
    11: [21, 22],  // Hour 11
    12: [23, 0]    // Hour 12 (wraps around)
  }
  ```

### clockMapping.js Changes
- Update getSegmentForAngle to use 15° segments
- Update getHourMapping for 2-segment mapping
- Update getHoursFromSegments for new ranges
- Update getSegmentsForHours for new mapping

### formatDetachmentHours.js Changes
- Update segmentToHour mapping:
  ```javascript
  segmentToHour = (segment) => {
    const normalized = ((segment % 24) + 24) % 24;
    if (normalized === 0) return 12;
    return Math.ceil((normalized + 1) / 2);
  }
  ```
- Update total detachment threshold to ~20 segments

## 2. Component Updates

### ClockFace.jsx Changes
- Update segment array length to 24
- Update segment angle calculations (15° per segment)
- Update segment path drawing for wider segments
- Update getSegmentFromPoint calculations
- Update getSegmentsBetween for 24-segment range

### Segment.jsx Changes
- Update width/size for wider segments
- Update hover/interaction areas

### Controls.jsx Changes
- No changes needed (works with hours, not segments)

## 3. Test Updates

### ClockFace Tests
- Update segment count expectations
- Update angle calculations in tests
- Update segment selection tests
- Update drawing tests for new segment sizes
- Update touch interaction tests

### clockMapping Tests
- Update segment-to-hour mapping tests
- Update hour range tests
- Update midnight crossing tests
- Update total detachment tests

### formatDetachmentHours Tests
- Update segment input ranges
- Update hour range expectations
- Update edge case tests

### Other Tests
- Update any hardcoded segment numbers
- Update any angle calculations
- Update any segment range expectations

## 4. Risk Calculation Impact

### riskCalculations.js Changes
- Update getInferiorDetachment for new segment ranges
- Update isTotalRD threshold
- Verify coefficient application still correct

### Risk Calculation Tests
- Update segment inputs in tests
- Verify hour detection still correct
- Verify coefficient application

## 5. Implementation Order

1. Create new branch for segment reduction
2. Update clockConstants.js first (foundation)
3. Update core utilities (mapping, formatting)
4. Update ClockFace component
5. Update tests in parallel with each change
6. Verify risk calculations still correct
7. Manual testing of all interactions

## 6. Testing Strategy

1. Unit Tests
   - Update all test files with new segment counts
   - Add tests for new segment-to-hour mapping
   - Verify hour range detection
   - Test edge cases (midnight crossing, etc.)

2. Integration Tests
   - Test drawing functionality
   - Test hour detection
   - Test risk calculation
   - Test range formatting

3. Manual Testing
   - Verify drawing feels natural
   - Check hour detection accuracy
   - Verify risk calculations
   - Test touch interactions

## 7. Potential Issues to Watch

1. Drawing Experience
   - Wider segments might feel different
   - May need to adjust touch/click detection

2. Hour Detection
   - Verify midnight crossing still works
   - Check hour 6 detection for risk calc
   - Verify automatic hour inclusion rules

3. Performance
   - Should improve with fewer segments
   - Monitor any rendering issues

4. Edge Cases
   - Verify total detachment detection
   - Check boundary segments (0, 23)
   - Test hour range formatting

## 8. Rollback Plan

1. Keep old implementation in separate files
2. Create feature flag for new segment system
3. Be ready to revert if issues found
4. Document all changes for easy rollback

## 9. Success Criteria

1. All tests pass with new segment count
2. Drawing experience feels natural
3. Hour detection works correctly
4. Risk calculation remains accurate
5. Performance is same or better
6. No regression in existing functionality

## 10. Documentation Updates

1. Update implementation notes
2. Document new segment mapping
3. Update test documentation
4. Add migration notes if needed
5. Update any diagrams/illustrations
