import { formatDetachmentHours } from '../formatDetachmentHours';
import { CLOCK } from '../clockConstants';

describe('formatDetachmentHours', () => {
    test('handles empty input', () => {
        expect(formatDetachmentHours([])).toBe('None');
        expect(formatDetachmentHours(null)).toBe('None');
        expect(formatDetachmentHours(undefined)).toBe('None');
    });

    test('formats single hour correctly', () => {
        // Use hour 4 segments
        const segments = CLOCK.HOUR_SEGMENTS[4];
        expect(formatDetachmentHours(segments)).toBe('4 o\'clock');
    });

    test('formats continuous range correctly', () => {
        const segments = [];
        for (let hour = 4; hour <= 8; hour++) {
            segments.push(...CLOCK.HOUR_SEGMENTS[hour]);
        }
        expect(formatDetachmentHours(segments)).toBe('4-8 o\'clock');
    });

    test('formats separate ranges correctly', () => {
        const segments = [];
        for (let hour = 1; hour <= 3; hour++) {
            segments.push(...CLOCK.HOUR_SEGMENTS[hour]);
        }
        for (let hour = 6; hour <= 8; hour++) {
            segments.push(...CLOCK.HOUR_SEGMENTS[hour]);
        }
        expect(formatDetachmentHours(segments)).toBe('1-3; 6-8 o\'clock');
    });

    test('formats midnight crossing range correctly', () => {
        // Use segments from hours 11, 12, and 1
        const segments = [
            ...CLOCK.HOUR_SEGMENTS[11],  // Hour 11
            ...CLOCK.HOUR_SEGMENTS[12],  // Hour 12
            ...CLOCK.HOUR_SEGMENTS[1]    // Hour 1
        ];
        expect(formatDetachmentHours(segments)).toBe('11-1 o\'clock');
    });

    test('formats total detachment correctly', () => {
        // Use all segments
        const segments = Array.from({ length: CLOCK.SEGMENTS }, (_, i) => i);
        expect(formatDetachmentHours(segments)).toBe('1-12 o\'clock (Total)');
    });

    test('formats clockwise selection correctly', () => {
        const segments = [];
        for (let hour = 4; hour <= 8; hour++) {
            segments.push(...CLOCK.HOUR_SEGMENTS[hour]);
        }
        expect(formatDetachmentHours(segments)).toBe('4-8 o\'clock');
    });

    test('formats counterclockwise selection correctly', () => {
        const segments = [];
        for (let hour = 8; hour >= 4; hour--) {
            segments.push(...CLOCK.HOUR_SEGMENTS[hour]);
        }
        expect(formatDetachmentHours(segments)).toBe('4-8 o\'clock');
    });

    test('handles hour boundary segments correctly', () => {
        // Use segments at boundary between hours 4 and 5
        const segments = [
            CLOCK.HOUR_SEGMENTS[4][1],  // Last segment of hour 4
            CLOCK.HOUR_SEGMENTS[5][0]   // First segment of hour 5
        ];
        expect(formatDetachmentHours(segments)).toBe('4-5 o\'clock');
    });

    test('handles inferior detachment range correctly', () => {
        const segments = [];
        for (let hour = 3; hour <= 9; hour++) {
            segments.push(...CLOCK.HOUR_SEGMENTS[hour]);
        }
        expect(formatDetachmentHours(segments)).toBe('3-9 o\'clock');
    });

    test('handles superior detachment range correctly', () => {
        // Use segments from hours 11, 12, 1
        const segments = [
            ...CLOCK.HOUR_SEGMENTS[11],
            ...CLOCK.HOUR_SEGMENTS[12],
            ...CLOCK.HOUR_SEGMENTS[1]
        ];
        expect(formatDetachmentHours(segments)).toBe('11-1 o\'clock');
    });
});
