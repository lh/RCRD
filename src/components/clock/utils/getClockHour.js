// Convert segment to clock hour
function getClockHour(segment) {
    // Special case handling for segments around hour 12
    if (segment >= 57 || segment <= 2) return 12;
    
    // Special case for hour 6
    if (segment >= 28 && segment <= 32) return 6;
    
    // Handle hour boundary cases
    if (segment % 5 <= 2) {
        return Math.floor(segment / 5);
    }
    
    // For all other segments, calculate the hour
    const hourNumber = Math.floor(segment / 5) + 1;
    
    // Ensure the hour is within valid bounds
    return Math.min(Math.max(hourNumber, 1), 11);
}

module.exports = {
    getClockHour
};
