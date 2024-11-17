# Unified Clock Hour Mapping Proposal

## Current Situation

We have clock mapping logic spread across multiple files, including important medical domain rules:

1. Basic Segment to Hour (clockHourCalculator.js):
```javascript
if (segment >= 55 || segment <= 4) return 12;
return Math.floor(segment / 5) + 1;
```

2. Medical Domain Rules (clockHourNotation.js):
```javascript
// Special handling for hours 3, 6, and 9
if (segments.some(s => (s >= 10 && s <= 14) || (s >= 20 && s <= 24))) {
    hours.add(3);
}
if (hours.has(5) || hours.has(7)) {
    hours.add(6);
}
```

3. Hour Range Building (formatDetachmentHours.js):
```javascript
const hasMidnightCrossing = ranges.some(r => r.end === 12) && 
    ranges.some(r => r.start === 1);
```

## Proposed Solution

Create a unified clock utilities system that preserves medical domain rules:

```javascript
// src/components/clock/utils/clockConstants.js
export const CLOCK = {
    SEGMENTS: 60,
    HOURS: 12,
    SEGMENTS_PER_HOUR: 5,
    DEGREES_PER_SEGMENT: 6,
    DEGREES_PER_HOUR: 30,
    
    // Hour ranges for medical significance
    HOUR_RANGES: {
        INFERIOR: [3, 4, 5, 6],
        SUPERIOR: [11, 12, 1],
        TEMPORAL: [7, 8, 9],
        NASAL: [2, 3, 4]
    },
    
    // Segment ranges for each hour
    SEGMENTS: {
        1: [0, 4],
        2: [5, 9],
        3: [10, 14],
        4: [15, 19],
        5: [20, 24],
        6: [25, 29],
        7: [30, 34],
        8: [35, 39],
        9: [40, 44],
        10: [45, 49],
        11: [50, 54],
        12: [55, 59]
    }
};

// src/components/clock/utils/clockMapping.js
import { CLOCK } from './clockConstants';

export const MAPPING_TYPE = {
    RISK: 'risk',           // For risk calculations (single hour)
    DISPLAY: 'display',     // For display formatting (can map to multiple hours)
    SELECTION: 'selection', // For clock face interaction (single hour)
    MEDICAL: 'medical'      // Applies medical domain rules
};

/**
 * Applies medical domain rules to add implied hours
 * @param {Set<number>} hours - Set of detected hours
 * @returns {Set<number>} Updated hours with medical implications
 */
const applyMedicalRules = (hours) => {
    // Copy the set to avoid modifying the input
    const updatedHours = new Set(hours);
    
    // Rule: Hour 6 is included if hours 5 or 7 are present
    if (updatedHours.has(5) || updatedHours.has(7)) {
        updatedHours.add(6);
    }
    
    // Rule: Hour 3 is included for specific segment ranges
    if ([...hours].some(h => [2, 3, 4, 5].includes(h))) {
        updatedHours.add(3);
    }
    
    // Rule: Hour 9 is included for specific segment ranges
    if ([...hours].some(h => [8, 9, 10].includes(h))) {
        updatedHours.add(9);
    }
    
    return updatedHours;
};

/**
 * Converts a segment number to its corresponding clock hour(s)
 */
export const getHourMapping = (segment, mappingType = MAPPING_TYPE.RISK) => {
    const normalizedSegment = ((segment % CLOCK.SEGMENTS) + CLOCK.SEGMENTS) % CLOCK.SEGMENTS;
    const baseHour = Math.floor(normalizedSegment / CLOCK.SEGMENTS_PER_HOUR) + 1;
    
    let hours = new Set();
    
    switch (mappingType) {
        case MAPPING_TYPE.RISK:
        case MAPPING_TYPE.SELECTION:
            if (normalizedSegment >= 55 || normalizedSegment <= 4) {
                hours.add(12);
            } else {
                hours.add(baseHour);
            }
            break;
            
        case MAPPING_TYPE.DISPLAY:
        case MAPPING_TYPE.MEDICAL:
            // Add primary hour
            hours.add(baseHour);
            
            // Handle special cases
            if (normalizedSegment <= 4) {
                hours.add(12);
                hours.add(1);
            } else if (normalizedSegment >= 55) {
                hours.add(12);
                hours.add(11);
            }
            
            // Apply medical rules for MEDICAL type
            if (mappingType === MAPPING_TYPE.MEDICAL) {
                hours = applyMedicalRules(hours);
            }
            break;
    }
    
    return {
        hours,
        segment: normalizedSegment,
        angle: normalizedSegment * CLOCK.DEGREES_PER_SEGMENT
    };
};

/**
 * Converts an array of segments to their corresponding hours
 */
export const getHoursFromSegments = (segments, mappingType = MAPPING_TYPE.RISK) => {
    const hours = new Set();
    segments.forEach(seg => {
        const segment = typeof seg === 'string' ? parseInt(seg.replace('segment', ''), 10) : seg;
        const mapping = getHourMapping(segment, mappingType);
        mapping.hours.forEach(h => hours.add(h));
    });
    
    // Apply medical rules if needed
    return mappingType === MAPPING_TYPE.MEDICAL ? applyMedicalRules(hours) : hours;
};

/**
 * Formats hours into ranges with proper medical notation
 */
export const formatHourRanges = (hours) => {
    if (!hours.size) return "None";
    if (hours.size >= 11) return "1-12 o'clock (Total)";
    
    const hourList = Array.from(hours);
    
    // Handle midnight crossing
    const hasMidnightCrossing = 
        (hours.has(11) && hours.has(1)) || 
        (hours.has(11) && hours.has(12)) ||
        (hours.has(12) && hours.has(1));
        
    if (hasMidnightCrossing) {
        // Force inclusion of all midnight hours
        if (hours.has(11) || hours.has(1)) {
            hours.add(11);
            hours.add(12);
            hours.add(1);
        }
        
        // Special sorting for midnight crossing
        hourList.sort((a, b) => {
            if ([11, 12, 1].includes(a) && [11, 12, 1].includes(b)) {
                const order = { 11: 1, 12: 2, 1: 3 };
                return order[a] - order[b];
            }
            if ([11, 12, 1].includes(a)) return -1;
            if ([11, 12, 1].includes(b)) return 1;
            return a - b;
        });
    } else {
        hourList.sort((a, b) => a - b);
    }
    
    // Build ranges
    const ranges = [];
    let currentRange = { start: hourList[0], end: hourList[0] };
    
    for (let i = 1; i < hourList.length; i++) {
        const hour = hourList[i];
        const prevHour = currentRange.end;
        
        const isConsecutive = 
            hour === prevHour + 1 || 
            (prevHour === 12 && hour === 1) ||
            (prevHour === 11 && hour === 12);
            
        if (isConsecutive) {
            currentRange.end = hour;
        } else {
            ranges.push(currentRange);
            currentRange = { start: hour, end: hour };
        }
    }
    ranges.push(currentRange);
    
    return ranges
        .map(range => range.start === range.end ? 
            `${range.start}` : 
            `${range.start}-${range.end}`)
        .join('; ') + " o'clock";
};

/**
 * Gets segments for a given hour range
 */
export const getSegmentsForHours = (startHour, endHour) => {
    // ... (previous implementation) ...
};
```

