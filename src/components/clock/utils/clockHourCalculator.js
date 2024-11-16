/**
 * Converts a segment number (0-59) to its corresponding clock hour (1-12)
 * @param {number} segment - The segment number (0-59)
 * @returns {number} The corresponding clock hour (1-12)
 */
export const segmentToHour = (segment) => {
    // Handle hour 12 (segments 55-59 and 0-4)
    if (segment >= 55 || segment <= 4) {
        return 12;
    }
    
    // Regular hours (1-11)
    return Math.floor(segment / 5) + 1;
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
