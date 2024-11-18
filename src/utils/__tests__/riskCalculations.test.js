/**
 * Risk Calculation Tests
 * 
 * IMPORTANT: These tests serve a dual purpose:
 * 1. Verify correct implementation of the risk calculation logic
 * 2. Document and enforce the statistical model from the BEAVRS study
 * 
 * Reference:
 * "Development and external validation of a retinal detachment risk calculator"
 * Published in Nature Eye (2023)
 * https://www.nature.com/articles/s41433-023-02388-0
 * 
 * The coefficients and behaviors tested here come from a multivariate logistic
 * regression model. In such models, each parameter captures a unique aspect of
 * risk that is statistically independent from other parameters. This means:
 * 
 * 1. Parameters that seem related (like total RD and inferior hours) can both
 *    contribute to the risk score independently. This is not double counting -
 *    the statistical model has determined that each factor adds unique information.
 * 
 * 2. Coefficients that seem counterintuitive (like 3-5 hours having a higher
 *    value than 6+ hours) reflect real patterns in the data that were validated
 *    across 4,202 operations at 27 UK sites.
 * 
 * DO NOT modify these tests to "fix" seemingly counterintuitive behavior without
 * statistical validation, as that would invalidate the research-based predictions.
 * 
 * Key Model Features:
 * - Total RD and inferior detachment are separate parameters
 * - Total RD gets both coefficients (+0.663 and +0.435 = +1.098)
 * - 3-5 inferior hours has a higher coefficient than 6+ (0.441 > 0.435)
 * - These coefficients capture different aspects of surgical risk
 * - All coefficients are derived from multivariate logistic regression
 * - Model validation was performed on 4,202 operations across 27 UK sites
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
        expect(getAgeGroup('18')).toBe('under_45');
        expect(getAgeGroup('44')).toBe('under_45');
    });

    test('returns correct age group for 45-64', () => {
        expect(getAgeGroup('45')).toBe('45_to_64');
        expect(getAgeGroup('64')).toBe('45_to_64');
    });

    test('returns correct age group for 65-79', () => {
        expect(getAgeGroup('65')).toBe('65_to_79');
        expect(getAgeGroup('79')).toBe('65_to_79');
    });

    test('returns correct age group for 80+', () => {
        expect(getAgeGroup('80')).toBe('80_plus');
        expect(getAgeGroup('90')).toBe('80_plus');
    });

    test('handles default case', () => {
        expect(getAgeGroup('')).toBe('45_to_64');
        expect(getAgeGroup('invalid')).toBe('45_to_64');
    });
});

describe('getBreakLocation', () => {
    test('returns no_break when no hours selected', () => {
        expect(getBreakLocation([])).toBe('no_break');
        expect(getBreakLocation(null)).toBe('no_break');
    });

    test('identifies 5-7 location with priority', () => {
        expect(getBreakLocation([5])).toBe('5_to_7');
        expect(getBreakLocation([6])).toBe('5_to_7');
        expect(getBreakLocation([7])).toBe('5_to_7');
        // Should prioritize 5-7 even if other locations present
        expect(getBreakLocation([4, 6, 8])).toBe('5_to_7');
    });

    test('identifies 4 or 8 location', () => {
        expect(getBreakLocation([4])).toBe('4_or_8');
        expect(getBreakLocation([8])).toBe('4_or_8');
        // Should identify 4 or 8 when no 5-7 present
        expect(getBreakLocation([1, 4, 9])).toBe('4_or_8');
    });

    test('identifies 9-3 location', () => {
        expect(getBreakLocation([9])).toBe('9_to_3');
        expect(getBreakLocation([12])).toBe('9_to_3');
        expect(getBreakLocation([3])).toBe('9_to_3');
        // Should default to 9-3 when no other locations present
        expect(getBreakLocation([1, 2, 3])).toBe('9_to_3');
    });
});

describe('getInferiorDetachment', () => {
    test('identifies 6 hours detachment', () => {
        // All inferior hours (3-9)
        expect(getInferiorDetachment([3, 4, 5, 6, 7, 8, 9])).toBe('6_hours');
        // Just 6 inferior hours
        expect(getInferiorDetachment([3, 4, 5, 6, 7, 8])).toBe('6_hours');
        // 6 inferior hours plus some non-inferior
        expect(getInferiorDetachment([1, 2, 3, 4, 5, 6, 7, 8])).toBe('6_hours');
    });

    test('identifies 3-5 inferior hours detachment', () => {
        // 5 inferior hours
        expect(getInferiorDetachment([3, 4, 5, 6, 7])).toBe('3_to_5');
        // 4 inferior hours
        expect(getInferiorDetachment([3, 4, 5, 6])).toBe('3_to_5');
        // 3 inferior hours
        expect(getInferiorDetachment([3, 4, 5])).toBe('3_to_5');
        // 3 inferior hours plus some non-inferior
        expect(getInferiorDetachment([1, 2, 3, 4, 5])).toBe('3_to_5');
    });

    test('identifies less than 3 inferior hours detachment', () => {
        // No inferior hours
        expect(getInferiorDetachment([1, 2])).toBe('less_than_3');
        // 1 inferior hour
        expect(getInferiorDetachment([3])).toBe('less_than_3');
        // 2 inferior hours
        expect(getInferiorDetachment([3, 4])).toBe('less_than_3');
        // 2 inferior hours plus some non-inferior
        expect(getInferiorDetachment([1, 2, 3, 4])).toBe('less_than_3');
    });
});

describe('isTotalRD', () => {
    test('identifies total RD when all 12 hours affected', () => {
        // All 12 hours
        expect(isTotalRD([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('yes');
        // All 12 hours with duplicates
        expect(isTotalRD([1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('yes');
    });

    test('identifies non-total RD when any hour is missing', () => {
        // Missing hour 12
        expect(isTotalRD([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe('no');
        // Missing hour 1
        expect(isTotalRD([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('no');
        // Only inferior hours
        expect(isTotalRD([3, 4, 5, 6, 7, 8, 9])).toBe('no');
    });
});

describe('getPVRGrade', () => {
    test('identifies grade C', () => {
        expect(getPVRGrade('C')).toBe('C');
    });

    test('identifies non-C grades', () => {
        expect(getPVRGrade('none')).toBe('none_A_B');
        expect(getPVRGrade('A')).toBe('none_A_B');
        expect(getPVRGrade('B')).toBe('none_A_B');
    });
});

describe('calculateRiskWithSteps', () => {
    test('calculates risk with all parameters', () => {
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [6],
            detachmentSegments: [3, 4, 5, 6, 7]
        });

        expect(result.probability).toBeGreaterThan(0);
        expect(result.probability).toBeLessThan(100);
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.logit).toBeDefined();
    });

    test('handles default/edge cases', () => {
        const result = calculateRiskWithSteps({
            age: '',
            pvrGrade: '',
            vitrectomyGauge: '',
            selectedHours: [],
            detachmentSegments: []
        });

        expect(result.probability).toBeGreaterThan(0);
        expect(result.probability).toBeLessThan(100);
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.logit).toBeDefined();
    });

    test('applies both coefficients for total detachment', () => {
        // IMPORTANT: Total detachment gets BOTH coefficients because they are
        // separate parameters in the BEAVRS study's multivariate model:
        // +0.663 for total RD (captures complexity of complete involvement)
        // +0.435 for having all inferior hours (captures gravity effects)
        // = +1.098 combined
        // This is not double counting - it reflects different risk factors
        // that were identified through multivariate logistic regression
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        });

        // Find the relevant steps
        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        // Verify both coefficients are applied
        expect(totalRDStep.value).toBeCloseTo(0.663);
        expect(inferiorStep.value).toBeCloseTo(0.435);
        expect(totalRDStep.value + inferiorStep.value).toBeCloseTo(1.098);

        // Verify the categories
        expect(totalRDStep.category).toBe('yes');
        expect(inferiorStep.category).toBe('6_hours');
    });

    test('applies no total RD coefficient when missing just one hour', () => {
        // Missing hour 12, but has all inferior hours
        // Should get:
        // +0.0 for total RD (missing an hour)
        // +0.435 for having all inferior hours
        // = +0.435 combined
        // This shows how strict the total RD definition is
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.value).toBeCloseTo(0.0);
        expect(inferiorStep.value).toBeCloseTo(0.435);
        expect(totalRDStep.value + inferiorStep.value).toBeCloseTo(0.435);

        expect(totalRDStep.category).toBe('no');
        expect(inferiorStep.category).toBe('6_hours');
    });

    test('applies correct coefficient for exactly 6 inferior hours', () => {
        // Exactly 6 inferior hours (3-8) should get:
        // +0.0 for total RD
        // +0.435 for having 6 inferior hours
        // = +0.435 combined
        // This coefficient reflects the challenges of inferior detachments
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [3, 4, 5, 6, 7, 8]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.value).toBeCloseTo(0.0);
        expect(inferiorStep.value).toBeCloseTo(0.435);
        expect(totalRDStep.value + inferiorStep.value).toBeCloseTo(0.435);

        expect(totalRDStep.category).toBe('no');
        expect(inferiorStep.category).toBe('6_hours');
    });

    test('applies correct coefficient for 3-5 inferior hours', () => {
        // Exactly 4 inferior hours (3-6) should get:
        // +0.0 for total RD
        // +0.441 for having 3-5 inferior hours
        // = +0.441 combined
        // Note: This being higher than 6+ hours (0.441 > 0.435) is not a mistake.
        // It reflects the statistical findings from the BEAVRS study's
        // multivariate logistic regression, possibly due to selection bias
        // in how these cases were managed.
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [3, 4, 5, 6]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.value).toBeCloseTo(0.0);
        expect(inferiorStep.value).toBeCloseTo(0.441);
        expect(totalRDStep.value + inferiorStep.value).toBeCloseTo(0.441);

        expect(totalRDStep.category).toBe('no');
        expect(inferiorStep.category).toBe('3_to_5');
    });

    test('applies only inferior coefficient for extensive but not total detachment', () => {
        // All inferior hours but not total should get:
        // +0.0 for total RD (not all hours)
        // +0.435 for having all inferior hours
        // = +0.435 combined
        // This shows how the coefficients capture different aspects of risk
        // in the multivariate model
        const result = calculateRiskWithSteps({
            age: '65',
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [],
            detachmentSegments: [2, 3, 4, 5, 6, 7, 8, 9, 10]
        });

        const totalRDStep = result.steps.find(s => s.step === 'Total RD');
        const inferiorStep = result.steps.find(s => s.step === 'Inferior detachment');

        expect(totalRDStep.value).toBeCloseTo(0.0);
        expect(inferiorStep.value).toBeCloseTo(0.435);
        expect(totalRDStep.value + inferiorStep.value).toBeCloseTo(0.435);

        expect(totalRDStep.category).toBe('no');
        expect(inferiorStep.category).toBe('6_hours');
    });
});
