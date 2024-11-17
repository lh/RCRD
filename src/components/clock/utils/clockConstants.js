/**
 * Clock face constants
 */
export const CLOCK = {
    // Total number of segments in the clock face
    SEGMENTS: 24,
    
    // Number of segments per hour
    SEGMENTS_PER_HOUR: 2,
    
    // Degrees per segment (360° / 24 segments = 15° per segment)
    DEGREES_PER_SEGMENT: 15,
    
    // Segment ranges for each hour
    HOUR_SEGMENTS: {
        1: [1, 2],     // Hour 1
        2: [3, 4],     // Hour 2
        3: [5, 6],     // Hour 3
        4: [7, 8],     // Hour 4
        5: [9, 10],    // Hour 5
        6: [11, 12],   // Hour 6
        7: [13, 14],   // Hour 7
        8: [15, 16],   // Hour 8
        9: [17, 18],   // Hour 9
        10: [19, 20],  // Hour 10
        11: [21, 22],  // Hour 11
        12: [23, 0]    // Hour 12 (wraps around)
    },
    
    // Medical implications for automatic hour inclusion
    IMPLICATIONS: {
        AUTOMATIC_INCLUSION: {
            // Hour 6 is included if hours 5 or 7 are present
            HOUR_6: [5, 7],
            
            // Hour 3 is included if hours 2 or 4 are present
            HOUR_3: [2, 4],
            
            // Hour 9 is included if hours 8 or 10 are present
            HOUR_9: [8, 10]
        }
    }
};
