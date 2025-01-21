# Total RD Test Improvements

## Test Data Alignment

The tests have been updated to use correct segment ranges that match the actual clock hour mapping:

### Clock Hour Segments
- Hour 3: segments 10-14
- Hour 4: segments 15-19
- Hour 5: segments 20-24
- Hour 6: segments 25-29
- Hour 7: segments 30-34
- Hour 8: segments 35-39
- Hour 9: segments 40-44

### Test Cases

1. Total RD Detection:
   - Original: Used sequential segments 0-23
   - Fixed: Uses actual clock hour segments that correspond to real clock positions
   - Maintains total RD detection logic (≥23 segments)

2. Inferior Hours Detection:
   - Original: Used incorrect segments 4-17 (2 per hour)
   - Fixed: Uses correct segments 10-44 (5 per hour)
   - Properly tests all inferior hours (3-9)

3. Risk Calculation:
   - Tests both total RD and inferior detachment conditions
   - Verifies correct coefficient application
   - Checks interaction between different risk factors

## Implementation Details

1. Segment Structure:
   - Each clock hour has 5 segments
   - Segments are numbered consecutively within each hour
   - Total of 35 segments for inferior hours (3-9)

2. Risk Coefficients:
   - Total RD: +0.663 when ≥23 segments
   - Inferior 6+ hours: +0.435
   - Both can apply simultaneously

## Testing Strategy

1. Component Tests:
   - Test total RD detection independently
   - Test inferior hour detection independently
   - Test combined conditions

2. Edge Cases:
   - Boundary conditions for total RD
   - Partial inferior detachment
   - Missing segments

3. Risk Calculation:
   - Verify coefficient values
   - Check category assignments
   - Test multiple factor interactions

## Future Improvements

1. Additional Test Cases:
   - Test non-consecutive segments
   - Test boundary conditions
   - Test invalid segment numbers

2. Test Organization:
   - Group by clinical scenario
   - Add more descriptive names
   - Include clinical rationale

3. Documentation:
   - Add visual diagrams
   - Document segment mapping
   - Explain clinical significance
