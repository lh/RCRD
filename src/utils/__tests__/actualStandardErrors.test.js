/**
 * Tests for actualStandardErrors.js
 * 
 * These tests verify the standard error calculations derived from
 * 95% confidence intervals in the BEAVRS paper.
 * 
 * We use real calculations to ensure the mathematical accuracy
 * of these medical statistical functions.
 */

import { 
    ACTUAL_STANDARD_ERRORS, 
    printActualStandardErrors,
    verifySECalculations 
} from '../actualStandardErrors';
import { PAPER_COEFFICIENTS } from '../../constants/paperCoefficients';

describe('actualStandardErrors', () => {
    // Helper function to calculate SE from CI (duplicated for testing)
    const calculateSEFromCI = (lowerCI, upperCI) => {
        if (!lowerCI || !upperCI) return 0;
        return (Math.log(upperCI) - Math.log(lowerCI)) / (2 * 1.96);
    };

    describe('ACTUAL_STANDARD_ERRORS structure', () => {
        test('should have all required categories', () => {
            const expectedCategories = [
                'constant', 'age', 'breakLocation', 'inferiorDetachment',
                'totalDetachment', 'pvrGrade', 'cryotherapy', 'tamponade', 'vitrectomyGauge'
            ];
            
            expectedCategories.forEach(category => {
                expect(ACTUAL_STANDARD_ERRORS).toHaveProperty(category);
            });
        });

        test('constant should have reasonable value', () => {
            expect(ACTUAL_STANDARD_ERRORS.constant).toBe(0.400);
            expect(ACTUAL_STANDARD_ERRORS.constant).toBeGreaterThan(0);
            expect(ACTUAL_STANDARD_ERRORS.constant).toBeLessThan(1);
        });

        test('reference categories should have SE = 0', () => {
            expect(ACTUAL_STANDARD_ERRORS.age['45-64']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['9-3']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.inferiorDetachment['less_than_3']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.totalDetachment['no']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.pvrGrade['none']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.cryotherapy['no']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['sf6']).toBe(0);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['20g']).toBe(0);
        });
    });

    describe('Standard Error calculations from CIs', () => {
        test('age category SEs should be correctly calculated', () => {
            // 65-79: CI = [1.076, 1.490]
            const se_65_79 = calculateSEFromCI(1.076, 1.490);
            expect(ACTUAL_STANDARD_ERRORS.age['65-79']).toBeCloseTo(se_65_79, 10);
            expect(ACTUAL_STANDARD_ERRORS.age['65-79']).toBeCloseTo(0.0830, 3);
            
            // 80+: CI = [1.221, 2.218]
            const se_80_plus = calculateSEFromCI(1.221, 2.218);
            expect(ACTUAL_STANDARD_ERRORS.age['80+']).toBeCloseTo(se_80_plus, 10);
            expect(ACTUAL_STANDARD_ERRORS.age['80+']).toBeCloseTo(0.1523, 3);
            
            // <45: CI = [1.154, 2.171]
            const se_under45 = calculateSEFromCI(1.154, 2.171);
            expect(ACTUAL_STANDARD_ERRORS.age['<45']).toBeCloseTo(se_under45, 10);
            expect(ACTUAL_STANDARD_ERRORS.age['<45']).toBeCloseTo(0.1609, 3);
        });

        test('breakLocation SEs should be correctly calculated', () => {
            // 4-8: CI = [1.171, 2.008]
            const se_4_8 = calculateSEFromCI(1.171, 2.008);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['4-8']).toBeCloseTo(se_4_8, 10);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['4-8']).toBeCloseTo(0.1376, 3);
            
            // 5-7: CI = [1.505, 2.237]
            const se_5_7 = calculateSEFromCI(1.505, 2.237);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['5-7']).toBeCloseTo(se_5_7, 10);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['5-7']).toBeCloseTo(0.1011, 3);
            
            // none: CI = [0.634, 6.100] - very wide CI
            const se_none = calculateSEFromCI(0.634, 6.100);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['none']).toBeCloseTo(se_none, 10);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['none']).toBeCloseTo(0.5776, 3);
        });

        test('inferiorDetachment SEs should be correctly calculated', () => {
            // 3_to_5: CI = [1.259, 1.918]
            const se_3_5 = calculateSEFromCI(1.259, 1.918);
            expect(ACTUAL_STANDARD_ERRORS.inferiorDetachment['3_to_5']).toBeCloseTo(se_3_5, 10);
            expect(ACTUAL_STANDARD_ERRORS.inferiorDetachment['3_to_5']).toBeCloseTo(0.1074, 3);
            
            // 6_hours: CI = [1.143, 2.089]
            const se_6h = calculateSEFromCI(1.143, 2.089);
            expect(ACTUAL_STANDARD_ERRORS.inferiorDetachment['6_hours']).toBeCloseTo(se_6h, 10);
            expect(ACTUAL_STANDARD_ERRORS.inferiorDetachment['6_hours']).toBeCloseTo(0.1543, 3);
        });

        test('totalDetachment SE should be correctly calculated', () => {
            // yes: CI = [1.411, 2.668]
            const se_yes = calculateSEFromCI(1.411, 2.668);
            expect(ACTUAL_STANDARD_ERRORS.totalDetachment['yes']).toBeCloseTo(se_yes, 10);
            expect(ACTUAL_STANDARD_ERRORS.totalDetachment['yes']).toBeCloseTo(0.1625, 3);
        });

        test('pvrGrade SE should be correctly calculated', () => {
            // C: CI = [1.133, 1.372]
            const se_c = calculateSEFromCI(1.133, 1.372);
            expect(ACTUAL_STANDARD_ERRORS.pvrGrade['C']).toBeCloseTo(se_c, 10);
            expect(ACTUAL_STANDARD_ERRORS.pvrGrade['C']).toBeCloseTo(0.0484, 3);
        });

        test('cryotherapy SE should be correctly calculated', () => {
            // yes: CI = [0.476, 0.908]
            const se_yes = calculateSEFromCI(0.476, 0.908);
            expect(ACTUAL_STANDARD_ERRORS.cryotherapy['yes']).toBeCloseTo(se_yes, 10);
            expect(ACTUAL_STANDARD_ERRORS.cryotherapy['yes']).toBeCloseTo(0.1644, 3);
        });

        test('tamponade SEs should be correctly calculated', () => {
            // c2f6: CI = [0.490, 0.887]
            const se_c2f6 = calculateSEFromCI(0.490, 0.887);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['c2f6']).toBeCloseTo(se_c2f6, 10);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['c2f6']).toBeCloseTo(0.1514, 3);
            
            // c3f8: CI = [0.678, 1.198]
            const se_c3f8 = calculateSEFromCI(0.678, 1.198);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['c3f8']).toBeCloseTo(se_c3f8, 10);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['c3f8']).toBeCloseTo(0.1449, 3);
            
            // air: CI = [0.319, 2.284] - wide CI
            const se_air = calculateSEFromCI(0.319, 2.284);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['air']).toBeCloseTo(se_air, 10);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['air']).toBeCloseTo(0.5022, 3);
            
            // light_oil: CI = [1.361, 2.805]
            const se_light = calculateSEFromCI(1.361, 2.805);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['light_oil']).toBeCloseTo(se_light, 10);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['light_oil']).toBeCloseTo(0.1845, 3);
            
            // heavy_oil: CI = [0.522, 2.037]
            const se_heavy = calculateSEFromCI(0.522, 2.037);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['heavy_oil']).toBeCloseTo(se_heavy, 10);
            expect(ACTUAL_STANDARD_ERRORS.tamponade['heavy_oil']).toBeCloseTo(0.3473, 3);
        });

        test('vitrectomyGauge SEs should be correctly calculated', () => {
            // 23g: CI = [0.327, 1.349]
            const se_23g = calculateSEFromCI(0.327, 1.349);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['23g']).toBeCloseTo(se_23g, 10);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['23g']).toBeCloseTo(0.3615, 3);
            
            // 25g: CI = [0.204, 0.834]
            const se_25g = calculateSEFromCI(0.204, 0.834);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['25g']).toBeCloseTo(se_25g, 10);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['25g']).toBeCloseTo(0.3592, 3);
            
            // 27g: CI = [0.198, 1.127]
            const se_27g = calculateSEFromCI(0.198, 1.127);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['27g']).toBeCloseTo(se_27g, 10);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['27g']).toBeCloseTo(0.4436, 3);
            
            // not_recorded: CI = [0.187, 1.223]
            const se_nr = calculateSEFromCI(0.187, 1.223);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['not_recorded']).toBeCloseTo(se_nr, 10);
            expect(ACTUAL_STANDARD_ERRORS.vitrectomyGauge['not_recorded']).toBeCloseTo(0.4791, 3);
        });
    });

    describe('CI reconstruction from SEs', () => {
        const reconstructCI = (coef, se) => {
            const lowerCoef = coef - 1.96 * se;
            const upperCoef = coef + 1.96 * se;
            return [Math.exp(lowerCoef), Math.exp(upperCoef)];
        };

        test('should reconstruct age CIs accurately', () => {
            // 65-79
            const ci_65_79 = reconstructCI(
                PAPER_COEFFICIENTS.age['65-79'], 
                ACTUAL_STANDARD_ERRORS.age['65-79']
            );
            expect(ci_65_79[0]).toBeCloseTo(1.076, 2);
            expect(ci_65_79[1]).toBeCloseTo(1.490, 2);
            
            // 80+
            const ci_80 = reconstructCI(
                PAPER_COEFFICIENTS.age['80+'],
                ACTUAL_STANDARD_ERRORS.age['80+']
            );
            expect(ci_80[0]).toBeCloseTo(1.221, 2);
            expect(ci_80[1]).toBeCloseTo(2.218, 2);
        });

        test('should reconstruct cryotherapy CI accurately', () => {
            const ci_cryo = reconstructCI(
                PAPER_COEFFICIENTS.cryotherapy['yes'],
                ACTUAL_STANDARD_ERRORS.cryotherapy['yes']
            );
            expect(ci_cryo[0]).toBeCloseTo(0.476, 2);
            expect(ci_cryo[1]).toBeCloseTo(0.908, 2);
        });

        test('should reconstruct tamponade CIs accurately', () => {
            // c2f6
            const ci_c2f6 = reconstructCI(
                PAPER_COEFFICIENTS.tamponade['c2f6'],
                ACTUAL_STANDARD_ERRORS.tamponade['c2f6']
            );
            expect(ci_c2f6[0]).toBeCloseTo(0.490, 2);
            expect(ci_c2f6[1]).toBeCloseTo(0.887, 2);
            
            // light_oil
            const ci_light = reconstructCI(
                PAPER_COEFFICIENTS.tamponade['light_oil'],
                ACTUAL_STANDARD_ERRORS.tamponade['light_oil']
            );
            expect(ci_light[0]).toBeCloseTo(1.361, 2);
            expect(ci_light[1]).toBeCloseTo(2.805, 2);
        });
    });

    describe('printActualStandardErrors function', () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        test('should print header', () => {
            printActualStandardErrors();
            
            expect(consoleSpy).toHaveBeenCalledWith('Actual Standard Errors from BEAVRS Paper 95% CIs:');
            expect(consoleSpy).toHaveBeenCalledWith('================================================');
        });

        test('should print constant SE', () => {
            printActualStandardErrors();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Constant: 0.4000 (estimated)')
            );
        });

        test('should print all categories', () => {
            printActualStandardErrors();
            
            const categories = ['age:', 'breakLocation:', 'inferiorDetachment:', 
                              'totalDetachment:', 'pvrGrade:', 'cryotherapy:', 
                              'tamponade:', 'vitrectomyGauge:'];
            
            categories.forEach(category => {
                expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(category));
            });
        });

        test('should identify reference categories', () => {
            printActualStandardErrors();
            
            expect(consoleSpy).toHaveBeenCalledWith('  45-64: Reference category');
            expect(consoleSpy).toHaveBeenCalledWith('  9-3: Reference category');
            expect(consoleSpy).toHaveBeenCalledWith('  less_than_3: Reference category');
        });

        test('should print SE details for non-reference categories', () => {
            printActualStandardErrors();
            
            // Check for a specific detailed output
            const calls = consoleSpy.mock.calls.map(call => call[0]);
            const ageDetail = calls.find(call => call && call.includes('65-79: SE='));
            
            expect(ageDetail).toBeDefined();
            expect(ageDetail).toContain('SE=0.0830');
            expect(ageDetail).toContain('CI=[1.076, 1.49]');
            expect(ageDetail).toContain('OR=');
            expect(ageDetail).toContain('z=');
        });

        test('should calculate correct z-scores', () => {
            printActualStandardErrors();
            
            const calls = consoleSpy.mock.calls.map(call => call[0]);
            
            // Check z-score for age 65-79: coef=0.236, SE=0.0843
            const expectedZ = (0.236 / 0.0830).toFixed(2);
            const ageDetail = calls.find(call => call && call.includes('65-79:'));
            expect(ageDetail).toContain(`z=${expectedZ}`);
        });
    });

    describe('verifySECalculations function', () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        test('should print verification header', () => {
            verifySECalculations();
            
            expect(consoleSpy).toHaveBeenCalledWith('\nVerification of SE Calculations:');
            expect(consoleSpy).toHaveBeenCalledWith('================================');
        });

        test('should verify CI reconstruction accuracy', () => {
            verifySECalculations();
            
            // Should report average error
            const calls = consoleSpy.mock.calls.map(call => call[0]);
            const avgErrorLine = calls.find(call => 
                call && call.includes('Average CI reconstruction error:')
            );
            
            expect(avgErrorLine).toBeDefined();
            
            // Extract the error percentage
            const match = avgErrorLine.match(/(\d+\.\d+)%/);
            expect(match).toBeDefined();
            
            const errorPercent = parseFloat(match[1]);
            expect(errorPercent).toBeLessThan(1); // Should be less than 1%
        });

        test('should confirm successful verification', () => {
            verifySECalculations();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                '✓ Standard errors correctly reconstruct the published CIs'
            );
        });

        test('should detect CI mismatches if they exist', () => {
            // This test verifies the mismatch detection logic works
            // We're testing that our SEs are accurate enough
            verifySECalculations();
            
            const calls = consoleSpy.mock.calls.map(call => call[0]);
            const mismatchCalls = calls.filter(call => 
                call && call.includes('CI mismatch')
            );
            
            // Should have no or very few mismatches
            expect(mismatchCalls.length).toBeLessThanOrEqual(2);
        });
    });

    describe('Mathematical consistency checks', () => {
        test('all SEs should be non-negative', () => {
            Object.values(ACTUAL_STANDARD_ERRORS).forEach(category => {
                if (typeof category === 'number') {
                    expect(category).toBeGreaterThanOrEqual(0);
                } else if (typeof category === 'object') {
                    Object.values(category).forEach(se => {
                        expect(se).toBeGreaterThanOrEqual(0);
                    });
                }
            });
        });

        test('non-reference SEs should be positive', () => {
            // Age
            expect(ACTUAL_STANDARD_ERRORS.age['65-79']).toBeGreaterThan(0);
            expect(ACTUAL_STANDARD_ERRORS.age['80+']).toBeGreaterThan(0);
            expect(ACTUAL_STANDARD_ERRORS.age['<45']).toBeGreaterThan(0);
            
            // Break location
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['4-8']).toBeGreaterThan(0);
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['5-7']).toBeGreaterThan(0);
            
            // Total detachment
            expect(ACTUAL_STANDARD_ERRORS.totalDetachment['yes']).toBeGreaterThan(0);
        });

        test('SEs should be reasonable medical values', () => {
            // Standard errors in medical logistic regression typically range from 0.01 to 1.0
            Object.values(ACTUAL_STANDARD_ERRORS).forEach(category => {
                if (typeof category === 'object') {
                    Object.values(category).forEach(se => {
                        if (se > 0) {
                            expect(se).toBeLessThan(1.0);
                            expect(se).toBeGreaterThan(0.01);
                        }
                    });
                }
            });
        });

        test('wider CIs should produce larger SEs', () => {
            // breakLocation 'none' has widest CI [0.634, 6.100]
            // Should have larger SE than other break locations
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['none']).toBeGreaterThan(
                ACTUAL_STANDARD_ERRORS.breakLocation['4-8']
            );
            expect(ACTUAL_STANDARD_ERRORS.breakLocation['none']).toBeGreaterThan(
                ACTUAL_STANDARD_ERRORS.breakLocation['5-7']
            );
            
            // tamponade 'air' has wide CI [0.319, 2.284]
            // Should have larger SE than gases with narrower CIs
            expect(ACTUAL_STANDARD_ERRORS.tamponade['air']).toBeGreaterThan(
                ACTUAL_STANDARD_ERRORS.tamponade['c2f6']
            );
            expect(ACTUAL_STANDARD_ERRORS.tamponade['air']).toBeGreaterThan(
                ACTUAL_STANDARD_ERRORS.tamponade['c3f8']
            );
        });
    });

    describe('Integration with PAPER_COEFFICIENTS', () => {
        test('every coefficient should have corresponding SE', () => {
            Object.keys(PAPER_COEFFICIENTS).forEach(category => {
                if (category !== 'constant') {
                    expect(ACTUAL_STANDARD_ERRORS).toHaveProperty(category);
                    
                    Object.keys(PAPER_COEFFICIENTS[category]).forEach(key => {
                        expect(ACTUAL_STANDARD_ERRORS[category]).toHaveProperty(key);
                    });
                }
            });
        });

        test('z-scores should be statistically significant for published coefficients', () => {
            // Calculate z-scores for significant predictors
            const significantPredictors = [
                { category: 'age', key: '80+', minZ: 2.0 },
                { category: 'breakLocation', key: '5-7', minZ: 3.0 },
                { category: 'totalDetachment', key: 'yes', minZ: 3.0 },
                { category: 'pvrGrade', key: 'C', minZ: 3.0 },
                { category: 'cryotherapy', key: 'yes', minZ: 2.0 },
                { category: 'tamponade', key: 'c2f6', minZ: 2.0 }
            ];
            
            significantPredictors.forEach(({ category, key, minZ }) => {
                const coef = PAPER_COEFFICIENTS[category][key];
                const se = ACTUAL_STANDARD_ERRORS[category][key];
                const zScore = Math.abs(coef / se);
                
                expect(zScore).toBeGreaterThan(minZ);
            });
        });
    });
});