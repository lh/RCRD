import { segmentToHour } from '../clockHourCalculator';
import { ClockHourNotation } from '../clockHourNotation';

describe('24-Segment to Hour Mapping', () => {
    describe('segmentToHour', () => {
        it('should map segments correctly to hours', () => {
            // Test all 24 segments
            expect(segmentToHour(0)).toBe(12);  // Hour 12
            expect(segmentToHour(1)).toBe(1);   // Hour 1
            expect(segmentToHour(2)).toBe(1);   // Hour 1
            expect(segmentToHour(3)).toBe(2);   // Hour 2
            expect(segmentToHour(4)).toBe(2);   // Hour 2
            expect(segmentToHour(5)).toBe(3);   // Hour 3
            expect(segmentToHour(6)).toBe(3);   // Hour 3
            expect(segmentToHour(7)).toBe(4);   // Hour 4
            expect(segmentToHour(8)).toBe(4);   // Hour 4
            expect(segmentToHour(9)).toBe(5);   // Hour 5
            expect(segmentToHour(10)).toBe(5);  // Hour 5
            expect(segmentToHour(11)).toBe(6);  // Hour 6
            expect(segmentToHour(12)).toBe(6);  // Hour 6
            expect(segmentToHour(13)).toBe(7);  // Hour 7
            expect(segmentToHour(14)).toBe(7);  // Hour 7
            expect(segmentToHour(15)).toBe(8);  // Hour 8
            expect(segmentToHour(16)).toBe(8);  // Hour 8
            expect(segmentToHour(17)).toBe(9);  // Hour 9
            expect(segmentToHour(18)).toBe(9);  // Hour 9
            expect(segmentToHour(19)).toBe(10); // Hour 10
            expect(segmentToHour(20)).toBe(10); // Hour 10
            expect(segmentToHour(21)).toBe(11); // Hour 11
            expect(segmentToHour(22)).toBe(11); // Hour 11
            expect(segmentToHour(23)).toBe(12); // Hour 12
        });

        it('should handle out of range segments with modulo', () => {
            expect(segmentToHour(24)).toBe(12);  // 24 % 24 = 0 -> Hour 12
            expect(segmentToHour(25)).toBe(1);   // 25 % 24 = 1 -> Hour 1
            expect(segmentToHour(-1)).toBe(12);  // -1 % 24 = 23 -> Hour 12
        });
    });

    describe('ClockHourNotation.segmentsTouchHour', () => {
        it('should correctly identify segments touching each hour', () => {
            // Hour 1: segments 1, 2
            expect(ClockHourNotation.segmentsTouchHour([1], 1)).toBe(true);
            expect(ClockHourNotation.segmentsTouchHour([2], 1)).toBe(true);
            expect(ClockHourNotation.segmentsTouchHour([0, 3], 1)).toBe(false);
            
            // Hour 3: segments 5, 6
            expect(ClockHourNotation.segmentsTouchHour([5], 3)).toBe(true);
            expect(ClockHourNotation.segmentsTouchHour([6], 3)).toBe(true);
            expect(ClockHourNotation.segmentsTouchHour([4, 7], 3)).toBe(false);
            
            // Hour 12: segments 23, 0
            expect(ClockHourNotation.segmentsTouchHour([23], 12)).toBe(true);
            expect(ClockHourNotation.segmentsTouchHour([0], 12)).toBe(true);
            expect(ClockHourNotation.segmentsTouchHour([22, 1], 12)).toBe(false);
        });

        it('should correctly identify inferior hours for test segments 1-10', () => {
            const testSegments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const inferiorHours = [3, 4, 5, 6, 7, 8, 9];
            
            // Count how many inferior hours are touched
            let inferiorCount = 0;
            for (const hour of inferiorHours) {
                if (ClockHourNotation.segmentsTouchHour(testSegments, hour)) {
                    inferiorCount++;
                }
            }
            
            // Should touch 3 inferior hours (3, 4, 5)
            expect(inferiorCount).toBe(3);
            
            // Verify specific hours
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 1)).toBe(true);  // segments 1, 2
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 2)).toBe(true);  // segments 3, 4
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 3)).toBe(true);  // segments 5, 6
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 4)).toBe(true);  // segments 7, 8
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 5)).toBe(true);  // segments 9, 10
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 6)).toBe(false); // segments 11, 12
            expect(ClockHourNotation.segmentsTouchHour(testSegments, 7)).toBe(false); // segments 13, 14
        });
    });

    describe('Integration: Risk Calculation Bug Fix', () => {
        it('should correctly count inferior hours for segments 1-10', () => {
            const segments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const inferiorHours = [3, 4, 5, 6, 7, 8, 9];
            
            // This is the core of the bug fix - counting inferior hours touched
            const inferiorCount = inferiorHours.filter(hour => 
                ClockHourNotation.segmentsTouchHour(segments, hour)
            ).length;
            
            // With correct 24-segment model, should touch 3 inferior hours (3, 4, 5)
            expect(inferiorCount).toBe(3);
        });

        it('should map each hour to exactly 2 segments', () => {
            const hourSegments = {};
            
            // Build mapping from segments
            for (let seg = 0; seg < 24; seg++) {
                const hour = segmentToHour(seg);
                if (!hourSegments[hour]) {
                    hourSegments[hour] = [];
                }
                hourSegments[hour].push(seg);
            }
            
            // Each hour should have exactly 2 segments
            for (let hour = 1; hour <= 12; hour++) {
                expect(hourSegments[hour]).toHaveLength(2);
            }
            
            // Verify specific mappings
            expect(hourSegments[1]).toEqual([1, 2]);
            expect(hourSegments[3]).toEqual([5, 6]);
            expect(hourSegments[12]).toEqual([0, 23]);
        });
    });
});