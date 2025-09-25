/**
 * Converts a segment number (0-23) to its corresponding clock hour (1-12)
 * @param {number} segment - The segment number (0-23)
 * @returns {number} The corresponding clock hour (1-12)
 */
export const segmentToHour = (segment) => {
    // Normalize segment to 0-23 range
    const normalizedSegment = ((segment % 24) + 24) % 24;
    
    // Handle hour 12 (segments 23 and 0)
    if (normalizedSegment === 23 || normalizedSegment === 0) {
        return 12;
    }
    
    // Regular hours (1-11): each hour has 2 segments
    // Segments 1-2 = Hour 1, Segments 3-4 = Hour 2, etc.
    return Math.floor((normalizedSegment + 1) / 2);
};

/**
 * Converts a segment ID string to its corresponding clock hour
 * @param {string} segmentId - The segment ID (e.g., 'segment50')
 * @returns {number} The corresponding clock hour (1-12)
 */
export const segmentIdToHour = (segmentId) => {
    const segment = parseInt(segmentId.replace('segment', ''), 10);
    return segmentToHour(segment);
};
