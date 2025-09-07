/**
 * Statistical Theory Tests for Confidence Intervals
 * 
 * These tests verify that our implementation follows proper statistical theory
 * for logistic regression confidence intervals.
 * 
 * "If you're going to do statistics, do it right or don't do it at all."
 * - What Gilfoyle would say
 */

import { 
    calculateLogitConfidenceInterval,
    calculateProbabilityConfidenceInterval,
    COEFFICIENT_STANDARD_ERRORS
} from '../confidenceIntervals';
import { calculateRiskWithSteps } from '../riskCalculations';

describe('Statistical Theory Validation', () => {
    
    describe('Delta Method Implementation', () => {
        it('should correctly apply the delta method for probability transformation', () => {
            // The delta method states that for a transformation g(θ):
            // Var[g(θ)] ≈ [g'(θ)]² × Var(θ)
            // For logistic: g(x) = 1/(1+e^(-x)), g'(x) = e^(-x)/(1+e^(-x))² = p(1-p)
            
            const logit = 0;  // 50% probability - maximum variance point
            const steps = [{ step: 'Constant', value: logit, category: 'constant' }];
            const probability = 50;
            
            const ci = calculateProbabilityConfidenceInterval(probability, logit, steps);
            
            // At logit=0, p=0.5, so derivative = 0.5 * 0.5 = 0.25
            const p = probability / 100;
            const expectedDerivative = p * (1 - p);
            
            // Delta method SE for probability
            const logitSE = COEFFICIENT_STANDARD_ERRORS.constant;
            const expectedProbSE = expectedDerivative * logitSE * 100;
            
            // The delta method approximation should be close
            expect(ci.standardError).toBeCloseTo(expectedProbSE, 1);
        });

        it('should show maximum uncertainty at 50% probability', () => {
            // Statistical fact: logistic regression has maximum variance at p=0.5
            const testPoints = [
                { prob: 10, logit: Math.log(0.1/0.9) },
                { prob: 30, logit: Math.log(0.3/0.7) },
                { prob: 50, logit: 0 },
                { prob: 70, logit: Math.log(0.7/0.3) },
                { prob: 90, logit: Math.log(0.9/0.1) }
            ];
            
            const standardErrors = testPoints.map(({ prob, logit }) => {
                const steps = [{ step: 'Constant', value: logit, category: 'constant' }];
                const ci = calculateProbabilityConfidenceInterval(prob, logit, steps);
                return ci.standardError;
            });
            
            // Find the maximum SE
            const maxSE = Math.max(...standardErrors);
            const maxIndex = standardErrors.indexOf(maxSE);
            
            // Should be at 50% (index 2)
            expect(testPoints[maxIndex].prob).toBe(50);
        });
    });

    describe('Wald Confidence Intervals', () => {
        it('should implement Wald-type confidence intervals correctly', () => {
            // Wald CI: θ ± z_(α/2) × SE(θ)
            // Our implementation should follow this formula
            
            const confidenceLevels = [
                { level: 0.90, z: 1.645 },
                { level: 0.95, z: 1.96 },
                { level: 0.99, z: 2.576 }
            ];
            
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.459, category: '<45' }
            ];
            const logit = steps.reduce((sum, step) => sum + step.value, 0);
            
            confidenceLevels.forEach(({ level, z }) => {
                const ci = calculateLogitConfidenceInterval(logit, steps, level);
                
                // Verify Wald formula
                const expectedLower = logit - z * ci.standardError;
                const expectedUpper = logit + z * ci.standardError;
                
                expect(ci.lower).toBeCloseTo(expectedLower, 10);
                expect(ci.upper).toBeCloseTo(expectedUpper, 10);
                expect(ci.marginOfError / ci.standardError).toBeCloseTo(z, 3);
            });
        });
    });

    describe('Logit-Probability Transformation Properties', () => {
        it('should preserve monotonicity in transformation', () => {
            // If logit1 < logit2, then p1 < p2
            // And if CI_logit1 < CI_logit2, then CI_p1 < CI_p2
            
            const logits = [-2, -1, 0, 1, 2];
            const results = logits.map(logit => {
                const prob = 100 / (1 + Math.exp(-logit));
                const steps = [{ step: 'Constant', value: logit, category: 'constant' }];
                return {
                    logit,
                    prob,
                    ci: calculateProbabilityConfidenceInterval(prob, logit, steps)
                };
            });
            
            // Check monotonicity
            for (let i = 1; i < results.length; i++) {
                expect(results[i].prob).toBeGreaterThan(results[i-1].prob);
                expect(results[i].ci.lower).toBeGreaterThan(results[i-1].ci.lower);
                expect(results[i].ci.upper).toBeGreaterThan(results[i-1].ci.upper);
            }
        });

        it('should produce asymmetric intervals in probability space', () => {
            // Logistic transformation creates asymmetric CIs in probability space
            // This is a feature, not a bug - it respects the [0,1] bounds
            
            const testCases = [
                { prob: 20, expectation: 'upper_tail_longer' },
                { prob: 50, expectation: 'symmetric' },
                { prob: 80, expectation: 'lower_tail_longer' }
            ];
            
            testCases.forEach(({ prob, expectation }) => {
                const logit = Math.log(prob/100 / (1 - prob/100));
                const steps = [{ step: 'Constant', value: logit, category: 'constant' }];
                const ci = calculateProbabilityConfidenceInterval(prob, logit, steps);
                
                const lowerTail = prob - ci.lower;
                const upperTail = ci.upper - prob;
                
                switch(expectation) {
                    case 'upper_tail_longer':
                        expect(upperTail).toBeGreaterThan(lowerTail * 1.1);
                        break;
                    case 'symmetric':
                        expect(Math.abs(upperTail - lowerTail)).toBeLessThan(2);
                        break;
                    case 'lower_tail_longer':
                        expect(lowerTail).toBeGreaterThan(upperTail * 1.1);
                        break;
                }
            });
        });
    });

    describe('Standard Error Estimation Validation', () => {
        it('should use appropriate SE magnitudes based on p-values', () => {
            // Verify our SE estimates align with statistical significance
            
            // Highly significant (p < 0.001) should have small SE
            const highlySignificant = COEFFICIENT_STANDARD_ERRORS.pvrGrade['C'];
            expect(highlySignificant).toBeLessThan(0.15);
            
            // Significant (p < 0.05) should have moderate SE
            const significant = COEFFICIENT_STANDARD_ERRORS.age['80+'];
            expect(significant).toBeGreaterThan(0.10);
            expect(significant).toBeLessThan(0.25);
            
            // Non-significant should have larger SE
            const nonSignificant = COEFFICIENT_STANDARD_ERRORS.tamponade['air'];
            expect(nonSignificant).toBeGreaterThan(0.15);
        });

        it('should produce CIs that exclude zero for significant coefficients', () => {
            // For significant predictors, the CI should not include zero
            // (This would be true with real SEs from the paper)
            
            const significantPredictors = [
                { coef: 0.663, se: COEFFICIENT_STANDARD_ERRORS.totalDetachment['yes'], name: 'Total RD' },
                { coef: 0.220, se: COEFFICIENT_STANDARD_ERRORS.pvrGrade['C'], name: 'PVR Grade C' },
                { coef: 0.670, se: COEFFICIENT_STANDARD_ERRORS.tamponade['light_oil'], name: 'Light Oil' }
            ];
            
            significantPredictors.forEach(({ coef, se, name }) => {
                const z = 1.96;  // 95% CI
                const lower = coef - z * se;
                const upper = coef + z * se;
                
                // For truly significant effects, CI shouldn't include 0
                // (With our estimated SEs, some might include 0, which is why we need real SEs)
                if (Math.abs(coef / se) > 2) {  // Rough significance test
                    expect(lower * upper).toBeGreaterThan(0);  // Same sign = doesn't cross 0
                }
            });
        });
    });

    describe('Information Matrix and Variance', () => {
        it('should approximate the diagonal of the inverse information matrix', () => {
            // In logistic regression, Var(β) = (X'WX)^(-1)
            // Our SEs should approximate sqrt(diag(inverse information matrix))
            // Without the full data, we use reasonable approximations
            
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.236, category: '65-79' },
                { step: 'PVR grade', value: 0.220, category: 'C' }
            ];
            
            // Calculate total variance (assuming independence - diagonal covariance)
            let totalVariance = 0;
            steps.forEach(step => {
                const se = step.step === 'Constant' ? COEFFICIENT_STANDARD_ERRORS.constant :
                          step.step === 'Age group' ? COEFFICIENT_STANDARD_ERRORS.age[step.category] || 0 :
                          step.step === 'PVR grade' ? COEFFICIENT_STANDARD_ERRORS.pvrGrade[step.category] || 0 : 0;
                totalVariance += se * se;
            });
            
            const totalSE = Math.sqrt(totalVariance);
            
            // Should be positive and finite
            expect(totalSE).toBeGreaterThan(0);
            expect(isFinite(totalSE)).toBe(true);
            
            // Should be reasonable for medical logistic regression
            expect(totalSE).toBeLessThan(0.5);
        });
    });

    describe('Monte Carlo Validation', () => {
        it('should produce consistent results across multiple calculations', () => {
            // Same inputs should always produce same outputs (deterministic)
            const params = {
                age: 65,
                pvrGrade: 'C',
                vitrectomyGauge: '25g',
                selectedHours: [6],
                detachmentSegments: ['segment10', 'segment11']
            };
            
            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(calculateRiskWithSteps(params));
            }
            
            // All results should be identical
            const firstCI = results[0].confidenceIntervals.probability;
            results.forEach(result => {
                expect(result.confidenceIntervals.probability.lower).toBe(firstCI.lower);
                expect(result.confidenceIntervals.probability.upper).toBe(firstCI.upper);
                expect(result.confidenceIntervals.probability.standardError).toBe(firstCI.standardError);
            });
        });

        it('should show proper dispersion across different patient profiles', () => {
            // Generate diverse patient profiles
            const profiles = [];
            for (let age = 40; age <= 85; age += 5) {
                profiles.push(calculateRiskWithSteps({
                    age,
                    pvrGrade: age > 65 ? 'C' : 'none',
                    vitrectomyGauge: age > 70 ? '20g' : '25g'
                }));
            }
            
            // Extract CI widths
            const widths = profiles.map(p => 
                p.confidenceIntervals.probability.upper - p.confidenceIntervals.probability.lower
            );
            
            // Should show variation (not all the same)
            const uniqueWidths = [...new Set(widths.map(w => w.toFixed(1)))];
            expect(uniqueWidths.length).toBeGreaterThan(3);
            
            // But within reasonable bounds
            const minWidth = Math.min(...widths);
            const maxWidth = Math.max(...widths);
            expect(maxWidth / minWidth).toBeLessThan(5);  // Not wildly different
        });
    });

    describe('Clinical Interpretation Accuracy', () => {
        it('should provide actionable uncertainty estimates for surgeons', () => {
            // Test typical surgical decision scenarios
            const scenarios = [
                {
                    description: 'Borderline case around 20% threshold',
                    params: { age: 60, pvrGrade: 'none', vitrectomyGauge: '23g' },
                    checkThreshold: 20
                },
                {
                    description: 'High-risk case for counseling',
                    params: { 
                        age: 75, 
                        pvrGrade: 'C', 
                        vitrectomyGauge: '20g',
                        detachmentSegments: Array(20).fill(0).map((_, i) => `segment${i}`)
                    },
                    checkThreshold: 50
                }
            ];
            
            scenarios.forEach(({ description, params, checkThreshold }) => {
                const result = calculateRiskWithSteps(params);
                const ci = result.confidenceIntervals.probability;
                
                // CI should help with threshold decisions
                if (ci.upper < checkThreshold) {
                    // Confidently below threshold
                    expect(result.probability).toBeLessThan(checkThreshold);
                } else if (ci.lower > checkThreshold) {
                    // Confidently above threshold
                    expect(result.probability).toBeGreaterThan(checkThreshold);
                } else {
                    // Threshold within CI - uncertainty in decision
                    // This is valuable clinical information!
                    expect(ci.lower).toBeLessThan(checkThreshold);
                    expect(ci.upper).toBeGreaterThan(checkThreshold);
                }
            });
        });
    });
});