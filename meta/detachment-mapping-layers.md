me# Detachment Mapping Layers

## Current Understanding

There are distinct layers of functionality that need to be separated:

### 1. Segment Drawing and Collection
- User draws segments on the clock face
- Segments are collected and stored (e.g., [1, 2, 3, 4, 5])
- This layer is working correctly at present

### 2. Segment to Hour Mapping
- Pure mathematical conversion from segments to clock hours
- Simple formula: `x = (segment + 24)/2`, then `hour = x > 12 ? x - 12 : x`
- This should be a pure function with no medical rules
- Output: Array of affected clock hours (e.g., [1, 2, 3])

### 3. User Feedback (Display)
- Takes the array of clock hours
- Formats them into a human-readable range (e.g., "Detachment 1-3")
- No medical rules should be applied here
- This is purely for user interface feedback

### 4. Medical Rules and Risk Calculation
- Medical rules are part of the business logic, not pre-processing
- Takes array of clock hours and determines the most significant medical category
- Categories like "6_hours", "3_to_5" represent medical knowledge about significance
- Returns a single category for risk calculation
- Risk calculator works with these well-defined medical categories

## Rationale for Medical Rules as Business Logic

1. Domain Knowledge
   - Medical rules define meaningful categories
   - Categories represent expert knowledge about which patterns are significant
   - Rules about precedence (e.g., hour 6 being more significant) are part of the medical domain

2. Clear Responsibility
   - Medical rules function determines the most significant category
   - Risk calculator works with well-defined categories
   - No need to duplicate precedence logic in risk calculator

3. Maintainability
   - Medical knowledge is centralized in one place
   - Changes to medical rules don't affect other layers
   - Risk calculator remains simple and focused

## Proposed Implementation

```javascript
// Pure mathematical mapping
function segmentToHour(segment) {
    const x = (segment + 24) / 2;
    return x > 12 ? x - 12 : x;
}

// Format hours for display (user feedback)
function formatDetachmentRange(hours) {
    // Convert array of hours to readable range
    // e.g., [1, 2, 3] -> "Detachment 1-3"
    return `Detachment ${formatRange(hours)}`;
}

// Medical rules (business logic)
function getDetachmentCategory(hours) {
    // Apply medical knowledge to determine most significant category
    if (isTotal(hours)) return 'total_detachment';
    if (hasHour6(hours)) return '6_hours';
    if (hasHours3to5(hours)) return '3_to_5';
    return 'less_than_3';
}

// Risk calculation
function calculateRisk(detachmentCategory, otherFactors) {
    // Work with well-defined medical categories
    const coefficient = coefficients[detachmentCategory];
    // Calculate risk using the category
}
```

## Implementation Plan

1. First Layer: Segment Collection
   - Keep current segment drawing functionality
   - Ensure segments are properly collected and stored

2. Second Layer: Hour Mapping
   - Implement pure mathematical segmentToHour function
   - Unit test with various segment inputs
   - No medical rules in this layer

3. Third Layer: Display Formatting
   - Create formatDetachmentRange function
   - Focus on clear user feedback
   - Test with various hour combinations

4. Fourth Layer: Medical Rules & Risk Calculation
   - Implement getDetachmentCategory as business logic
   - Move all medical knowledge here
   - Return single most significant category
   - Keep risk calculator simple and focused on calculation

## Benefits

1. Clear Separation of Concerns
   - Mathematical mapping is pure and simple
   - Display formatting focuses on user feedback
   - Medical rules are treated as domain knowledge
   - Risk calculation works with well-defined categories

2. Maintainable Business Logic
   - Medical rules are centralized
   - Changes to medical knowledge don't affect other layers
   - Clear place to add new medical categories if needed

3. Improved Testing
   - Each layer can be tested independently
   - Medical rules can be tested with clear inputs/outputs
   - Risk calculator tests don't need to know about rule precedence

## Next Steps

1. Create the pure mathematical segmentToHour function
2. Write tests for basic hour mapping
3. Create separate display formatting function
4. Implement medical rules as business logic
5. Update risk calculator to work with categories
6. Update tests to reflect new structure

Would you like me to proceed with implementing any specific part of this plan?
