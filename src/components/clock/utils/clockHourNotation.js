class ClockHourNotation {
    /**
     * Check if any segments touch a given hour
     * @param {number[]} segments - Array of segment numbers (0-23)
     * @param {number} hour - Clock hour to check (1-12)
     * @returns {boolean}
     */
    static segmentsTouchHour(segments, hour) {
        // Define segment ranges for each hour (2 segments per hour in 24-segment system)
        const hourRanges = {
            1: [1, 2],      // Hour 1: segments 1-2
            2: [3, 4],      // Hour 2: segments 3-4
            3: [5, 6],      // Hour 3: segments 5-6
            4: [7, 8],      // Hour 4: segments 7-8
            5: [9, 10],     // Hour 5: segments 9-10
            6: [11, 12],    // Hour 6: segments 11-12
            7: [13, 14],    // Hour 7: segments 13-14
            8: [15, 16],    // Hour 8: segments 15-16
            9: [17, 18],    // Hour 9: segments 17-18
            10: [19, 20],   // Hour 10: segments 19-20
            11: [21, 22],   // Hour 11: segments 21-22
            12: [23, 0]     // Hour 12: segments 23 and 0
        };

        if (hour === 12) {
            // Hour 12 includes segments 23 and 0
            return segments.some(s => s === 23 || s === 0);
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
     * @param {number[]} segments - Array of affected segments (0-23)
     * @returns {string} Formatted clock hour notation
     */
    static formatDetachment(segments) {
        if (!segments || segments.length === 0) {
            return "None";
        }

        // Consider it total detachment if 22 or more segments are marked (out of 24)
        if (segments.length >= 22) {
            return "1-12 o'clock (Total)";
        }

        // Get all affected hours
        const hours = new Set();
        for (let hour = 1; hour <= 12; hour++) {
            if (this.segmentsTouchHour(segments, hour)) {
                hours.add(hour);
            }
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
