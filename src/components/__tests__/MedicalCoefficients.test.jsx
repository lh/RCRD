import React from 'react';
import { PAPER_COEFFICIENTS, SIGNIFICANT_COEFFICIENTS, isSignificant } from '../../constants/paperCoefficients';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { MODEL_TYPE } from '../../constants/modelTypes';

/**
 * Medical Coefficient Validation Test Suite
 * 
 * Validates that all coefficients in the risk calculator match:
 * 1. Expected signs (positive increases risk, negative decreases risk)
 * 2. Published values from BEAVRS paper
 * 3. Clinical logic and medical expectations
 * 4. Statistical significance thresholds
 */

describe('Medical Coefficient Validation', () => {
    describe('Age Coefficient Sign Validation', () => {
        it('should have positive coefficient for age <45 (increases risk)', () => {
            const coefficient = PAPER_COEFFICIENTS.age['<45'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.459, 3);
        });

        it('should have positive coefficient for age 65-79 (increases risk)', () => {
            const coefficient = PAPER_COEFFICIENTS.age['65-79'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.236, 3);
        });

        it('should have positive coefficient for age 80+ (highest risk)', () => {
            const coefficient = PAPER_COEFFICIENTS.age['80+'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.498, 3);
            // Should be highest age coefficient
            expect(coefficient).toBeGreaterThan(PAPER_COEFFICIENTS.age['65-79']);
        });

        it('should have zero coefficient for reference age group 45-64', () => {
            const coefficient = PAPER_COEFFICIENTS.age['45-64'];
            expect(coefficient).toBe(0);
        });

        it('should show increasing risk with age extremes', () => {
            const young = PAPER_COEFFICIENTS.age['<45'];
            const reference = PAPER_COEFFICIENTS.age['45-64'];
            const senior = PAPER_COEFFICIENTS.age['65-79'];
            const elderly = PAPER_COEFFICIENTS.age['80+'];
            
            expect(reference).toBe(0);
            expect(young).toBeGreaterThan(reference);
            expect(senior).toBeGreaterThan(reference);
            expect(elderly).toBeGreaterThan(senior);
        });
    });

    describe('Break Location Coefficient Validation', () => {
        it('should have positive coefficient for inferior breaks 5-7 oclock', () => {
            const coefficient = PAPER_COEFFICIENTS.breakLocation['5-7'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.607, 3);
        });

        it('should have positive coefficient for inferior breaks 4-8 oclock', () => {
            const coefficient = PAPER_COEFFICIENTS.breakLocation['4-8'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.428, 3);
        });

        it('should have positive coefficient for no break identified', () => {
            const coefficient = PAPER_COEFFICIENTS.breakLocation['none'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.676, 3);
            // No break should be highest risk
            expect(coefficient).toBeGreaterThan(PAPER_COEFFICIENTS.breakLocation['5-7']);
        });

        it('should have zero coefficient for superior breaks 9-3 oclock', () => {
            const coefficient = PAPER_COEFFICIENTS.breakLocation['9-3'];
            expect(coefficient).toBe(0);
        });

        it('should show inferior breaks have higher risk than superior', () => {
            const superior = PAPER_COEFFICIENTS.breakLocation['9-3'];
            const inferior48 = PAPER_COEFFICIENTS.breakLocation['4-8'];
            const inferior57 = PAPER_COEFFICIENTS.breakLocation['5-7'];
            
            expect(superior).toBe(0);
            expect(inferior48).toBeGreaterThan(superior);
            expect(inferior57).toBeGreaterThan(inferior48);
        });
    });

    describe('Inferior Detachment Extent Coefficient Validation', () => {
        it('should have positive coefficient for 3-5 hours inferior detachment', () => {
            const coefficient = PAPER_COEFFICIENTS.inferiorDetachment['3_to_5'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.441, 3);
        });

        it('should have positive coefficient for 6 hours inferior detachment', () => {
            const coefficient = PAPER_COEFFICIENTS.inferiorDetachment['6_hours'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.435, 3);
        });

        it('should have zero coefficient for <3 hours inferior detachment', () => {
            const coefficient = PAPER_COEFFICIENTS.inferiorDetachment['less_than_3'];
            expect(coefficient).toBe(0);
        });

        it('should show similar risk for 3-5 and 6 hours detachment', () => {
            const hours35 = PAPER_COEFFICIENTS.inferiorDetachment['3_to_5'];
            const hours6 = PAPER_COEFFICIENTS.inferiorDetachment['6_hours'];
            // Interestingly, they're very similar in the paper
            expect(Math.abs(hours35 - hours6)).toBeLessThan(0.01);
        });
    });

    describe('Total Detachment Coefficient Validation', () => {
        it('should have positive coefficient for total retinal detachment', () => {
            const coefficient = PAPER_COEFFICIENTS.totalDetachment['yes'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.663, 3);
        });

        it('should have zero coefficient for non-total detachment', () => {
            const coefficient = PAPER_COEFFICIENTS.totalDetachment['no'];
            expect(coefficient).toBe(0);
        });

        it('should be one of the larger risk coefficients', () => {
            const totalRD = PAPER_COEFFICIENTS.totalDetachment['yes'];
            const pvrC = PAPER_COEFFICIENTS.pvrGrade['C'];
            // Total RD is a major risk factor, should be larger than PVR
            expect(totalRD).toBeGreaterThan(pvrC);
        });
    });

    describe('PVR Grade Coefficient Validation', () => {
        it('should have positive coefficient for PVR Grade C', () => {
            const coefficient = PAPER_COEFFICIENTS.pvrGrade['C'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.220, 3);
        });

        it('should have zero coefficient for no PVR', () => {
            const coefficient = PAPER_COEFFICIENTS.pvrGrade['none'];
            expect(coefficient).toBe(0);
        });

        it('should be statistically significant', () => {
            expect(isSignificant('pvrGrade', 'C')).toBe(true);
            expect(SIGNIFICANT_COEFFICIENTS.pvrGrade).toContain('C');
        });
    });

    describe('Cryotherapy Coefficient Validation (Protective Factor)', () => {
        it('should have negative coefficient for cryotherapy (protective)', () => {
            const coefficient = PAPER_COEFFICIENTS.cryotherapy['yes'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.420, 3);
        });

        it('should have zero coefficient for no cryotherapy', () => {
            const coefficient = PAPER_COEFFICIENTS.cryotherapy['no'];
            expect(coefficient).toBe(0);
        });

        it('should be statistically significant protective factor', () => {
            expect(isSignificant('cryotherapy', 'yes')).toBe(true);
            expect(SIGNIFICANT_COEFFICIENTS.cryotherapy).toContain('yes');
        });
    });

    describe('Tamponade Coefficient Validation', () => {
        it('should have zero coefficient for SF6 gas (reference)', () => {
            const coefficient = PAPER_COEFFICIENTS.tamponade['sf6'];
            expect(coefficient).toBe(0);
        });

        it('should have negative coefficient for C2F6 gas (protective vs SF6)', () => {
            const coefficient = PAPER_COEFFICIENTS.tamponade['c2f6'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.417, 3);
        });

        it('should have negative coefficient for C3F8 gas', () => {
            const coefficient = PAPER_COEFFICIENTS.tamponade['c3f8'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.104, 3);
        });

        it('should have negative coefficient for air', () => {
            const coefficient = PAPER_COEFFICIENTS.tamponade['air'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.159, 3);
        });

        it('should have positive coefficient for light silicone oil (increases risk)', () => {
            const coefficient = PAPER_COEFFICIENTS.tamponade['light_oil'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.670, 3);
        });

        it('should have small positive coefficient for heavy oil', () => {
            const coefficient = PAPER_COEFFICIENTS.tamponade['heavy_oil'];
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.030, 3);
        });

        it('should show oil has higher risk than gas tamponades', () => {
            const lightOil = PAPER_COEFFICIENTS.tamponade['light_oil'];
            const heavyOil = PAPER_COEFFICIENTS.tamponade['heavy_oil'];
            const sf6 = PAPER_COEFFICIENTS.tamponade['sf6'];
            const c2f6 = PAPER_COEFFICIENTS.tamponade['c2f6'];
            
            expect(lightOil).toBeGreaterThan(sf6);
            expect(lightOil).toBeGreaterThan(c2f6);
            expect(heavyOil).toBeGreaterThan(c2f6);
        });
    });

    describe('Vitrectomy Gauge Coefficient Validation', () => {
        it('should have zero coefficient for 20g (reference)', () => {
            const coefficient = PAPER_COEFFICIENTS.vitrectomyGauge['20g'];
            expect(coefficient).toBe(0);
        });

        it('should have negative coefficient for 23g (reduces risk)', () => {
            const coefficient = PAPER_COEFFICIENTS.vitrectomyGauge['23g'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.408, 3);
        });

        it('should have negative coefficient for 25g (reduces risk most)', () => {
            const coefficient = PAPER_COEFFICIENTS.vitrectomyGauge['25g'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.885, 3);
        });

        it('should have negative coefficient for 27g', () => {
            const coefficient = PAPER_COEFFICIENTS.vitrectomyGauge['27g'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.703, 3);
        });

        it('should have negative coefficient for not recorded', () => {
            const coefficient = PAPER_COEFFICIENTS.vitrectomyGauge['not_recorded'];
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.738, 3);
        });

        it('should show smaller gauge has more protective effect', () => {
            const g20 = PAPER_COEFFICIENTS.vitrectomyGauge['20g'];
            const g23 = PAPER_COEFFICIENTS.vitrectomyGauge['23g'];
            const g25 = PAPER_COEFFICIENTS.vitrectomyGauge['25g'];
            
            expect(g20).toBe(0);
            expect(g23).toBeLessThan(g20);
            expect(g25).toBeLessThan(g23);
        });
    });

    describe('Intercept/Constant Coefficient Validation', () => {
        it('should have negative intercept for baseline risk', () => {
            const constant = PAPER_COEFFICIENTS.constant;
            expect(constant).toBeLessThan(0);
            expect(constant).toBeCloseTo(-1.611, 3);
        });

        it('should produce low baseline risk with intercept alone', () => {
            // With just the intercept, probability should be low
            const logit = PAPER_COEFFICIENTS.constant;
            const probability = 100 / (1 + Math.exp(-logit));
            expect(probability).toBeLessThan(20); // Baseline risk should be low
        });
    });

    describe('Reference Category Validation', () => {
        it('should have all reference categories set to zero', () => {
            expect(PAPER_COEFFICIENTS.age['45-64']).toBe(0);
            expect(PAPER_COEFFICIENTS.breakLocation['9-3']).toBe(0);
            expect(PAPER_COEFFICIENTS.inferiorDetachment['less_than_3']).toBe(0);
            expect(PAPER_COEFFICIENTS.totalDetachment['no']).toBe(0);
            expect(PAPER_COEFFICIENTS.pvrGrade['none']).toBe(0);
            expect(PAPER_COEFFICIENTS.cryotherapy['no']).toBe(0);
            expect(PAPER_COEFFICIENTS.tamponade['sf6']).toBe(0);
            expect(PAPER_COEFFICIENTS.vitrectomyGauge['20g']).toBe(0);
        });
    });

    describe('Statistical Significance Validation', () => {
        it('should correctly identify significant age coefficients', () => {
            expect(isSignificant('age', '65-79')).toBe(true);
            expect(isSignificant('age', '80+')).toBe(true);
            expect(isSignificant('age', '<45')).toBe(true);
        });

        it('should correctly identify significant break location coefficients', () => {
            expect(isSignificant('breakLocation', '4-8')).toBe(true);
            expect(isSignificant('breakLocation', '5-7')).toBe(true);
            expect(isSignificant('breakLocation', 'none')).toBe(true);
        });

        it('should correctly identify significant tamponade coefficients', () => {
            expect(isSignificant('tamponade', 'c2f6')).toBe(true);
            expect(isSignificant('tamponade', 'light_oil')).toBe(true);
            // C3F8 is not significant (p >= 0.05)
            expect(isSignificant('tamponade', 'c3f8')).toBe(false);
        });

        it('should correctly identify significant gauge coefficient', () => {
            expect(isSignificant('vitrectomyGauge', '25g')).toBe(true);
            // 23g is not significant in the significant model
            expect(isSignificant('vitrectomyGauge', '23g')).toBe(false);
        });
    });
});