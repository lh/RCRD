# Risk Calculation Test Improvements

## Test Data Alignment

The tests have been updated to better align with the actual clock hour segment mapping:

### Clock Hour Segments
- Hour 3: segments 10-14
- Hour 4: segments 15-19
- Hour 5: segments 20-24
- Hour 6: segments 25-29
- Hour 7: segments 30-34
- Hour 8: segments 35-39
- Hour 9: segments 40-44

### Inferior Detachment Categories

1. 6+ Hours (6_hours)
   ```javascript
   const segments = [
       10-14,  // Hour 3
       15-19,  // Hour 4
       20-24,  // Hour 5
       25-29,  // Hour 6
       30-34,  // Hour 7
       35-39,  // Hour 8
       40-44   // Hour 9
   ];
   ```

2. 3-5 Hours (3_to_5)
   ```javascript
   const segments = [
       10-14,  // Hour 3
       15-19,  // Hour 4
       20-24,  // Hour 5
       25-29   // Hour 6
   ];
   ```

3. <3 Hours (less_than_3)
   ```javascript
   const segments = [
       10-14,  // Hour 3
       15-19   // Hour 4
   ];
   ```

### Total RD Detection

The total RD detection is based on segment count (≥23 segments), while inferior detachment is based on which specific hours are affected. This means:

1. A detachment can be "total" without affecting all inferior hours
2. A detachment can affect all inferior hours without being "total"
3. When both conditions are met, both coefficients apply:
   - +0.663 for total RD
   - +0.435 for 6+ inferior hours
   - Total effect: +1.098

## Test Improvements

1. More realistic test data:
   - Using actual clock hour segments instead of sequential numbers
   - Proper coverage of inferior hours (3-9)
   - Clear documentation of which segments correspond to which hours

2. Better edge case coverage:
   - Total RD with all inferior hours
   - Total RD without all inferior hours
   - All inferior hours without total RD
   - Boundary cases for hour counts

3. Clearer test descriptions:
   - Explicit about which hours are being tested
   - Documentation of segment-to-hour mapping
   - Explanation of coefficient combinations

## Future Considerations

1. Additional test cases:
   - Invalid segment numbers
   - Duplicate segments
   - Non-sequential segments
   - Edge cases around hour boundaries

2. Test organization:
   - Group tests by clinical scenario
   - Add more descriptive test names
   - Include clinical rationale in comments

3. Documentation:
   - Add visual diagrams
   - Document coefficient interactions
   - Explain clinical significance
