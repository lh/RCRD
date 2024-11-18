/**
 * Pure mathematical mapping of segments to clock hours.
 * No medical rules or business logic, just pure conversion.
 */

/**
 * Convert a segment number (0-23) to its corresponding clock hour (1-12)
 * using the formula: x = (segment + 24)/2, then hour = x > 12 ? x - 12 : x
 * 
 * @param {number} segment - The segment number (0-23)
 * @returns {number} The corresponding clock hour (1-12)
 */
export function segmentToHour(segment) {
    // Normalize segment to 0-23 range
    const normalizedSegment = ((segment % 24) + 24) % 24;
    
    // Calculate x = (segment + 24)/2
    const x = (normalizedSegment + 24) / 2;
    
    // Convert to hour (1-12 range)
    const hour = x > 12 ? x - 12 : x;
    
    // Round to nearest hour
    return Math.round(hour);
}

/**
 * Convert an array of segments to their corresponding clock hours
 * 
 * @param {number[]} segments - Array of segment numbers
 * @returns {number[]} Array of unique clock hours in ascending order
 */
export function segmentsToHours(segments) {
    const hours = new Set(segments.map(segmentToHour));
    return Array.from(hours).sort((a, b) => a - b);
}
