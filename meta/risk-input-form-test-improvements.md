# RiskInputForm Test Improvements

## Skipped Tests

### Age Validation Range Test
```javascript
test.skip('validates age is between 18 and 100', () => {
  // Test will verify age validation logic
  // Current: Allows 0-120
  // Expected: Should only allow 18-100
  // Rationale: Medical context requires adult patients
})
```

## Current vs Expected Behavior
- Current: Age input allows range 0-120
- Expected: Age input should only allow 18-100 for adult patients

## Rationale
- Medical application context requires adult patients
- Upper limit of 100 is more realistic than 120
- Need to prevent invalid age ranges in risk calculations

## Implementation Roadmap
1. Add age range validation (18-100)
2. Update error messages to be more specific
3. Update UI to reflect valid age range
4. Add validation in risk calculations
