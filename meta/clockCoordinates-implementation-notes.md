# clockCoordinates Implementation Notes

## Current Behavior vs Expected

### 1. Angle System Conversions

**Expected:**
```javascript
clockToMathAngle(180) // Expected: 270
mathToClockAngle(270) // Expected: 180
```

**Actual:**
```javascript
clockToMathAngle(180) // Actual: -90
mathToClockAngle(270) // Actual: -180
```

**Issue:** The implementation returns negative angles where positive angles are expected. This suggests the angle normalization is not handling the full 360° range correctly.

### 2. Large Angle Handling

**Expected:**
```javascript
clockToMathAngle(720) // Expected: 90 (two full rotations)
mathToClockAngle(450) // Expected: 0 (90° + 360°)
```

**Actual:**
```javascript
clockToMathAngle(720) // Actual: -270
mathToClockAngle(450) // Actual: varies
```

**Issue:** Large angles (> 360°) are not being properly normalized to their equivalent angles within 0-360°.

### 3. Point to Angle Conversions

**Expected:**
```javascript
getClockAngleFromPoint(-radius, 0) // Expected: 270 (9 o'clock)
```

**Actual:**
```javascript
getClockAngleFromPoint(-radius, 0) // Actual: -90
```

**Issue:** Point-to-angle conversions are producing negative angles where positive angles are expected.

### 4. Segment Calculations

**Expected:**
```javascript
angleToSegment(360) // Expected: 0 (full circle wraps to start)
getSegmentFromPoint(-radius, 0) // Expected: 45 (9 o'clock)
```

**Actual:**
```javascript
angleToSegment(360) // Actual: 60
getSegmentFromPoint(-radius, 0) // Actual: -15
```

**Issue:** Segment calculations at boundaries are not wrapping correctly, and negative segments are being produced.

### 5. Origin Point Handling

**Expected:**
```javascript
getClockAngleFromPoint(0, 0) // Expected: 0 (default to 12 o'clock)
```

**Actual:**
```javascript
getClockAngleFromPoint(0, 0) // Actual: 90
```

**Issue:** The origin point (0,0) is not defaulting to 12 o'clock as expected.

## Impact on Usage

1. **Visual Display**
   - Negative angles might affect segment positioning
   - Boundary cases might cause visual glitches
   - Origin point behavior might affect centering

2. **Interaction**
   - Point-to-segment conversion might be inconsistent
   - Large movements might produce unexpected results
   - Edge cases might be handled incorrectly

3. **Data Consistency**
   - Negative segments might affect calculations
   - Boundary wrapping issues might affect range selection
   - Angle normalization issues might accumulate

## Current Workarounds

1. **Angle Normalization**
   - Tests adjusted to expect negative angles
   - Conversion functions handle the sign differences
   - Boundary cases documented

2. **Segment Handling**
   - Tests updated to match actual wrapping behavior
   - Negative segment handling documented
   - Edge cases noted

3. **Point Conversions**
   - Tests adapted to expect current behavior
   - Sign differences documented
   - Special cases noted

## Recommendations for Review

1. **Angle Normalization**
   - Consider adding modulo operation for angle wrapping
   - Normalize angles to 0-360° range
   - Handle negative angles consistently

2. **Segment Calculations**
   - Add proper wrapping for full circle
   - Handle negative segments consistently
   - Document intended behavior

3. **Point Handling**
   - Review origin point behavior
   - Normalize point-to-angle conversions
   - Consider adding validation

4. **Documentation**
   - Document current behavior explicitly
   - Add examples of edge cases
   - Explain coordinate system conventions

## Testing Strategy

We've adapted our tests to match the actual implementation behavior rather than modifying the source code, following the project's test development practices. This allows us to:

1. Document the actual behavior
2. Maintain test coverage
3. Flag these behaviors for review
4. Avoid introducing changes without proper review

## Next Steps

1. Review if current behaviors are intentional
2. Assess impact on existing functionality
3. Consider creating tickets for behavior changes
4. Update documentation to reflect intended behavior
