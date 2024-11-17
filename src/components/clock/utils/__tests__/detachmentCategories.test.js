import { getDetachmentCategory } from '../detachmentCategories';

describe('getDetachmentCategory', () => {
    test('handles empty input', () => {
        expect(getDetachmentCategory([])).toBe('less_than_3');
        expect(getDetachmentCategory(null)).toBe('less_than_3');
        expect(getDetachmentCategory(undefined)).toBe('less_than_3');
    });

    test('identifies total detachment', () => {
        // Must have exactly all 12 hours
        expect(getDetachmentCategory([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('total_detachment');
        
        // Missing any hour means not total detachment
        expect(getDetachmentCategory([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe('6_hours');
        expect(getDetachmentCategory([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('6_hours');
        
        // Duplicate hours don't affect the count
        expect(getDetachmentCategory([1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('total_detachment');
    });

    test('identifies 6+ inferior hours detachment', () => {
        // All inferior hours (3-9)
        expect(getDetachmentCategory([3, 4, 5, 6, 7, 8, 9])).toBe('6_hours');
        // Just 6 inferior hours
        expect(getDetachmentCategory([3, 4, 5, 6, 7, 8])).toBe('6_hours');
        // 6 inferior hours plus some non-inferior
        expect(getDetachmentCategory([1, 2, 3, 4, 5, 6, 7, 8])).toBe('6_hours');
    });

    test('identifies 3-5 inferior hours detachment', () => {
        // 5 inferior hours
        expect(getDetachmentCategory([3, 4, 5, 6, 7])).toBe('3_to_5');
        // 4 inferior hours
        expect(getDetachmentCategory([3, 4, 5, 6])).toBe('3_to_5');
        // 3 inferior hours
        expect(getDetachmentCategory([3, 4, 5])).toBe('3_to_5');
        // 3 inferior hours plus some non-inferior
        expect(getDetachmentCategory([1, 2, 3, 4, 5])).toBe('3_to_5');
    });

    test('identifies less than 3 inferior hours detachment', () => {
        // No inferior hours
        expect(getDetachmentCategory([1, 2])).toBe('less_than_3');
        // 1 inferior hour
        expect(getDetachmentCategory([3])).toBe('less_than_3');
        // 2 inferior hours
        expect(getDetachmentCategory([3, 4])).toBe('less_than_3');
        // 2 inferior hours plus some non-inferior
        expect(getDetachmentCategory([1, 2, 3, 4])).toBe('less_than_3');
    });

    test('follows category precedence', () => {
        // Total detachment takes precedence over everything
        expect(getDetachmentCategory([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('total_detachment');
        
        // 6+ inferior hours takes precedence over 3-5
        expect(getDetachmentCategory([3, 4, 5, 6, 7, 8])).toBe('6_hours');
        
        // 3-5 inferior hours takes precedence over less than 3
        expect(getDetachmentCategory([1, 2, 3, 4, 5])).toBe('3_to_5');
    });
});
