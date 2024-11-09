/**
 * Calculates the expected segments for a given hour range on the clock face
 * @param {number} startHour - Starting hour (1-12)
 * @param {number} endHour - Ending hour (1-12)
 * @returns {number[]} Array of segment numbers
 */
export const calculateSegmentsForHourRange = (startHour, end) => {
    const segments = [];
    
    // Special case for full clock (12-12)
    if (startHour === 12 && end === 12) {
        return Array.from({ length: 60 }, (_, i) => i);
    }
    
    const startSegment = ((startHour - 1) * 5) % 60;
    const endSegment = (end * 5 - 1) % 60;
    
    // Handle wraparound case (e.g., 11-1 o'clock)
    if (endSegment < startSegment) {
        // Add segments from start to 59
        for (let i = startSegment; i < 60; i++) {
            segments.push(i);
        }
        // Add segments from 0 to end
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