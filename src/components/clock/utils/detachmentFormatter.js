/**
 * Format clock hours into human-readable ranges for display.
 * No medical rules are applied here - this is purely for user feedback.
 */

/**
 * Check if two hours are consecutive, handling midnight crossing
 * @param {number} hour1 First hour (1-12)
 * @param {number} hour2 Second hour (1-12)
 * @returns {boolean} True if hours are consecutive
 */
function areConsecutive(hour1, hour2) {
    if (hour1 === 12) hour1 = 0;  // Convert 12 to 0 for easier comparison
    if (hour2 === 12) hour2 = 0;
    
    // Hours are consecutive if they differ by 1 or are 11 apart (11→0/0→11)
    const diff = Math.abs(hour1 - hour2);
    return diff === 1 || diff === 11;
}

/**
 * Convert an array of hours into a formatted range string.
 * Examples:
 * [1, 2, 3] -> "1-3"
 * [3] -> "3"
 * [11, 12, 1] -> "11-1"
 * [1, 3, 5] -> "1; 3; 5"
 * 
 * @param {number[]} hours - Array of clock hours (1-12)
 * @returns {string} Formatted range string
 */
export function formatHourRange(hours) {
    if (!hours || hours.length === 0) return "None";

    // Handle single hour case
    if (hours.length === 1) return hours[0].toString();

    // Sort hours, but handle midnight crossing specially
    const hasNearMidnight = hours.includes(11) || hours.includes(12);
    const hasAfterMidnight = hours.some(h => h >= 1 && h <= 2);
    const isMidnightCrossing = hasNearMidnight && hasAfterMidnight;

    let sortedHours;
    if (isMidnightCrossing) {
        // For midnight crossing, sort so that 11,12 come before 1,2
        sortedHours = [...hours].sort((a, b) => {
            if (a === 12) a = 0;
            if (b === 12) b = 0;
            if ((a === 11 && b <= 2) || (a <= 2 && b === 11)) return a === 11 ? -1 : 1;
            return a - b;
        });
    } else {
        // Regular numerical sort for non-midnight crossing
        sortedHours = [...hours].sort((a, b) => a - b);
    }

    // Find continuous ranges
    const ranges = [];
    let currentRange = [sortedHours[0]];

    for (let i = 1; i < sortedHours.length; i++) {
        const hour = sortedHours[i];
        const prevHour = sortedHours[i - 1];

        if (areConsecutive(prevHour, hour)) {
            currentRange.push(hour);
        } else {
            ranges.push(currentRange);
            currentRange = [hour];
        }
    }
    ranges.push(currentRange);

    // Format each range
    const formattedRanges = ranges.map(range => {
        if (range.length === 1) return range[0].toString();
        return `${range[0]}-${range[range.length - 1]}`;
    });

    return formattedRanges.join("; ");
}

/**
 * Format a detachment into a human-readable string.
 * 
 * @param {number[]} hours - Array of affected clock hours
 * @returns {string} Formatted detachment string
 */
export function formatDetachment(hours) {
    const range = formatHourRange(hours);
    if (range === "None") return range;
    return `Detachment ${range} o'clock`;
}
