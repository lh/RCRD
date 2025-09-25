/**
 * Risk Calculation Tests
 * 
 * IMPORTANT: These tests serve a dual purpose:
 * 1. Verify correct implementation of the risk calculation logic
 * 2. Document and enforce the statistical model from the BEAVRS study
 */

import {
    getAgeGroup,
    getBreakLocation,
    getInferiorDetachment,
    isTotalRD,
    getPVRGrade,
    calculateRiskWithSteps
} from '../riskCalculations';

describe('getAgeGroup', () => {
    test('returns correct age group for under 45', () => {
        expect(getAgeGroup('18')).toBe('<45');
        expect(getAgeGroup('44')).toBe('<45');
    });

    test('returns correct age group for 45-64', () => {
        expect(getAgeGroup('45')).toBe('45-64');
        expect(getAgeGroup('64')).toBe('45-64');
    });

    test('returns correct age group for 65-79', () => {
        expect(getAgeGroup('65')).toBe('65-79');
        expect(getAgeGroup('79')).toBe('65-79');
    });

    test('returns correct age group for 80+', () => {
        expect(getAgeGroup('80')).toBe('80+');
        expect(getAgeGroup('90')).toBe('80+');
    });

    test('handles default case', () => {
        expect(getAgeGroup('')).toBe('45-64');
        expect(getAgeGroup('invalid')).toBe('45-64');
    });
});

describe('getBreakLocation', () => {
    test('returns none when no hours selected', () => {
        expect(getBreakLocation([])).toBe('none');
        expect(getBreakLocation(null)).toBe('none');
    });

    test('identifies 5-7 location with priority', () => {
        expect(getBreakLocation([5])).toBe('5-7');
        expect(getBreakLocation([6])).toBe('5-7');
        expect(getBreakLocation([7])).toBe('5-7');
        // Should prioritize 5-7 even if other locations present
        expect(getBreakLocation([4, 6, 8])).toBe('5-7');
    });

    test('identifies 4-8 location', () => {
        expect(getBreakLocation([4])).toBe('4-8');
        expect(getBreakLocation([8])).toBe('4-8');
        // Should identify 4-8 when no 5-7 present
        expect(getBreakLocation([1, 4, 9])).toBe('4-8');
    });

    test('identifies 9-3 location', () => {
        expect(getBreakLocation([9])).toBe('9-3');
        expect(getBreakLocation([12])).toBe('9-3');
        expect(getBreakLocation([3])).toBe('9-3');
        // Should default to 9-3 when no other locations present
        expect(getBreakLocation([1, 2, 3])).toBe('9-3');
    });
});

describe('getInferiorDetachment', () => {
    test('identifies 6 hours detachment (all inferior hours)', () => {
        // All inferior hours (3-9) in 24-segment model (2 segments per hour)
        const segments = [
            5, 6,     // Hour 3
            7, 8,     // Hour 4
            9, 10,    // Hour 5
            11, 12,   // Hour 6
            13, 14,   // Hour 7
            15, 16,   // Hour 8
            17, 18    // Hour 9
        ];
        expect(getInferiorDetachment(segments)).toBe('6_hours');
    });

    test('identifies 3-5 inferior hours detachment', () => {
        // 4 inferior hours (3-6) in 24-segment model
        const segments = [
            5, 6,     // Hour 3
            7, 8,     // Hour 4
            9, 10,    // Hour 5
            11, 12    // Hour 6
        ];
        expect(getInferiorDetachment(segments)).toBe('3_to_5');
    });

    test('identifies less than 3 inferior hours detachment', () => {
        // No inferior hours
        expect(getInferiorDetachment([])).toBe('less_than_3');
        
        // 2 inferior hours (3-4) in 24-segment model
        const segments = [
            5, 6,     // Hour 3
            7, 8      // Hour 4
        ];
        expect(getInferiorDetachment(segments)).toBe('less_than_3');
    });
});

describe('isTotalRD', () => {
    test('identifies total RD with 23+ segments', () => {
        // Generate 23 segments
        const segments = Array.from({ length: 23 }, (_, i) => i);
        expect(isTotalRD(segments)).toBe('yes');
        
        // More than 23 segments
        const moreSegments = Array.from({ length: 25 }, (_, i) => i);
        expect(isTotalRD(moreSegments)).toBe('yes');
    });

    test('identifies non-total RD with less than 23 segments', () => {
        // 22 segments
        const segments = Array.from({ length: 22 }, (_, i) => i);
        expect(isTotalRD(segments)).toBe('no');
        
        // Empty array
        expect(isTotalRD([])).toBe('no');
        
        // Few segments
        expect(isTotalRD([1, 2, 3])).toBe('no');
    });
});

describe('getPVRGrade', () => {
    test('identifies grade C', () => {
        expect(getPVRGrade('C')).toBe('C');
    });

    test('identifies non-C grades', () => {
        expect(getPVRGrade('none')).toBe('none');
        expect(getPVRGrade('A')).toBe('none');
        expect(getPVRGrade('B')).toBe('none');
    });
});

describe('calculateRiskWithSteps', () => {
    test('calculates risk with all parameters', () => {
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [6],
            detachmentSegments: [
                5, 6,     // Hour 3
                7, 8,     // Hour 4
                9, 10     // Hour 5
            ]
        });

        expect(result.probability).toBeGreaterThan(0);
        expect(result.probability).toBeLessThan(100);
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.logit).toBeDefined();
    });

    test('handles default/edge cases', () => {
        // Test with valid minimum inputs
        const result = calculateRiskWithSteps({
            age: '50',  // Provide valid age
            pvrGrade: '',
            vitrectomyGauge: '',
            selectedHours: [],
            detachmentSegments: []
        });

        expect(result.error).toBe(false);
        expect(result.probability).toBeGreaterThan(0);
        expect(result.probability).toBeLessThan(100);
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.logit).toBeDefined();
    });

    test('validates invalid input and returns error', () => {
        // Test with invalid age
        const result = calculateRiskWithSteps({
            age: '',  // Invalid: empty age
            pvrGrade: '',
            vitrectomyGauge: '',
            selectedHours: [],
            detachmentSegments: []
        });

        expect(result.error).toBe(true);
        expect(result.message).toBe('Invalid input parameters');
        expect(result.errors).toContain('Age is required');
        expect(result.probability).toBeNull();
    });

    test('handles total detachment', () => {
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [
                0, 1, 2, 3, 4,    // Hours 12, 1, 2
                5, 6,             // Hour 3
                7, 8,             // Hour 4
                9, 10,            // Hour 5
                11, 12,           // Hour 6
                13, 14,           // Hour 7
                15, 16,           // Hour 8
                17, 18,           // Hour 9
                19, 20, 21, 22, 23 // Hours 10, 11, 12
            ]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.category).toBe('yes');
        expect(inferiorStep.category).toBe('6_hours');
    });

    test('handles missing hour', () => {
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [
                5, 6,     // Hour 3
                7, 8,     // Hour 4
                9, 10,    // Hour 5
                11, 12    // Hour 6
            ]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.category).toBe('no');
        expect(inferiorStep.category).toBe('3_to_5');
    });

    test('handles inferior hours', () => {
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [
                5, 6,     // Hour 3
                7, 8,     // Hour 4
                9, 10,    // Hour 5
                11, 12,   // Hour 6
                13, 14,   // Hour 7
                15, 16,   // Hour 8
                17, 18    // Hour 9
            ]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.category).toBe('no');  // Not enough segments for total RD
        expect(inferiorStep.category).toBe('6_hours');
    });
});
