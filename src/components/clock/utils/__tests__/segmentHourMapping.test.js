import { segmentToHour, segmentsToHours } from '../segmentHourMapping';

describe('segmentToHour', () => {
    test('maps segments 1-2 to hour 1', () => {
        expect(segmentToHour(1)).toBe(1);
        expect(segmentToHour(2)).toBe(1);
    });

    test('maps segments 3-4 to hour 2', () => {
        expect(segmentToHour(3)).toBe(2);
        expect(segmentToHour(4)).toBe(2);
    });

    test('maps segments 5-6 to hour 3', () => {
        expect(segmentToHour(5)).toBe(3);
        expect(segmentToHour(6)).toBe(3);
    });

    test('maps segments 7-8 to hour 4', () => {
        expect(segmentToHour(7)).toBe(4);
        expect(segmentToHour(8)).toBe(4);
    });

    test('maps segments 9-10 to hour 5', () => {
        expect(segmentToHour(9)).toBe(5);
        expect(segmentToHour(10)).toBe(5);
    });

    test('maps segments 11-12 to hour 6', () => {
        expect(segmentToHour(11)).toBe(6);
        expect(segmentToHour(12)).toBe(6);
    });

    test('maps segments 13-14 to hour 7', () => {
        expect(segmentToHour(13)).toBe(7);
        expect(segmentToHour(14)).toBe(7);
    });

    test('maps segments 15-16 to hour 8', () => {
        expect(segmentToHour(15)).toBe(8);
        expect(segmentToHour(16)).toBe(8);
    });

    test('maps segments 17-18 to hour 9', () => {
        expect(segmentToHour(17)).toBe(9);
        expect(segmentToHour(18)).toBe(9);
    });

    test('maps segments 19-20 to hour 10', () => {
        expect(segmentToHour(19)).toBe(10);
        expect(segmentToHour(20)).toBe(10);
    });

    test('maps segments 21-22 to hour 11', () => {
        expect(segmentToHour(21)).toBe(11);
        expect(segmentToHour(22)).toBe(11);
    });

    test('maps segments 23,0 to hour 12', () => {
        expect(segmentToHour(23)).toBe(12);
        expect(segmentToHour(0)).toBe(12);
    });

    test('handles out-of-range segments by wrapping', () => {
        expect(segmentToHour(24)).toBe(12); // same as segment 0
        expect(segmentToHour(25)).toBe(1);  // same as segment 1
        expect(segmentToHour(-1)).toBe(12); // same as segment 23
    });
});

describe('segmentsToHours', () => {
    test('converts array of segments to unique sorted hours', () => {
        expect(segmentsToHours([1, 2, 3, 4])).toEqual([1, 2]);
        expect(segmentsToHours([9, 10, 11, 12])).toEqual([5, 6]);
        expect(segmentsToHours([23, 0, 1, 2])).toEqual([1, 12]);
    });

    test('handles empty array', () => {
        expect(segmentsToHours([])).toEqual([]);
    });

    test('handles duplicate segments', () => {
        expect(segmentsToHours([1, 1, 2, 2])).toEqual([1]);
    });

    test('handles out-of-range segments', () => {
        expect(segmentsToHours([24, 25, -1])).toEqual([1, 12]);
    });
});
