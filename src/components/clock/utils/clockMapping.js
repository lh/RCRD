import { CLOCK } from './clockConstants.js';

/**
 * Types of hour mapping needed by different parts of the system
 */
export const MAPPING_TYPE = {
    RISK: 'risk',           // For risk calculations (single hour)
    DISPLAY: 'display',     // For display formatting (can map to multiple hours)
    SELECTION: 'selection', // For clock face interaction (single hour)
    MEDICAL: 'medical'      // Applies medical domain rules
};

/**
 * Converts an angle to its corresponding segment number
 * @param {number} angle - Angle in degrees
 * @returns {number} Segment number (0-23)
 */
export const getSegmentForAngle = (angle) => {
    // Normalize angle to 0-360 range
    const normalizedAngle = ((angle % 360) + 360) % 360;
    // Convert to segment (15° per segment)
    return Math.floor(normalizedAngle / CLOCK.DEGREES_PER_SEGMENT);
};

/**
 * Converts a segment number to its corresponding hour
 * @param {number} segment - Segment number (0-23)
 * @returns {number} Hour (1-12)
 */
const segmentToHour = (segment) => {
    // Normalize segment to 0-23 range
    const normalizedSegment = ((segment % CLOCK.SEGMENTS) + CLOCK.SEGMENTS) % CLOCK.SEGMENTS;
    
    // Special case for segments 23 and 0 (hour 12)
    if (normalizedSegment === 23 || normalizedSegment === 0) {
        return 12;
    }
    
    // For all other segments: hour = ceil(segment/2)
    const hour = Math.ceil(normalizedSegment / 2);
    return hour > 12 ? hour - 12 : hour;
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
    if (CLOCK.IMPLICATIONS.AUTOMATIC_INCLUSION.HOUR_6.some(h => updatedHours.has(h))) {
        updatedHours.add(6);
    }
    
    // Rule: Hour 3 is included if segments in hours 2-4 are present
    if (CLOCK.IMPLICATIONS.AUTOMATIC_INCLUSION.HOUR_3.some(h => updatedHours.has(h))) {
        updatedHours.add(3);
    }
    
    // Rule: Hour 9 is included if segments in hours 8-10 are present
    if (CLOCK.IMPLICATIONS.AUTOMATIC_INCLUSION.HOUR_9.some(h => updatedHours.has(h))) {
        updatedHours.add(9);
    }
    
    return updatedHours;
};

/**
 * Converts a segment number to its corresponding clock hour(s)
 * @param {number} segment - Segment number (0-23)
 * @param {string} mappingType - Type of mapping needed (from MAPPING_TYPE)
 * @returns {Object} Hour mapping information
 */
export const getHourMapping = (segment, mappingType = MAPPING_TYPE.RISK) => {
    const normalizedSegment = ((segment % CLOCK.SEGMENTS) + CLOCK.SEGMENTS) % CLOCK.SEGMENTS;
    const baseHour = segmentToHour(normalizedSegment);
    
    let hours = new Set([baseHour]);
    
    // For DISPLAY and MEDICAL types, handle special cases
    if (mappingType === MAPPING_TYPE.DISPLAY || mappingType === MAPPING_TYPE.MEDICAL) {
        // Handle midnight crossing segments
        if (normalizedSegment === 23) {
            hours = new Set([11, 12]); // Last segment maps to both 11 and 12
        } else if (normalizedSegment === 0) {
            hours = new Set([12, 1]);  // First segment maps to both 12 and 1
        }
        
        // Apply medical rules for MEDICAL type
        if (mappingType === MAPPING_TYPE.MEDICAL) {
            hours = applyMedicalRules(hours);
        }
    }
    
    return {
        hours,
        segment: normalizedSegment,
        angle: normalizedSegment * CLOCK.DEGREES_PER_SEGMENT
    };
};

/**
 * Converts a segment ID string to clock hour(s)
 * @param {string} segmentId - Segment ID (e.g., 'segment12')
 * @param {string} mappingType - Type of mapping needed
 * @returns {Object} Hour mapping information
 */
export const getHourMappingFromId = (segmentId, mappingType = MAPPING_TYPE.RISK) => {
    const segment = parseInt(segmentId.replace('segment', ''), 10);
    return getHourMapping(segment, mappingType);
};

/**
 * Converts an array of segments to their corresponding hours
 * @param {Array<number|string>} segments - Array of segments or segment IDs
 * @param {string} mappingType - Type of mapping needed
 * @returns {Set<number>} Set of unique hours
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
 * Gets segments for a given hour range
 * @param {number} startHour - Starting hour (1-12)
 * @param {number} endHour - Ending hour (1-12)
 * @returns {number[]} Array of segment numbers
 */
export const getSegmentsForHours = (startHour, endHour) => {
    // Special case for full clock
    if (startHour === 12 && endHour === 12) {
        return Array.from({ length: CLOCK.SEGMENTS }, (_, i) => i);
    }
    
    // Convert hours to segments
    const startSegment = startHour === 12 ? 23 : ((startHour - 1) * 2) + 1;
    const endSegment = endHour === 12 ? 0 : (endHour * 2);
    
    const segments = [];
    
    // Handle wraparound case (e.g., 11-1 o'clock)
    if (endSegment < startSegment) {
        // Add segments from start to end of clock
        for (let i = startSegment; i < CLOCK.SEGMENTS; i++) {
            segments.push(i);
        }
        // Add segments from start of clock to end
        for (let i = 0; i <= endSegment; i++) {
            segments.push(i);
        }
    } else {
        // Normal case
        for (let i = startSegment; i <= endSegment; i++) {
            segments.push(i);
        }
    }
    
    return segments;
};
