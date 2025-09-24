/**
 * Tests for derivedStandardErrors.js
 * 
 * These tests verify the standard error calculations derived from
 * p-values and coefficients using statistical z-scores.
 * 
 * We use real calculations to ensure the mathematical accuracy
 * of these medical statistical functions.
 */

import { 
    DERIVED_STANDARD_ERRORS, 
    printDerivedStandardErrors,
    compareWithEstimatedSEs 
} from '../derivedStandardErrors';
import { PAPER_COEFFICIENTS } from '../../constants/paperCoefficients';

describe('derivedStandardErrors', () => {
    // Helper function to calculate SE from coefficient and p-value
    const calculateSE = (coefficient, pValue) => {
        if (pValue === null || coefficient === 0) {
            return 0; // Reference category
        }
        
        // Map p-values to z-scores
        let zScore;
        if (pValue <= 0.001) zScore = 3.291;
        else if (pValue <= 0.006) zScore = 2.75;
        else if (pValue <= 0.011) zScore = 2.54;
        else if (pValue <= 0.014) zScore = 2.46;
        else if (pValue <= 0.05) zScore = 1.96;
        else zScore = 1.645;
        
        return Math.abs(coefficient) / zScore;
    };

    describe('DERIVED_STANDARD_ERRORS structure', () => {
        test('should have all required categories', () => {
            const expectedCategories = [
                'constant', 'age', 'breakLocation', 'inferiorDetachment',
                'totalDetachment', 'pvrGrade', 'cryotherapy', 'tamponade', 'vitrectomyGauge'
            ];
            
            expectedCategories.forEach(category => {
                expect(DERIVED_STANDARD_ERRORS).toHaveProperty(category);
            });
        });

        test('constant should be derived from highly significant p-value', () => {
            // Constant coefficient is -1.611 with p < 0.001
            const expectedSE = Math.abs(-1.611) / 3.291;
            expect(DERIVED_STANDARD_ERRORS.constant).toBeCloseTo(expectedSE, 10);
            expect(DERIVED_STANDARD_ERRORS.constant).toBeCloseTo(0.4895, 3);
        });

        test('reference categories should have SE = 0', () => {
            expect(DERIVED_STANDARD_ERRORS.age['45-64']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.breakLocation['9-3']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.inferiorDetachment['less_than_3']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.totalDetachment['no']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.pvrGrade['none']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.cryotherapy['no']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.tamponade['sf6']).toBe(0);
            expect(DERIVED_STANDARD_ERRORS.vitrectomyGauge['20g']).toBe(0);
        });
    });

    describe('Standard Error calculations from p-values', () => {
        describe('Age category SEs', () => {
            test('65-79 should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.age['65-79']; // 0.236
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.age['65-79']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.age['65-79']).toBeCloseTo(0.1204, 4);
            });

            test('80+ should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.age['80+']; // 0.498
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.age['80+']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.age['80+']).toBeCloseTo(0.2541, 4);
            });

            test('<45 should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.age['<45']; // 0.459
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.age['<45']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.age['<45']).toBeCloseTo(0.2342, 4);
            });
        });

        describe('Break location SEs', () => {
            test('4-8 should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.breakLocation['4-8']; // 0.428
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.breakLocation['4-8']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.breakLocation['4-8']).toBeCloseTo(0.2184, 4);
            });

            test('5-7 should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.breakLocation['5-7']; // 0.607
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.breakLocation['5-7']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.breakLocation['5-7']).toBeCloseTo(0.3097, 4);
            });

            test('none should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.breakLocation['none']; // 0.676
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.breakLocation['none']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.breakLocation['none']).toBeCloseTo(0.3449, 4);
            });
        });

        describe('Inferior detachment SEs', () => {
            test('3_to_5 should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.inferiorDetachment['3_to_5']; // 0.441
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.inferiorDetachment['3_to_5']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.inferiorDetachment['3_to_5']).toBeCloseTo(0.2250, 4);
            });

            test('6_hours should be correctly calculated (p < 0.05)', () => {
                const coef = PAPER_COEFFICIENTS.inferiorDetachment['6_hours']; // 0.435
                const expectedSE = Math.abs(coef) / 1.96;
                expect(DERIVED_STANDARD_ERRORS.inferiorDetachment['6_hours']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.inferiorDetachment['6_hours']).toBeCloseTo(0.2219, 4);
            });
        });

        describe('Highly significant predictors (p < 0.001)', () => {
            test('totalDetachment yes should use z=3.291', () => {
                const coef = PAPER_COEFFICIENTS.totalDetachment['yes']; // 0.663
                const expectedSE = Math.abs(coef) / 3.291;
                expect(DERIVED_STANDARD_ERRORS.totalDetachment['yes']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.totalDetachment['yes']).toBeCloseTo(0.2015, 4);
            });

            test('pvrGrade C should use z=3.291', () => {
                const coef = PAPER_COEFFICIENTS.pvrGrade['C']; // 0.220
                const expectedSE = Math.abs(coef) / 3.291;
                expect(DERIVED_STANDARD_ERRORS.pvrGrade['C']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.pvrGrade['C']).toBeCloseTo(0.0668, 3);
            });

            test('tamponade light_oil should use z=3.291', () => {
                const coef = PAPER_COEFFICIENTS.tamponade['light_oil']; // 0.670
                const expectedSE = Math.abs(coef) / 3.291;
                expect(DERIVED_STANDARD_ERRORS.tamponade['light_oil']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.tamponade['light_oil']).toBeCloseTo(0.2036, 4);
            });
        });

        describe('Specific p-value calculations', () => {
            test('cryotherapy yes should use z=2.54 (p=0.011)', () => {
                const coef = PAPER_COEFFICIENTS.cryotherapy['yes']; // -0.420
                const expectedSE = Math.abs(coef) / 2.54;
                expect(DERIVED_STANDARD_ERRORS.cryotherapy['yes']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.cryotherapy['yes']).toBeCloseTo(0.1654, 4);
            });

            test('tamponade c2f6 should use z=2.75 (p=0.006)', () => {
                const coef = PAPER_COEFFICIENTS.tamponade['c2f6']; // -0.417
                const expectedSE = Math.abs(coef) / 2.75;
                expect(DERIVED_STANDARD_ERRORS.tamponade['c2f6']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.tamponade['c2f6']).toBeCloseTo(0.1516, 4);
            });

            test('vitrectomyGauge 25g should use z=2.46 (p=0.014)', () => {
                const coef = PAPER_COEFFICIENTS.vitrectomyGauge['25g']; // -0.885
                const expectedSE = Math.abs(coef) / 2.46;
                expect(DERIVED_STANDARD_ERRORS.vitrectomyGauge['25g']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.vitrectomyGauge['25g']).toBeCloseTo(0.3598, 4);
            });
        });

        describe('Non-significant predictors (p > 0.05)', () => {
            test('tamponade c3f8 should use z=1.645 (p < 0.10)', () => {
                const coef = PAPER_COEFFICIENTS.tamponade['c3f8']; // -0.104
                const expectedSE = Math.abs(coef) / 1.645;
                expect(DERIVED_STANDARD_ERRORS.tamponade['c3f8']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.tamponade['c3f8']).toBeCloseTo(0.0632, 4);
            });

            test('tamponade air should use z=1.645 (p < 0.10)', () => {
                const coef = PAPER_COEFFICIENTS.tamponade['air']; // -0.159
                const expectedSE = Math.abs(coef) / 1.645;
                expect(DERIVED_STANDARD_ERRORS.tamponade['air']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.tamponade['air']).toBeCloseTo(0.0967, 4);
            });

            test('vitrectomyGauge 23g should use z=1.645 (p < 0.10)', () => {
                const coef = PAPER_COEFFICIENTS.vitrectomyGauge['23g']; // -0.408
                const expectedSE = Math.abs(coef) / 1.645;
                expect(DERIVED_STANDARD_ERRORS.vitrectomyGauge['23g']).toBeCloseTo(expectedSE, 10);
                expect(DERIVED_STANDARD_ERRORS.vitrectomyGauge['23g']).toBeCloseTo(0.2480, 3);
            });
        });
    });

    describe('Z-score verification', () => {
        test('z-scores should match expected statistical significance', () => {
            // Highly significant (z > 3.0)
            const totalDetZ = PAPER_COEFFICIENTS.totalDetachment['yes'] / DERIVED_STANDARD_ERRORS.totalDetachment['yes'];
            expect(Math.abs(totalDetZ)).toBeCloseTo(3.291, 2);

            const pvrZ = PAPER_COEFFICIENTS.pvrGrade['C'] / DERIVED_STANDARD_ERRORS.pvrGrade['C'];
            expect(Math.abs(pvrZ)).toBeCloseTo(3.291, 2);

            // Moderately significant (z ≈ 2.5)
            const cryoZ = PAPER_COEFFICIENTS.cryotherapy['yes'] / DERIVED_STANDARD_ERRORS.cryotherapy['yes'];
            expect(Math.abs(cryoZ)).toBeCloseTo(2.54, 2);

            const c2f6Z = PAPER_COEFFICIENTS.tamponade['c2f6'] / DERIVED_STANDARD_ERRORS.tamponade['c2f6'];
            expect(Math.abs(c2f6Z)).toBeCloseTo(2.75, 2);

            // Standard significance (z ≈ 1.96)
            const age65Z = PAPER_COEFFICIENTS.age['65-79'] / DERIVED_STANDARD_ERRORS.age['65-79'];
            expect(Math.abs(age65Z)).toBeCloseTo(1.96, 2);

            // Marginal significance (z ≈ 1.645)
            const airZ = PAPER_COEFFICIENTS.tamponade['air'] / DERIVED_STANDARD_ERRORS.tamponade['air'];
            expect(Math.abs(airZ)).toBeCloseTo(1.645, 2);
        });
    });

    describe('printDerivedStandardErrors function', () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        test('should print header', () => {
            printDerivedStandardErrors();
            
            expect(consoleSpy).toHaveBeenCalledWith('Derived Standard Errors from p-values:');
            expect(consoleSpy).toHaveBeenCalledWith('=====================================');
        });

        test('should print constant SE', () => {
            printDerivedStandardErrors();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Constant: 0.4895')
            );
        });

        test('should print all categories', () => {
            printDerivedStandardErrors();
            
            const categories = ['age:', 'breakLocation:', 'inferiorDetachment:', 
                              'totalDetachment:', 'pvrGrade:', 'cryotherapy:', 
                              'tamponade:', 'vitrectomyGauge:'];
            
            categories.forEach(category => {
                expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(category));
            });
        });

        test('should identify reference categories', () => {
            printDerivedStandardErrors();
            
            expect(consoleSpy).toHaveBeenCalledWith('  45-64: Reference category');
            expect(consoleSpy).toHaveBeenCalledWith('  9-3: Reference category');
            expect(consoleSpy).toHaveBeenCalledWith('  less_than_3: Reference category');
        });

        test('should print details with coefficient, SE, z-score, and p-value', () => {
            printDerivedStandardErrors();
            
            const calls = consoleSpy.mock.calls.map(call => call[0]);
            
            // Check for a specific detailed output - totalDetachment yes
            const totalDetDetail = calls.find(call => call && call.includes('yes: Coef=0.663'));
            expect(totalDetDetail).toBeDefined();
            expect(totalDetDetail).toContain('SE=0.2015');
            expect(totalDetDetail).toContain('z=3.29');
            expect(totalDetDetail).toContain('p=0.001');
        });
    });

    describe('compareWithEstimatedSEs function', () => {
        let consoleSpy;
        let originalRequire;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            // Mock the require to avoid dependency issues in tests
            originalRequire = global.require;
        });

        afterEach(() => {
            consoleSpy.mockRestore();
            global.require = originalRequire;
        });

        test('should handle missing confidenceIntervals module gracefully', () => {
            // Mock require to throw error (simulating missing module)
            global.require = jest.fn(() => {
                throw new Error('Module not found');
            });

            // Should not throw
            expect(() => compareWithEstimatedSEs()).not.toThrow();
        });

        test('should print comparison header when module exists', () => {
            // Mock the confidenceIntervals module
            global.require = jest.fn(() => ({
                COEFFICIENT_STANDARD_ERRORS: {
                    constant: 0.400,
                    age: { '45-64': 0, '65-79': 0.083, '80+': 0.152, '<45': 0.161 },
                    breakLocation: { '9-3': 0, '4-8': 0.138, '5-7': 0.101, 'none': 0.578 },
                    inferiorDetachment: { 'less_than_3': 0, '3_to_5': 0.107, '6_hours': 0.154 },
                    totalDetachment: { 'no': 0, 'yes': 0.163 },
                    pvrGrade: { 'none': 0, 'C': 0.048 },
                    cryotherapy: { 'no': 0, 'yes': 0.165 },
                    tamponade: { 
                        'sf6': 0, 'c2f6': 0.151, 'c3f8': 0.145, 
                        'air': 0.502, 'light_oil': 0.184, 'heavy_oil': 0.347 
                    },
                    vitrectomyGauge: { 
                        '20g': 0, '23g': 0.362, '25g': 0.360, 
                        '27g': 0.444, 'not_recorded': 0.479 
                    }
                }
            }));

            compareWithEstimatedSEs();
            
            expect(consoleSpy).toHaveBeenCalledWith('\nComparison: Derived vs Estimated SEs');
            expect(consoleSpy).toHaveBeenCalledWith('====================================');
        });

        test('should calculate and report differences', () => {
            // Mock the confidenceIntervals module with known values
            global.require = jest.fn(() => ({
                COEFFICIENT_STANDARD_ERRORS: {
                    constant: 0.400,
                    age: { '45-64': 0, '65-79': 0.083, '80+': 0.152, '<45': 0.161 },
                    totalDetachment: { 'no': 0, 'yes': 0.163 }
                }
            }));

            compareWithEstimatedSEs();
            
            // Should report largest differences
            expect(consoleSpy).toHaveBeenCalledWith('Largest differences:');
            
            // Should calculate average difference
            const calls = consoleSpy.mock.calls.map(call => call[0]);
            const avgDiffLine = calls.find(call => call && call.includes('Average difference:'));
            expect(avgDiffLine).toBeDefined();
        });
    });

    describe('Mathematical consistency checks', () => {
        test('all SEs should be non-negative', () => {
            Object.values(DERIVED_STANDARD_ERRORS).forEach(category => {
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
            // Check some non-reference categories
            expect(DERIVED_STANDARD_ERRORS.age['65-79']).toBeGreaterThan(0);
            expect(DERIVED_STANDARD_ERRORS.totalDetachment['yes']).toBeGreaterThan(0);
            expect(DERIVED_STANDARD_ERRORS.pvrGrade['C']).toBeGreaterThan(0);
            expect(DERIVED_STANDARD_ERRORS.cryotherapy['yes']).toBeGreaterThan(0);
        });

        test('SEs should be reasonable medical values', () => {
            // Standard errors in medical logistic regression typically range from 0.01 to 1.0
            Object.values(DERIVED_STANDARD_ERRORS).forEach(category => {
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

        test('larger coefficients with same p-value should have larger SEs', () => {
            // For variables with p < 0.05 (same z-score)
            // age 80+ (coef=0.498) should have larger SE than age 65-79 (coef=0.236)
            expect(DERIVED_STANDARD_ERRORS.age['80+']).toBeGreaterThan(
                DERIVED_STANDARD_ERRORS.age['65-79']
            );

            // breakLocation 5-7 (coef=0.607) should have larger SE than 4-8 (coef=0.428)
            expect(DERIVED_STANDARD_ERRORS.breakLocation['5-7']).toBeGreaterThan(
                DERIVED_STANDARD_ERRORS.breakLocation['4-8']
            );
        });
    });

    describe('Integration with PAPER_COEFFICIENTS', () => {
        test('every coefficient should have corresponding SE', () => {
            Object.keys(PAPER_COEFFICIENTS).forEach(category => {
                if (category !== 'constant') {
                    expect(DERIVED_STANDARD_ERRORS).toHaveProperty(category);
                    
                    Object.keys(PAPER_COEFFICIENTS[category]).forEach(key => {
                        expect(DERIVED_STANDARD_ERRORS[category]).toHaveProperty(key);
                    });
                }
            });
        });

        test('SE calculation should be consistent with p-value interpretation', () => {
            // Test that highly significant predictors have appropriate z-scores
            const testCases = [
                { 
                    name: 'totalDetachment yes',
                    coef: PAPER_COEFFICIENTS.totalDetachment['yes'],
                    se: DERIVED_STANDARD_ERRORS.totalDetachment['yes'],
                    expectedZ: 3.291,
                    tolerance: 0.01
                },
                {
                    name: 'cryotherapy yes',
                    coef: PAPER_COEFFICIENTS.cryotherapy['yes'],
                    se: DERIVED_STANDARD_ERRORS.cryotherapy['yes'],
                    expectedZ: 2.54,
                    tolerance: 0.01
                },
                {
                    name: 'age 65-79',
                    coef: PAPER_COEFFICIENTS.age['65-79'],
                    se: DERIVED_STANDARD_ERRORS.age['65-79'],
                    expectedZ: 1.96,
                    tolerance: 0.01
                }
            ];

            testCases.forEach(({ name, coef, se, expectedZ, tolerance }) => {
                const actualZ = Math.abs(coef / se);
                expect(actualZ).toBeCloseTo(expectedZ, 2);
            });
        });
    });

    describe('Relationship between derived and actual SEs', () => {
        test('derived SEs should be in reasonable range of actual SEs', () => {
            // Compare some key values with known actual SEs from the paper
            // These won't match exactly but should be in the same ballpark
            
            // Age 65-79: actual SE ≈ 0.083, derived ≈ 0.120
            expect(DERIVED_STANDARD_ERRORS.age['65-79']).toBeGreaterThan(0.05);
            expect(DERIVED_STANDARD_ERRORS.age['65-79']).toBeLessThan(0.20);
            
            // Total detachment: actual SE ≈ 0.163, derived ≈ 0.201
            expect(DERIVED_STANDARD_ERRORS.totalDetachment['yes']).toBeGreaterThan(0.10);
            expect(DERIVED_STANDARD_ERRORS.totalDetachment['yes']).toBeLessThan(0.30);
            
            // PVR Grade C: actual SE ≈ 0.048, derived ≈ 0.067
            expect(DERIVED_STANDARD_ERRORS.pvrGrade['C']).toBeGreaterThan(0.03);
            expect(DERIVED_STANDARD_ERRORS.pvrGrade['C']).toBeLessThan(0.10);
        });
    });
});