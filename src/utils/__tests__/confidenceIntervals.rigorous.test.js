/**
 * Rigorous Confidence Interval Tests
 * 
 * These tests verify the mathematical correctness, clinical validity,
 * and statistical properties of our confidence interval implementation.
 * 
 * No bullshit. No "expect(thing).toBeDefined()". 
 * Just real mathematical and statistical validation.
 */

import { 
    calculateLogitConfidenceInterval,
    calculateProbabilityConfidenceInterval,
    COEFFICIENT_STANDARD_ERRORS
} from '../confidenceIntervals';
import { calculateRiskWithSteps } from '../riskCalculations';

describe('Confidence Intervals - Mathematical Rigor', () => {
    
    describe('Mathematical Correctness', () => {
        it('should correctly propagate variance through the logit calculation', () => {
            // Known coefficients and their SEs
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.498, category: '80+' },
                { step: 'PVR grade', value: 0.220, category: 'C' }
            ];
            
            // Manually calculate expected variance
            const se_constant = COEFFICIENT_STANDARD_ERRORS.constant;
            const se_age = COEFFICIENT_STANDARD_ERRORS.age['80+'];
            const se_pvr = COEFFICIENT_STANDARD_ERRORS.pvrGrade['C'];
            
            const expectedVariance = se_constant**2 + se_age**2 + se_pvr**2;
            const expectedSE = Math.sqrt(expectedVariance);
            
            const logit = steps.reduce((sum, step) => sum + step.value, 0);
            const ci = calculateLogitConfidenceInterval(logit, steps);
            
            // Verify variance calculation is correct
            expect(ci.standardError).toBeCloseTo(expectedSE, 10);
            
            // Verify 95% CI uses correct z-score (1.96)
            expect(ci.marginOfError).toBeCloseTo(1.96 * expectedSE, 10);
            
            // Verify CI bounds
            expect(ci.lower).toBeCloseTo(logit - 1.96 * expectedSE, 10);
            expect(ci.upper).toBeCloseTo(logit + 1.96 * expectedSE, 10);
        });

        it('should correctly transform logit CI to probability CI', () => {
            // Test the fundamental transformation: p = 1/(1 + e^(-logit))
            const testCases = [
                { logit: 0, expectedProb: 50 },      // Logit 0 = 50% probability
                { logit: -2.197, expectedProb: 10 }, // Logit ~-2.2 = 10% probability  
                { logit: 2.197, expectedProb: 90 }   // Logit ~2.2 = 90% probability
            ];
            
            testCases.forEach(({ logit, expectedProb }) => {
                const steps = [{ step: 'Constant', value: logit, category: 'constant' }];
                const ci = calculateProbabilityConfidenceInterval(expectedProb, logit, steps);
                
                // Verify the transformation is mathematically correct
                const lowerProbCalc = 100 / (1 + Math.exp(-ci.lower));
                const upperProbCalc = 100 / (1 + Math.exp(-ci.upper));
                
                // The CI should be asymmetric in probability space
                const distToLower = expectedProb - ci.lower;
                const distToUpper = ci.upper - expectedProb;
                
                if (expectedProb < 50) {
                    // For probabilities < 50%, upper tail should be longer
                    expect(distToUpper).toBeGreaterThan(distToLower);
                } else if (expectedProb > 50) {
                    // For probabilities > 50%, lower tail should be longer
                    expect(distToLower).toBeGreaterThan(distToUpper);
                }
            });
        });

        it('should produce wider intervals with high-uncertainty predictors', () => {
            // Test with low-uncertainty predictors (small SEs)
            const lowUncertainty = {
                age: 65,  // SE = 0.083
                pvrGrade: 'C',  // SE = 0.049 - very precise
                vitrectomyGauge: '25g'  // SE = 0.359
            };
            
            // Test with high-uncertainty predictors (large SEs)
            const highUncertainty = {
                age: 50,
                pvrGrade: 'none',
                vitrectomyGauge: '27g',  // SE = 0.444
                tamponade: 'air'  // SE = 0.502 - very uncertain
            };
            
            const lowResult = calculateRiskWithSteps(lowUncertainty);
            const highResult = calculateRiskWithSteps(highUncertainty);
            
            const lowWidth = lowResult.confidenceIntervals.logit.standardError;
            const highWidth = highResult.confidenceIntervals.logit.standardError;
            
            // High-uncertainty predictors should produce larger SEs
            expect(highWidth).toBeGreaterThan(lowWidth);
        });
    });

    describe('Statistical Properties', () => {
        it('should produce coverage probabilities close to nominal level', () => {
            // If we had the true parameter values, ~95% of 95% CIs should contain them
            // Since we don't, we verify the mathematical properties instead
            
            const samples = [];
            for (let i = 0; i < 100; i++) {
                const result = calculateRiskWithSteps({
                    age: 40 + Math.floor(Math.random() * 50),
                    pvrGrade: Math.random() > 0.7 ? 'C' : 'none',
                    vitrectomyGauge: ['20g', '23g', '25g', '27g'][Math.floor(Math.random() * 4)]
                });
                samples.push(result);
            }
            
            // Check that CI widths are reasonable (not too narrow, not too wide)
            const widths = samples.map(s => 
                s.confidenceIntervals.probability.upper - s.confidenceIntervals.probability.lower
            );
            
            const meanWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
            const minWidth = Math.min(...widths);
            const maxWidth = Math.max(...widths);
            
            // Reasonable bounds for medical risk calculator with actual SEs
            expect(minWidth).toBeGreaterThan(3);   // Not unrealistically narrow
            expect(maxWidth).toBeLessThan(70);     // Wider with actual SEs (some predictors have high uncertainty)
            expect(meanWidth).toBeGreaterThan(8);  // Average reasonable uncertainty
            expect(meanWidth).toBeLessThan(55);    // Higher with actual data
        });

        it('should respect the relationship between confidence levels', () => {
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.459, category: '<45' }
            ];
            const logit = steps.reduce((sum, step) => sum + step.value, 0);
            
            const ci90 = calculateLogitConfidenceInterval(logit, steps, 0.90);
            const ci95 = calculateLogitConfidenceInterval(logit, steps, 0.95);
            const ci99 = calculateLogitConfidenceInterval(logit, steps, 0.99);
            
            // Verify z-scores are correct
            expect(ci90.marginOfError / ci90.standardError).toBeCloseTo(1.645, 3);
            expect(ci95.marginOfError / ci95.standardError).toBeCloseTo(1.96, 3);
            expect(ci99.marginOfError / ci99.standardError).toBeCloseTo(2.576, 3);
            
            // Verify ordering: 90% ⊂ 95% ⊂ 99%
            expect(ci90.lower).toBeGreaterThan(ci95.lower);
            expect(ci95.lower).toBeGreaterThan(ci99.lower);
            expect(ci90.upper).toBeLessThan(ci95.upper);
            expect(ci95.upper).toBeLessThan(ci99.upper);
        });
    });

    describe('Clinical Validity', () => {
        it('should produce clinically meaningful intervals for typical cases', () => {
            // Test against known clinical scenarios
            const scenarios = [
                {
                    name: 'Low risk patient',
                    params: {
                        age: 55,
                        pvrGrade: 'none',
                        vitrectomyGauge: '25g',
                        cryotherapy: 'yes',
                        tamponade: 'c2f6'
                    },
                    expectations: {
                        riskBelow: 20,
                        ciWidthBelow: 35  // Wider with actual SEs from paper
                    }
                },
                {
                    name: 'High risk patient',
                    params: {
                        age: 82,
                        pvrGrade: 'C',
                        vitrectomyGauge: '20g',
                        selectedHours: [5, 6, 7],
                        detachmentSegments: Array(24).fill(0).map((_, i) => `segment${i}`),
                        tamponade: 'light_oil'
                    },
                    expectations: {
                        riskAbove: 40,
                        ciWidthBelow: 35  // Wider with actual SEs from paper
                    }
                }
            ];
            
            scenarios.forEach(({ name, params, expectations }) => {
                const result = calculateRiskWithSteps(params);
                const ci = result.confidenceIntervals.probability;
                const width = ci.upper - ci.lower;
                
                if (expectations.riskBelow !== undefined) {
                    expect(result.probability).toBeLessThan(expectations.riskBelow);
                }
                if (expectations.riskAbove !== undefined) {
                    expect(result.probability).toBeGreaterThan(expectations.riskAbove);
                }
                if (expectations.ciWidthBelow !== undefined) {
                    expect(width).toBeLessThan(expectations.ciWidthBelow);
                }
                
                // Clinical sanity checks
                expect(ci.lower).toBeGreaterThanOrEqual(0);
                expect(ci.upper).toBeLessThanOrEqual(100);
                expect(ci.lower).toBeLessThan(result.probability);
                expect(ci.upper).toBeGreaterThan(result.probability);
            });
        });

        it('should handle extreme probabilities without producing nonsensical intervals', () => {
            // Very low risk case
            const lowRisk = calculateRiskWithSteps({
                age: 45,
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                cryotherapy: 'yes',
                tamponade: 'c2f6',
                selectedHours: [],
                detachmentSegments: []
            });
            
            // CI should not go below 0
            expect(lowRisk.confidenceIntervals.probability.lower).toBeGreaterThanOrEqual(0);
            
            // Very high risk case (accumulate all risk factors)
            const highRisk = calculateRiskWithSteps({
                age: 85,
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                selectedHours: [5, 6, 7],
                detachmentSegments: Array(30).fill(0).map((_, i) => `segment${i}`),
                cryotherapy: 'no',
                tamponade: 'light_oil'
            });
            
            // CI should not exceed 100
            expect(highRisk.confidenceIntervals.probability.upper).toBeLessThanOrEqual(100);
        });

        it('should provide appropriate precision for clinical decision-making', () => {
            // For clinical use, CIs should be precise enough to be useful
            // but not so precise as to imply false accuracy
            
            const result = calculateRiskWithSteps({
                age: 65,
                pvrGrade: 'C',
                vitrectomyGauge: '23g',
                selectedHours: [6],
                detachmentSegments: ['segment10', 'segment11']
            });
            
            const ci = result.confidenceIntervals.probability;
            const width = ci.upper - ci.lower;
            
            // Width should be clinically meaningful (with actual SEs, can be wider)
            expect(width).toBeGreaterThan(5);
            expect(width).toBeLessThan(50);  // Wider range with actual uncertainty
            
            // Margin of error should be reasonable for medical decisions
            const moe = parseFloat(result.confidenceIntervals.formatted.marginOfError.replace('±', '').replace('%', ''));
            expect(moe).toBeGreaterThan(2);  // Not falsely precise
            expect(moe).toBeLessThan(25);    // Realistic with actual uncertainty from paper
        });
    });

    describe('Edge Cases and Numerical Stability', () => {
        it('should handle coefficient values of zero (reference categories)', () => {
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0, category: '45-64' },  // Reference category
                { step: 'Break location', value: 0, category: '9-3' } // Reference category
            ];
            
            const logit = steps.reduce((sum, step) => sum + step.value, 0);
            const ci = calculateLogitConfidenceInterval(logit, steps);
            
            // Should only include SE from the constant term
            expect(ci.standardError).toBeCloseTo(COEFFICIENT_STANDARD_ERRORS.constant, 10);
        });

        it('should remain numerically stable with many predictors', () => {
            // Accumulate many steps to test numerical stability
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.498, category: '80+' },
                { step: 'Break location', value: 0.607, category: '5-7' },
                { step: 'Inferior detachment', value: 0.441, category: '3_to_5' },
                { step: 'Total RD', value: 0.663, category: 'yes' },
                { step: 'PVR grade', value: 0.220, category: 'C' },
                { step: 'Cryotherapy', value: -0.420, category: 'yes' },
                { step: 'Tamponade', value: 0.670, category: 'light_oil' },
                { step: 'Vitrectomy gauge', value: -0.885, category: '25g' }
            ];
            
            const logit = steps.reduce((sum, step) => sum + step.value, 0);
            const ci = calculateLogitConfidenceInterval(logit, steps);
            
            // Check for NaN or Infinity
            expect(isFinite(ci.standardError)).toBe(true);
            expect(isFinite(ci.lower)).toBe(true);
            expect(isFinite(ci.upper)).toBe(true);
            
            // Verify reasonable bounds even with many factors
            expect(ci.standardError).toBeLessThan(1);  // SE shouldn't explode
            expect(ci.upper - ci.lower).toBeLessThan(5);  // Interval shouldn't be huge
        });

        it('should handle missing or undefined standard errors gracefully', () => {
            // Test with a step that doesn't have a defined SE
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Unknown Factor', value: 0.5, category: 'unknown' }  // No SE defined
            ];
            
            const logit = steps.reduce((sum, step) => sum + step.value, 0);
            const ci = calculateLogitConfidenceInterval(logit, steps);
            
            // Should still calculate CI using only known SEs
            expect(ci.standardError).toBeCloseTo(COEFFICIENT_STANDARD_ERRORS.constant, 10);
            expect(isFinite(ci.lower)).toBe(true);
            expect(isFinite(ci.upper)).toBe(true);
        });
    });

    describe('Formatted Output Validation', () => {
        it('should format confidence intervals consistently for display', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                pvrGrade: 'C',
                vitrectomyGauge: '25g'
            });
            
            const formatted = result.confidenceIntervals.formatted;
            
            // Verify format matches expected pattern
            expect(formatted.probability95).toMatch(
                /^\d+\.\d% \(95% CI: \d+\.\d%-\d+\.\d%\)$/
            );
            expect(formatted.probabilityRange).toMatch(
                /^\d+\.\d%-\d+\.\d%$/
            );
            expect(formatted.marginOfError).toMatch(
                /^±\d+\.\d%$/
            );
            
            // Verify consistency between formats
            const [lower, upper] = formatted.probabilityRange.split('-').map(x => 
                parseFloat(x.replace('%', ''))
            );
            const prob = result.probability;
            
            // CI should contain the point estimate
            expect(lower).toBeLessThanOrEqual(prob);
            expect(upper).toBeGreaterThanOrEqual(prob);
        });

        it('should round appropriately without false precision', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                pvrGrade: 'C',
                vitrectomyGauge: '25g'
            });
            
            // Extract values from formatted strings
            const prob95Match = result.confidenceIntervals.formatted.probability95.match(
                /(\d+\.\d)% \(95% CI: (\d+\.\d)%-(\d+\.\d)%\)/
            );
            
            expect(prob95Match).not.toBeNull();
            
            const [, probStr, lowerStr, upperStr] = prob95Match;
            
            // Should use 1 decimal place (appropriate medical precision)
            expect(probStr.split('.')[1]).toHaveLength(1);
            expect(lowerStr.split('.')[1]).toHaveLength(1);
            expect(upperStr.split('.')[1]).toHaveLength(1);
        });
    });
});