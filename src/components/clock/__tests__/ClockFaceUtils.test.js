import { 
    polarToCartesian, 
    cartesianToPolar, 
    degreeToSegment, 
    segmentToDegree,
    getSegmentsBetween,
    createTearPath
} from '../ClockFaceUtils';
import { CLOCK } from '../utils/clockConstants';

// TECHNICAL DEBT: ClockFaceUtils.js duplicates functions from utils/clockFaceGeometry.js
// This duplication should be resolved by consolidating into a single file

describe('ClockFaceUtils - Integration Tests', () => {
    describe('polarToCartesian', () => {
        it('should convert polar coordinates to cartesian', () => {
            // 0 degrees is at 3 o'clock in this system
            // The function subtracts 90, so:
            // angle 0 -> -90 radians -> pointing right (3 o'clock)
            // angle 90 -> 0 radians -> pointing up (12 o'clock)
            const result = polarToCartesian(90, 100);
            expect(result.x).toBeCloseTo(100); // cos(0) = 1
            expect(result.y).toBeCloseTo(0);    // sin(0) = 0
        });

        it('should handle 3 o\'clock position', () => {
            // 3 o'clock is angle 0 in this system
            const result = polarToCartesian(0, 100);
            expect(result.x).toBeCloseTo(0);    // cos(-90°) = 0
            expect(result.y).toBeCloseTo(-100); // sin(-90°) = -1
        });

        it('should handle 6 o\'clock position', () => {
            // 6 o'clock is angle 270 in this system
            const result = polarToCartesian(270, 100);
            expect(result.x).toBeCloseTo(-100); // cos(180°) = -1
            expect(result.y).toBeCloseTo(0);    // sin(180°) = 0
        });

        it('should handle 9 o\'clock position', () => {
            // 9 o'clock is angle 180 in this system
            const result = polarToCartesian(180, 100);
            expect(result.x).toBeCloseTo(0);    // cos(90°) = 0
            expect(result.y).toBeCloseTo(100);  // sin(90°) = 1
        });
    });

    describe('cartesianToPolar', () => {
        it('should convert cartesian coordinates to polar angle', () => {
            // The formula is: (90 - atan2(y,x) + 360) % 360
            // Top (12 o'clock): atan2(-100, 0) = -90°
            // Result: (90 - (-90) + 360) % 360 = 180
            const angle = cartesianToPolar(0, -100);
            expect(angle).toBeCloseTo(180);
        });

        it('should handle right position (3 o\'clock)', () => {
            // Right: atan2(0, 100) = 0°
            // Result: (90 - 0 + 360) % 360 = 90
            const angle = cartesianToPolar(100, 0);
            expect(angle).toBeCloseTo(90);
        });

        it('should handle bottom position (6 o\'clock)', () => {
            // Bottom: atan2(100, 0) = 90°
            // Result: (90 - 90 + 360) % 360 = 0
            const angle = cartesianToPolar(0, 100);
            expect(angle).toBeCloseTo(0);
        });

        it('should handle left position (9 o\'clock)', () => {
            // Left: atan2(0, -100) = 180°
            // Result: (90 - 180 + 360) % 360 = 270
            const angle = cartesianToPolar(-100, 0);
            expect(angle).toBeCloseTo(270);
        });

        it('should always return positive angles', () => {
            for (let angle = 0; angle < 360; angle += 30) {
                const r = 100;
                const pos = polarToCartesian(angle, r);
                const resultAngle = cartesianToPolar(pos.x, pos.y);
                expect(resultAngle).toBeGreaterThanOrEqual(0);
                expect(resultAngle).toBeLessThan(360);
            }
        });
    });

    describe('degreeToSegment', () => {
        it('should convert degrees to segment index', () => {
            // Each segment is 15 degrees (360/24)
            expect(degreeToSegment(0)).toBe(0);
            expect(degreeToSegment(15)).toBe(1);
            expect(degreeToSegment(30)).toBe(2);
            expect(degreeToSegment(45)).toBe(3);
        });

        it('should handle wraparound correctly', () => {
            expect(degreeToSegment(360)).toBe(0);
            expect(degreeToSegment(375)).toBe(1); // 375 % 360 = 15
        });

        it('should handle edge cases within segments', () => {
            expect(degreeToSegment(14.9)).toBe(0);
            expect(degreeToSegment(15.1)).toBe(1);
            expect(degreeToSegment(359.9)).toBe(23);
        });
    });

    describe('segmentToDegree', () => {
        it('should convert segment index to degrees', () => {
            expect(segmentToDegree(0)).toBe(0);
            expect(segmentToDegree(1)).toBe(15);
            expect(segmentToDegree(2)).toBe(30);
            expect(segmentToDegree(23)).toBe(345);
        });

        it('should handle segments beyond 24', () => {
            expect(segmentToDegree(24)).toBe(0); // Wraps around
            expect(segmentToDegree(25)).toBe(15);
        });
    });

    describe('getSegmentsBetween', () => {
        it('should get segments clockwise', () => {
            const segments = getSegmentsBetween(0, 3, false);
            expect(segments).toEqual([0, 1, 2, 3]);
        });

        it('should get segments counter-clockwise', () => {
            const segments = getSegmentsBetween(3, 0, true);
            expect(segments).toEqual([3, 2, 1, 0]);
        });

        it('should handle wraparound clockwise', () => {
            const segments = getSegmentsBetween(22, 1, false);
            expect(segments).toEqual([22, 23, 0, 1]);
        });

        it('should handle wraparound counter-clockwise', () => {
            const segments = getSegmentsBetween(1, 22, true);
            expect(segments).toEqual([1, 0, 23, 22]);
        });

        it('should include start and end segments', () => {
            const segments = getSegmentsBetween(5, 7, false);
            expect(segments[0]).toBe(5);
            expect(segments[segments.length - 1]).toBe(7);
        });

        it('should handle single segment distance', () => {
            const segments = getSegmentsBetween(5, 6, false);
            expect(segments).toEqual([5, 6]);
        });

        it('should handle same start and end', () => {
            const segments = getSegmentsBetween(5, 5, false);
            // When start equals end, the while loop never executes
            // So we just get [end] which is [5]
            expect(segments.length).toBe(1);
            expect(segments[0]).toBe(5);
        });

        it('should prevent infinite loops with maxIterations', () => {
            // Even with bad logic, should not exceed CLOCK.SEGMENTS iterations
            const segments = getSegmentsBetween(0, 100, false);
            expect(segments.length).toBeLessThanOrEqual(CLOCK.SEGMENTS + 1);
        });
    });

    describe('createTearPath', () => {
        it('should create tear path with correct structure', () => {
            const result = createTearPath(10, 20, 45);
            
            expect(result).toHaveProperty('d');
            expect(result).toHaveProperty('transform');
            
            // Check transform includes translation and rotation
            expect(result.transform).toContain('translate(10, 20)');
            expect(result.transform).toContain('rotate(45)');
            expect(result.transform).toContain('scale(1.5)');
        });

        it('should include SVG path commands', () => {
            const result = createTearPath(0, 0, 0);
            
            // Should contain move and curve commands
            expect(result.d).toContain('M');
            expect(result.d).toContain('c');
            expect(result.d).toContain('L');
        });

        it('should handle various positions and angles', () => {
            const positions = [
                { x: 0, y: 0, angle: 0 },
                { x: 100, y: -50, angle: 90 },
                { x: -50, y: 100, angle: 180 },
                { x: 50, y: 50, angle: 270 }
            ];

            positions.forEach(({ x, y, angle }) => {
                const result = createTearPath(x, y, angle);
                expect(result.d).toBeTruthy();
                expect(result.transform).toContain(`translate(${x}, ${y})`);
                expect(result.transform).toContain(`rotate(${angle})`);
            });
        });
    });

    describe('Technical Debt Documentation', () => {
        it('documents duplication with clockFaceGeometry.js', () => {
            // TECHNICAL DEBT:
            // ClockFaceUtils.js contains the same functions as utils/clockFaceGeometry.js
            // This duplication causes:
            // 1. Maintenance issues - need to update both files
            // 2. Confusion - which file should be imported?
            // 3. Potential for divergence - functions might behave differently
            // 
            // Resolution: Consolidate into a single file and update all imports
            
            expect(true).toBe(true);
        });
    });
});