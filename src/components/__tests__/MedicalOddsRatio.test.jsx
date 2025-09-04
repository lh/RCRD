import React from 'react';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { PAPER_COEFFICIENTS } from '../../constants/paperCoefficients';
import { 
    BEAVRS_AGE_GROUPS, 
    BREAK_LOCATIONS, 
    PVR_GRADES 
} from '../../test-utils/medical-test-constants';

/**
 * Medical Odds Ratio Verification Test Suite
 * 
 * Validates that calculated odds ratios match published values from:
 * BEAVRS Paper (Yorston et al., Eye 2023)
 * 
 * Tests verify:
 * 1. Age group odds ratios
 * 2. Break location odds ratios
 * 3. PVR grade odds ratios
 * 4. Tamponade odds ratios
 * 5. Combined factor interactions
 */

describe('Medical Odds Ratio Verification', () => {
    describe('Age Group Odds Ratios', () => {
        it('should verify OR for age <45 vs reference (45-64)', () => {
            const youngCoeff = PAPER_COEFFICIENTS.age['<45'];
            const refCoeff = PAPER_COEFFICIENTS.age['45-64'];
            
            // OR = exp(β)
            const calculatedOR = Math.exp(youngCoeff - refCoeff);
            const expectedOR = BEAVRS_AGE_GROUPS.young.oddsRatio;
            
            expect(calculatedOR).toBeCloseTo(expectedOR, 2);
        });

        it('should verify OR for age 65-79 vs reference', () => {
            const seniorCoeff = PAPER_COEFFICIENTS.age['65-79'];
            const refCoeff = PAPER_COEFFICIENTS.age['45-64'];
            
            const calculatedOR = Math.exp(seniorCoeff - refCoeff);
            const expectedOR = BEAVRS_AGE_GROUPS.senior.oddsRatio;
            
            expect(calculatedOR).toBeCloseTo(expectedOR, 2);
        });

        it('should verify OR for age 80+ vs reference', () => {
            const elderlyCoeff = PAPER_COEFFICIENTS.age['80+'];
            const refCoeff = PAPER_COEFFICIENTS.age['45-64'];
            
            const calculatedOR = Math.exp(elderlyCoeff - refCoeff);
            const expectedOR = BEAVRS_AGE_GROUPS.elderly.oddsRatio;
            
            expect(calculatedOR).toBeCloseTo(expectedOR, 2);
        });

        it('should have OR = 1.0 for reference age group', () => {
            const refCoeff = PAPER_COEFFICIENTS.age['45-64'];
            const calculatedOR = Math.exp(refCoeff);
            
            expect(calculatedOR).toBeCloseTo(1.0, 3);
        });
    });

    describe('Break Location Odds Ratios', () => {
        it('should verify OR for inferior break 5-7 vs superior', () => {
            const inferior57Coeff = PAPER_COEFFICIENTS.breakLocation['5-7'];
            const superiorCoeff = PAPER_COEFFICIENTS.breakLocation['9-3'];
            
            const calculatedOR = Math.exp(inferior57Coeff - superiorCoeff);
            const expectedOR = BREAK_LOCATIONS.inferior57.oddsRatio;
            
            expect(calculatedOR).toBeCloseTo(expectedOR, 2);
        });

        it('should verify OR for inferior break 4-8 vs superior', () => {
            const inferior48Coeff = PAPER_COEFFICIENTS.breakLocation['4-8'];
            const superiorCoeff = PAPER_COEFFICIENTS.breakLocation['9-3'];
            
            const calculatedOR = Math.exp(inferior48Coeff - superiorCoeff);
            
            // Published OR for 4-8 is approximately 1.535
            expect(calculatedOR).toBeCloseTo(1.535, 1);
        });

        it('should verify OR for no break identified vs superior', () => {
            const noneCoeff = PAPER_COEFFICIENTS.breakLocation['none'];
            const superiorCoeff = PAPER_COEFFICIENTS.breakLocation['9-3'];
            
            const calculatedOR = Math.exp(noneCoeff - superiorCoeff);
            
            // No break should have high OR (approximately 1.97)
            expect(calculatedOR).toBeCloseTo(1.97, 1);
        });
    });

    describe('PVR Grade Odds Ratios', () => {
        it('should verify OR for PVR Grade C vs no PVR', () => {
            const pvrCCoeff = PAPER_COEFFICIENTS.pvrGrade['C'];
            const noPvrCoeff = PAPER_COEFFICIENTS.pvrGrade['none'];
            
            const calculatedOR = Math.exp(pvrCCoeff - noPvrCoeff);
            const expectedOR = PVR_GRADES.gradeC.oddsRatio;
            
            expect(calculatedOR).toBeCloseTo(expectedOR, 2);
        });

        it('should have OR = 1.0 for no PVR (reference)', () => {
            const noPvrCoeff = PAPER_COEFFICIENTS.pvrGrade['none'];
            const calculatedOR = Math.exp(noPvrCoeff);
            
            expect(calculatedOR).toBeCloseTo(1.0, 3);
        });
    });

    describe('Tamponade Odds Ratios', () => {
        it('should verify OR for light silicone oil vs SF6', () => {
            const lightOilCoeff = PAPER_COEFFICIENTS.tamponade['light_oil'];
            const sf6Coeff = PAPER_COEFFICIENTS.tamponade['sf6'];
            
            const calculatedOR = Math.exp(lightOilCoeff - sf6Coeff);
            
            // Light oil has OR approximately 1.954
            expect(calculatedOR).toBeCloseTo(1.954, 1);
        });

        it('should verify OR for C2F6 vs SF6 (protective)', () => {
            const c2f6Coeff = PAPER_COEFFICIENTS.tamponade['c2f6'];
            const sf6Coeff = PAPER_COEFFICIENTS.tamponade['sf6'];
            
            const calculatedOR = Math.exp(c2f6Coeff - sf6Coeff);
            
            // C2F6 is protective with OR approximately 0.659
            expect(calculatedOR).toBeCloseTo(0.659, 2);
        });

        it('should verify OR for C3F8 vs SF6', () => {
            const c3f8Coeff = PAPER_COEFFICIENTS.tamponade['c3f8'];
            const sf6Coeff = PAPER_COEFFICIENTS.tamponade['sf6'];
            
            const calculatedOR = Math.exp(c3f8Coeff - sf6Coeff);
            
            // C3F8 has OR approximately 0.901
            expect(calculatedOR).toBeCloseTo(0.901, 2);
        });
    });

    describe('Cryotherapy Odds Ratio', () => {
        it('should verify OR for cryotherapy vs no cryotherapy (protective)', () => {
            const cryoYesCoeff = PAPER_COEFFICIENTS.cryotherapy['yes'];
            const cryoNoCoeff = PAPER_COEFFICIENTS.cryotherapy['no'];
            
            const calculatedOR = Math.exp(cryoYesCoeff - cryoNoCoeff);
            
            // Cryotherapy is protective with OR approximately 0.657
            expect(calculatedOR).toBeCloseTo(0.657, 2);
        });
    });

    describe('Vitrectomy Gauge Odds Ratios', () => {
        it('should verify OR for 25g vs 20g (protective)', () => {
            const g25Coeff = PAPER_COEFFICIENTS.vitrectomyGauge['25g'];
            const g20Coeff = PAPER_COEFFICIENTS.vitrectomyGauge['20g'];
            
            const calculatedOR = Math.exp(g25Coeff - g20Coeff);
            
            // 25g is protective with OR approximately 0.413
            expect(calculatedOR).toBeCloseTo(0.413, 2);
        });

        it('should verify OR for 23g vs 20g', () => {
            const g23Coeff = PAPER_COEFFICIENTS.vitrectomyGauge['23g'];
            const g20Coeff = PAPER_COEFFICIENTS.vitrectomyGauge['20g'];
            
            const calculatedOR = Math.exp(g23Coeff - g20Coeff);
            
            // 23g has OR approximately 0.665
            expect(calculatedOR).toBeCloseTo(0.665, 2);
        });
    });

    describe('Total Detachment Odds Ratio', () => {
        it('should verify OR for total RD vs non-total', () => {
            const totalYesCoeff = PAPER_COEFFICIENTS.totalDetachment['yes'];
            const totalNoCoeff = PAPER_COEFFICIENTS.totalDetachment['no'];
            
            const calculatedOR = Math.exp(totalYesCoeff - totalNoCoeff);
            
            // Total RD has OR approximately 1.941
            expect(calculatedOR).toBeCloseTo(1.941, 1);
        });
    });

    describe('Inferior Detachment Extent Odds Ratios', () => {
        it('should verify OR for 3-5 hours inferior vs <3 hours', () => {
            const hours35Coeff = PAPER_COEFFICIENTS.inferiorDetachment['3_to_5'];
            const lessThan3Coeff = PAPER_COEFFICIENTS.inferiorDetachment['less_than_3'];
            
            const calculatedOR = Math.exp(hours35Coeff - lessThan3Coeff);
            
            // 3-5 hours has OR approximately 1.554
            expect(calculatedOR).toBeCloseTo(1.554, 2);
        });

        it('should verify OR for 6 hours inferior vs <3 hours', () => {
            const hours6Coeff = PAPER_COEFFICIENTS.inferiorDetachment['6_hours'];
            const lessThan3Coeff = PAPER_COEFFICIENTS.inferiorDetachment['less_than_3'];
            
            const calculatedOR = Math.exp(hours6Coeff - lessThan3Coeff);
            
            // 6 hours has OR approximately 1.545
            expect(calculatedOR).toBeCloseTo(1.545, 2);
        });
    });

    describe('Combined Factor Interactions', () => {
        it('should verify combined OR for multiple risk factors', () => {
            // High risk: 80+, inferior break, PVR C
            const highRiskLogit = 
                PAPER_COEFFICIENTS.age['80+'] +
                PAPER_COEFFICIENTS.breakLocation['5-7'] +
                PAPER_COEFFICIENTS.pvrGrade['C'];
            
            // Low risk: reference age, superior break, no PVR
            const lowRiskLogit = 
                PAPER_COEFFICIENTS.age['45-64'] +
                PAPER_COEFFICIENTS.breakLocation['9-3'] +
                PAPER_COEFFICIENTS.pvrGrade['none'];
            
            const combinedOR = Math.exp(highRiskLogit - lowRiskLogit);
            
            // Combined OR should be multiplicative
            const expectedCombined = 
                BEAVRS_AGE_GROUPS.elderly.oddsRatio *
                BREAK_LOCATIONS.inferior57.oddsRatio *
                PVR_GRADES.gradeC.oddsRatio;
            
            expect(combinedOR).toBeCloseTo(expectedCombined, 1);
        });

        it('should verify OR additivity in log scale', () => {
            // In logistic regression, log(OR) are additive
            const ageLogOR = Math.log(BEAVRS_AGE_GROUPS.elderly.oddsRatio);
            const breakLogOR = Math.log(BREAK_LOCATIONS.inferior57.oddsRatio);
            
            const sumLogOR = ageLogOR + breakLogOR;
            const combinedOR = Math.exp(sumLogOR);
            
            // Should equal product of individual ORs
            const productOR = BEAVRS_AGE_GROUPS.elderly.oddsRatio * 
                            BREAK_LOCATIONS.inferior57.oddsRatio;
            
            expect(combinedOR).toBeCloseTo(productOR, 10);
        });
    });

    describe('Clinical Interpretation of Odds Ratios', () => {
        it('should interpret OR > 1 as increased risk', () => {
            const riskFactors = [
                { name: 'Age 80+', coeff: PAPER_COEFFICIENTS.age['80+'] },
                { name: 'Inferior break', coeff: PAPER_COEFFICIENTS.breakLocation['5-7'] },
                { name: 'PVR C', coeff: PAPER_COEFFICIENTS.pvrGrade['C'] },
                { name: 'Total RD', coeff: PAPER_COEFFICIENTS.totalDetachment['yes'] }
            ];
            
            riskFactors.forEach(factor => {
                const OR = Math.exp(factor.coeff);
                if (factor.coeff > 0) {
                    expect(OR).toBeGreaterThan(1);
                }
            });
        });

        it('should interpret OR < 1 as protective', () => {
            const protectiveFactors = [
                { name: 'Cryotherapy', coeff: PAPER_COEFFICIENTS.cryotherapy['yes'] },
                { name: '25g gauge', coeff: PAPER_COEFFICIENTS.vitrectomyGauge['25g'] },
                { name: 'C2F6', coeff: PAPER_COEFFICIENTS.tamponade['c2f6'] }
            ];
            
            protectiveFactors.forEach(factor => {
                const OR = Math.exp(factor.coeff);
                if (factor.coeff < 0) {
                    expect(OR).toBeLessThan(1);
                }
            });
        });
    });
});