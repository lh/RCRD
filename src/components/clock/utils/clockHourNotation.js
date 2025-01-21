class ClockHourNotation {
    /**
     * Check if any segments touch a given hour
     * @param {number[]} segments - Array of segment numbers
     * @param {number} hour - Clock hour to check
     * @returns {boolean}
     */
    static segmentsTouchHour(segments, hour) {
        // Define segment ranges for each hour (5 segments per hour)
        const hourRanges = {
            1: [0, 4],      // Hour 1: 0-4
            2: [5, 9],      // Hour 2: 5-9
            3: [10, 14],    // Hour 3: 10-14
            4: [15, 19],    // Hour 4: 15-19
            5: [20, 24],    // Hour 5: 20-24
            6: [25, 29],    // Hour 6: 25-29
            7: [30, 34],    // Hour 7: 30-34
            8: [35, 39],    // Hour 8: 35-39
            9: [40, 44],    // Hour 9: 40-44
            10: [45, 49],   // Hour 10: 45-49
            11: [50, 54],   // Hour 11: 50-54
            12: [55, 59]    // Hour 12: 55-59
        };

        if (hour === 12) {
            return segments.some(s => s >= 55 || s <= 4);
        }

        const [start, end] = hourRanges[hour];
        return segments.some(s => s >= start && s <= end);
    }

    /**
     * Build ranges from hours with special midnight handling
     * @param {Set<number>} hours 
     * @returns {Array<{start: number, end: number}>}
     */
    static buildRanges(hours) {
        const hourList = Array.from(hours);
        
        // First, check for midnight crossing pattern
        if (hours.has(11) || hours.has(12) || hours.has(1)) {
            const hasMidnightCrossing = 
                (hours.has(11) && hours.has(1)) || 
                (hours.has(11) && hours.has(12)) ||
                (hours.has(12) && hours.has(1));

            if (hasMidnightCrossing) {
                // Force inclusion of all midnight hours if any are present
                if (hours.has(11) || hours.has(1)) {
                    hours.add(11);
                    hours.add(12);
                    hours.add(1);
                }

                // Sort with midnight crossing logic
                hourList.sort((a, b) => {
                    // Special sorting for midnight hours
                    if ([11, 12, 1].includes(a) && [11, 12, 1].includes(b)) {
                        const order = { 11: 1, 12: 2, 1: 3 };
                        return order[a] - order[b];
                    }
                    // Put midnight crossing range first
                    if ([11, 12, 1].includes(a)) return -1;
                    if ([11, 12, 1].includes(b)) return 1;
                    return a - b;
                });
            }
        } else {
            // Simple numerical sort for non-midnight crossing ranges
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

        return ranges;
    }

    /**
     * Format clock hour notation for retinal detachment
     * @param {number[]} segments - Array of affected segments
     * @returns {string} Formatted clock hour notation
     */
    static formatDetachment(segments) {
        if (!segments || segments.length === 0) {
            return "None";
        }

        // Consider it total detachment if 55 or more segments are marked
        if (segments.length >= 55) {
            return "1-12 o'clock (Total)";
        }

        // Get all affected hours
        const hours = new Set();
        for (let hour = 1; hour <= 12; hour++) {
            if (this.segmentsTouchHour(segments, hour)) {
                hours.add(hour);
            }
        }

        // Special handling for hours 3, 6, and 9
        if (segments.some(s => (s >= 10 && s <= 14) || (s >= 20 && s <= 24))) {
            hours.add(3);
        }
        if (segments.some(s => (s >= 40 && s <= 44) || (s >= 50 && s <= 54))) {
            hours.add(9);
        }
        if (hours.has(5) || hours.has(7)) {
            hours.add(6);
        }

        // Build ranges
        const ranges = this.buildRanges(hours);

        // Format output
        return ranges
            .map(range => `${range.start}-${range.end}`)
            .join('; ') + " o'clock";
    }
}

export { ClockHourNotation };