## Usage Examples

1. Risk Calculation with Medical Rules:
```javascript
const getInferiorDetachment = (detachmentSegments) => {
    // Use MEDICAL mapping type to apply domain rules
    const hours = getHoursFromSegments(detachmentSegments, MAPPING_TYPE.MEDICAL);
    
    if (hours.has(6)) return "6_hours";
    if ([3, 4, 5].some(h => hours.has(h))) return "3_to_5";
    return "less_than_3";
};
```

2. Display Formatting:
```javascript
const formatDetachment = (segments) => {
    const hours = getHoursFromSegments(segments, MAPPING_TYPE.DISPLAY);
    return formatHourRanges(hours);
};
```

3. Clock Face Interaction:
```javascript
const handleSegmentClick = (segmentId) => {
    const { hours, angle } = getHourMappingFromId(segmentId, MAPPING_TYPE.SELECTION);
    // Use hours for selection and angle for visual feedback
};
```

## Benefits

1. Preserves Medical Domain Rules
   - Maintains special hour implications
   - Handles medical significance of regions
   - Preserves existing behavior

2. Clear Separation of Concerns
   - Constants define medical significance
   - Mapping types for different use cases
   - Medical rules isolated in helper function

3. Improved Maintainability
   - Medical rules in one place
   - Easy to update domain logic
   - Clear documentation of rules

## Implementation Steps

1. Create Files
```bash
touch src/components/clock/utils/clockConstants.js
touch src/components/clock/utils/clockMapping.js
touch src/components/clock/utils/__tests__/clockMapping.test.js
```

2. Add Comprehensive Tests
```javascript
describe('clockMapping medical rules', () => {
    test('includes hour 6 when hours 5 or 7 present', () => {
        const segments = [20, 21, 22]; // Hour 5
        const hours = getHoursFromSegments(segments, MAPPING_TYPE.MEDICAL);
        expect(hours).toContain(6);
    });
    
    test('handles inferior detachment correctly', () => {
        const segments = [25, 26, 27]; // Hour 6
        const hours = getHoursFromSegments(segments, MAPPING_TYPE.MEDICAL);
        expect(hours).toContain(6);
    });
});
```

3. Update Existing Code
- Replace current implementations with new utility
- Update tests to verify medical rules
- Verify all functionality works as expected

## Next Steps

1. Create unified mapping utility
2. Add comprehensive tests including medical rules
3. Update risk calculations to use MEDICAL mapping
4. Update display formatting
5. Update clock face interaction
6. Verify all functionality
