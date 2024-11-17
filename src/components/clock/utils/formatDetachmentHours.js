import { CLOCK } from './clockConstants.js';

/**
 * Formats an array of segment numbers into a human-readable clock hour range string
 * @param {number[]} segments - Array of segment numbers (0-23)
 * @returns {string} Formatted clock hour range (e.g., "1-3 o'clock" or "12; 5-6 o'clock")
 */
export const formatDetachmentHours = (segments) => {
    if (!segments || segments.length === 0) {
        return "None";
    }

    // Consider it total detachment if more than 80% of segments are marked
    if (segments.length >= Math.floor(CLOCK.SEGMENTS * 0.8)) {
        return "1-12 o'clock (Total)";
    }

    // Convert segments to hours using the new 2-segments-per-hour system
    const segmentToHour = (segment) => {
        // Normalize segment to 0-23 range
        const normalizedSegment = ((segment % CLOCK.SEGMENTS) + CLOCK.SEGMENTS) % CLOCK.SEGMENTS;
        
        // Special case for segments 23 and 0 (hour 12)
        if (normalizedSegment === 23 || normalizedSegment === 0) {
            return 12;
        }
        
        // For all other segments: hour = ceil(segment/2)
        const hour = Math.ceil(normalizedSegment / CLOCK.SEGMENTS_PER_HOUR);
        return hour > 12 ? hour - 12 : hour;
    };

    // Get unique hours from segments
    const hours = new Set();
    const segmentNumbers = segments.map(segStr => {
        if (typeof segStr === 'string') {
            return parseInt(segStr.replace('segment', ''), 10);
        }
        return segStr;
    });

    segmentNumbers.forEach(segment => {
        hours.add(segmentToHour(segment));
    });

    // Convert to array and handle midnight crossing
    const hourList = Array.from(hours);

    // Check for midnight crossing
    const hasHour11 = hourList.includes(11);
    const hasHour12 = hourList.includes(12);
    const hasHour1 = hourList.includes(1);
    const hasMidnightCrossing = 
        (hasHour11 && hasHour12) || 
        (hasHour11 && hasHour1) || 
        (hasHour12 && hasHour1);

    // Sort hours based on midnight crossing
    if (hasMidnightCrossing) {
        // For midnight crossing, ensure 11→12→1 order
        hourList.sort((a, b) => {
            // Map hours to a continuous sequence: 11→12→1 becomes 11→12→13
            const normalize = h => h === 1 ? 13 : h;
            return normalize(a) - normalize(b);
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

    // Format ranges
    return ranges
        .map(range => range.start === range.end ? 
            `${range.start}` : 
            `${range.start}-${range.end}`)
        .join('; ') + " o'clock";
};
