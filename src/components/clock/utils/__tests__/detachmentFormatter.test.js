import { formatHourRange, formatDetachment } from '../detachmentFormatter';

describe('formatHourRange', () => {
    test('handles empty input', () => {
        expect(formatHourRange([])).toBe('None');
        expect(formatHourRange(null)).toBe('None');
        expect(formatHourRange(undefined)).toBe('None');
    });

    test('formats single hour', () => {
        expect(formatHourRange([3])).toBe('3');
    });

    test('formats continuous range', () => {
        expect(formatHourRange([1, 2, 3])).toBe('1-3');
        expect(formatHourRange([4, 5, 6, 7])).toBe('4-7');
    });

    test('formats multiple ranges', () => {
        expect(formatHourRange([1, 2, 4, 5])).toBe('1-2; 4-5');
        expect(formatHourRange([1, 3, 5])).toBe('1; 3; 5');
    });

    test('handles midnight crossing', () => {
        expect(formatHourRange([11, 12, 1])).toBe('11-1');
        expect(formatHourRange([10, 11, 12, 1, 2])).toBe('10-2');
    });

    test('sorts hours correctly', () => {
        expect(formatHourRange([3, 1, 2])).toBe('1-3');
        expect(formatHourRange([12, 2, 1, 11])).toBe('11-2');
    });
});

describe('formatDetachment', () => {
    test('handles no detachment', () => {
        expect(formatDetachment([])).toBe('None');
    });

    test('formats single hour detachment', () => {
        expect(formatDetachment([3])).toBe('Detachment 3 o\'clock');
    });

    test('formats continuous range detachment', () => {
        expect(formatDetachment([1, 2, 3])).toBe('Detachment 1-3 o\'clock');
    });

    test('formats multiple ranges detachment', () => {
        expect(formatDetachment([1, 2, 4, 5])).toBe('Detachment 1-2; 4-5 o\'clock');
    });

    test('formats midnight crossing detachment', () => {
        expect(formatDetachment([11, 12, 1])).toBe('Detachment 11-1 o\'clock');
    });
});
