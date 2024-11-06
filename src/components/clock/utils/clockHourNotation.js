class ClockHourNotation {
    static SEGMENTS_PER_HOUR = 5;
    static TOTAL_SEGMENTS = 60;

    /**
     * Check if any segments touch a given hour
     * @param {number[]} segments - Array of segment numbers
     * @param {number} hour - Clock hour to check
     * @returns {boolean}
     */
    static segmentsTouchHour(segments, hour) {
        // Define segment ranges for each hour
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

        if (segments.length >= 55) {
            return "1-12 o'clock";
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

// Test cases
if (typeof describe !== 'undefined') {
    describe('ClockHourNotation', () => {
        const testCases = [
            {
                name: 'Midnight crossing with 11 and 1',
                segments: [50, 51, 52, 0, 1, 2],
                expected: '11-1 o\'clock'
            },
            {
                name: 'Midnight crossing explicit 12',
                segments: [50, 51, 52, 55, 56, 57, 0, 1, 2],
                expected: '11-1 o\'clock'
            },
            {
                name: 'Empty segments',
                segments: [],
                expected: 'None'
            },
            {
                name: 'Total detachment',
                segments: Array.from({ length: 58 }, (_, i) => i),
                expected: '1-12 o\'clock'
            },
            {
                name: 'Single hour',
                segments: [0, 1, 2, 3, 4],
                expected: '12-12 o\'clock'
            },
            {
                name: 'Midnight crossing simple',
                segments: [53, 54, 55, 56, 57, 58, 59, 0, 1, 2],
                expected: '11-1 o\'clock'
            },
            {
                name: 'Multiple ranges',
                segments: [25, 26, 27, 28, 29, 30, 40, 41, 42],
                expected: '6-6; 9-9 o\'clock'
            },
            {
                name: 'Hour 6 inclusion from 5',
                segments: [20, 21, 22, 23, 24, 25],
                expected: '5-6 o\'clock'
            },
            {
                name: 'Hour 6 inclusion from 7',
                segments: [30, 31, 32, 33, 34],
                expected: '6-7 o\'clock'
            },
            {
                name: 'Hour 3 inclusion from above',
                segments: [10, 11, 12, 13, 14],
                expected: '3-3 o\'clock'
            },
            {
                name: 'Hour 9 inclusion from above',
                segments: [40, 41, 42, 43, 44],
                expected: '9-9 o\'clock'
            },
            {
                name: 'Complex midnight crossing with multiple ranges',
                segments: [
                    ...Array.from({ length: 5 }, (_, i) => i + 50), // Hour 11
                    ...Array.from({ length: 5 }, (_, i) => i + 55), // Hour 12
                    ...Array.from({ length: 5 }, (_, i) => i),      // Hour 1
                    ...Array.from({ length: 5 }, (_, i) => i + 25), // Hour 6
                ],
                expected: '11-1; 6-6 o\'clock'
            },
            {
                name: 'Special case from screenshot',
                segments: [
                    ...Array.from({ length: 15 }, (_, i) => i + 40), // Hours 9-11
                    ...Array.from({ length: 25 }, (_, i) => i + 10)  // Hours 3-7
                ],
                expected: '9-12; 3-8 o\'clock'
            }
        ];

        testCases.forEach(({ name, segments, expected }) => {
            test(name, () => {
                expect(ClockHourNotation.formatDetachment(segments)).toBe(expected);
            });
        });
    });
}

