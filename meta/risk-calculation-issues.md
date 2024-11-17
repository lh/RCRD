# Risk Calculation Issues

## Critical Issue: Inconsistent Hour Mapping

### Current Behavior
When marking a detachment from 3 to 9 including 6 o'clock, the risk calculation shows:
```
Inferior detachment:
0.000
(less than 3 o'clock)
```

This is incorrect - it should be categorized as "6_hours" with a coefficient of 0.435.

### Root Cause Analysis: Multiple Hour Mapping Systems

1. clockHourCalculator.js
```javascript
// Maps segments to single hours
if (segment >= 55 || segment <= 4) {
    return 12;
}
return Math.floor(segment / 5) + 1;
```

2. formatDetachmentHours.js
```javascript
// Maps segments to multiple hours in certain ranges
if (normalizedSegment <= 4) {
    hours.add(12);
    hours.add(1);
}
if (normalizedSegment >= 55) {
    hours.add(12);
    hours.add(11);
}
// Regular hours
const hour = Math.floor(normalizedSegment / 5) + 1;
```

3. riskCalculations.js
```javascript
// Attempts direct division without handling special cases
Math.floor(seg / 5) + 1
```

This inconsistency means:
1. Display shows correct hour ranges
2. Risk calculation uses incorrect hour mapping
3. Hour 6 detection fails for inferior detachment

### Required Changes

1. Standardize Hour Mapping
Create a new utility for consistent hour mapping:
```javascript
// In clockHourMapping.js
export const getHourMappings = (segment) => {
    const normalizedSegment = ((segment % 60) + 60) % 60;
    
    // For risk calculation (single hour)
    const primaryHour = (() => {
        if (normalizedSegment >= 25 && normalizedSegment <= 29) return 6;
        if (normalizedSegment >= 55 || normalizedSegment <= 4) return 12;
        return Math.floor(normalizedSegment / 5) + 1;
    })();
    
    // For display (can map to multiple hours)
    const displayHours = new Set([primaryHour]);
    if (normalizedSegment <= 4) displayHours.add(1);
    if (normalizedSegment >= 55) displayHours.add(11);
    
    return {
        primaryHour,        // For risk calculation
        displayHours,       // For display formatting
        segment: normalizedSegment
    };
};
```

2. Update getInferiorDetachment
```javascript
const getInferiorDetachment = (detachmentSegments) => {
    const affectedHours = new Set(detachmentSegments.map(segmentId => {
        const segment = typeof segmentId === 'string' ? 
            parseInt(segmentId.replace('segment', ''), 10) : 
            segmentId;
        return getHourMappings(segment).primaryHour;
    }));

    if (affectedHours.has(6)) {
        return "6_hours";
    }

    if ([3, 4, 5].some(h => affectedHours.has(h))) {
        return "3_to_5";
    }

    return "less_than_3";
};
```

3. Update formatDetachmentHours
```javascript
export const formatDetachmentHours = (segments) => {
    if (!segments || segments.length === 0) return "None";
    if (segments.length >= 55) return "1-12 o'clock (Total)";

    const hours = new Set();
    segments.forEach(segment => {
        const { displayHours } = getHourMappings(segment);
        displayHours.forEach(h => hours.add(h));
    });
    // Rest of formatting logic remains the same
};
```

### Benefits of This Approach

1. Single Source of Truth
- One function defines all hour mappings
- Consistent behavior across system
- Easier to maintain and update

2. Clear Separation of Concerns
- Primary hour for risk calculation
- Display hours for formatting
- Normalized segment handling

3. Improved Maintainability
- Centralized hour mapping logic
- Clear documentation of special cases
- Easier to test and verify

### Testing Steps

1. Test Hour Mapping
```javascript
const mapping = getHourMappings(25);
expect(mapping.primaryHour).toBe(6);
expect(mapping.displayHours).toContain(6);
```

2. Test Inferior Detachment
```javascript
const segments = ['segment25', 'segment26', 'segment27'];
expect(getInferiorDetachment(segments)).toBe('6_hours');
```

3. Test Display Formatting
```javascript
const segments = [25, 26, 27];
expect(formatDetachmentHours(segments)).toBe('6 o\'clock');
```

### Priority: HIGH
This issue affects core risk calculation functionality and needs immediate attention.

### Next Steps
1. Create clockHourMapping.js utility
2. Update getInferiorDetachment to use new utility
3. Update formatDetachmentHours to use new utility
4. Add comprehensive tests for all hour mappings
5. Update documentation
