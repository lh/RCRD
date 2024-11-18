class ClockHourNotation {
    static SEGMENTS_PER_HOUR = 2;
    static TOTAL_SEGMENTS = 24;

    /**
     * Check if any segments touch a given hour
     * @param {number[]} segments - Array of segment numbers
     * @param {number} hour - Clock hour to check
     * @returns {boolean}
     */
    static segmentsTouchHour(segments, hour) {
        // Define segment ranges for each hour (2 segments per hour)
        const hourRanges = {
            1: [0, 1],      // Hour 1: 0-1
            2: [2, 3],      // Hour 2: 2-3
            3: [4, 5],      // Hour 3: 4-5
            4: [6, 7],      // Hour 4: 6-7
            5: [8, 9],      // Hour 5: 8-9
            6: [10, 11],    // Hour 6: 10-11
            7: [12, 13],    // Hour 7: 12-13
            8: [14, 15],    // Hour 8: 14-15
            9: [16, 17],    // Hour 9: 16-17
            10: [18, 19],   // Hour 10: 18-19
            11: [20, 21],   // Hour 11: 20-21
            12: [22, 23]    // Hour 12: 22-23
        };

        if (hour === 12) {
            return segments.some(s => s >= 22 || s <= 1);
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

        // Consider it total detachment if 23 or more segments are marked
        if (segments.length >= 23) {
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
        if (segments.some(s => (s >= 4 && s <= 5) || (s >= 8 && s <= 9))) {
            hours.add(3);
        }
        if (segments.some(s => (s >= 16 && s <= 17) || (s >= 20 && s <= 21))) {
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
