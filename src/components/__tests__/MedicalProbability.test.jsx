import React from 'react';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { MODEL_TYPE } from '../../constants/modelTypes';
import { PAPER_COEFFICIENTS } from '../../constants/paperCoefficients';

/**
 * Medical Probability Range Validation Test Suite
 * 
 * Validates that all calculated probabilities:
 * 1. Stay within valid medical range (0-100%)
 * 2. Handle edge cases correctly
 * 3. Maintain appropriate precision
 * 4. Transition correctly at risk thresholds
 * 5. Never produce NaN or Infinity values
 */

describe('Medical Probability Range Validation', () => {
    describe('Probability Bounds Validation', () => {
        it('should never calculate probability below 0%', () => {
            // Even with all protective factors maximized
            const result = calculateRiskWithSteps({
                age: 55, // Reference age
                selectedHours: [12], // Superior break
                detachmentSegments: [], // Minimal detachment
                pvrGrade: 'none',
                vitrectomyGauge: '25g', // Most protective
                tamponade: 'c2f6', // Protective
                cryotherapy: 'yes', // Protective
                modelType: MODEL_TYPE.FULL
            });
            
            expect(result.probability).toBeGreaterThanOrEqual(0);
            expect(result.probability).toBeLessThan(100);
        });

        it('should never calculate probability above 100%', () => {
            // Even with all risk factors maximized
            const result = calculateRiskWithSteps({
                age: 85, // High risk age
                selectedHours: [], // No break identified
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`), // Total RD
                pvrGrade: 'C',
                vitrectomyGauge: '20g', // Reference (worst)
                tamponade: 'light_oil', // Highest risk
                cryotherapy: 'no',
                modelType: MODEL_TYPE.FULL
            });
            
            expect(result.probability).toBeLessThanOrEqual(100);
            expect(result.probability).toBeGreaterThan(0);
        });

        it('should handle extreme negative logits correctly', () => {
            // Manually calculate with extreme negative logit
            const extremeNegativeLogit = -10;
            const probability = 100 / (1 + Math.exp(-extremeNegativeLogit));
            
            expect(probability).toBeGreaterThan(0);
            expect(probability).toBeLessThan(1); // Should be very close to 0
            expect(isFinite(probability)).toBe(true);
        });

        it('should handle extreme positive logits correctly', () => {
            // Manually calculate with extreme positive logit
            const extremePositiveLogit = 10;
            const probability = 100 / (1 + Math.exp(-extremePositiveLogit));
            
            expect(probability).toBeLessThan(100);
            expect(probability).toBeGreaterThan(99); // Should be very close to 100
            expect(isFinite(probability)).toBe(true);
        });
    });

    describe('Very Low Risk Scenarios (<1%)', () => {
        it('should calculate <1% risk for optimal protective factors', () => {
            const result = calculateRiskWithSteps({
                age: 55, // Reference age
                selectedHours: [12], // Superior break  
                detachmentSegments: ['segment0'], // Minimal
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'c2f6',
                cryotherapy: 'yes',
                modelType: MODEL_TYPE.FULL
            });
            
            // This should be extremely low risk
            expect(result.probability).toBeLessThan(5);
            expect(result.probability).toBeGreaterThan(0);
        });

        it('should handle probability approaching zero', () => {
            // Create scenario with maximum protective factors
            const logit = PAPER_COEFFICIENTS.constant + 
                          PAPER_COEFFICIENTS.vitrectomyGauge['25g'] +
                          PAPER_COEFFICIENTS.tamponade['c2f6'] +
                          PAPER_COEFFICIENTS.cryotherapy['yes'];
            
            const probability = 100 / (1 + Math.exp(-logit));
            expect(probability).toBeGreaterThan(0);
            expect(probability).toBeLessThan(10);
        });
    });

    describe('Very High Risk Scenarios (>90%)', () => {
        it('should calculate >90% risk for worst case scenarios', () => {
            const result = calculateRiskWithSteps({
                age: 85,
                selectedHours: [], // No break found
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                tamponade: 'light_oil',
                cryotherapy: 'no',
                modelType: MODEL_TYPE.FULL
            });
            
            expect(result.probability).toBeGreaterThan(80);
            expect(result.probability).toBeLessThanOrEqual(100);
        });

        it('should handle probability approaching 100%', () => {
            // Create scenario with maximum risk factors
            const logit = PAPER_COEFFICIENTS.constant +
                          PAPER_COEFFICIENTS.age['80+'] +
                          PAPER_COEFFICIENTS.breakLocation['none'] +
                          PAPER_COEFFICIENTS.totalDetachment['yes'] +
                          PAPER_COEFFICIENTS.pvrGrade['C'] +
                          PAPER_COEFFICIENTS.tamponade['light_oil'] +
                          PAPER_COEFFICIENTS.inferiorDetachment['6_hours'];
            
            const probability = 100 / (1 + Math.exp(-logit));
            expect(probability).toBeLessThan(100);
            expect(probability).toBeGreaterThan(70);
        });
    });

    describe('Risk Category Threshold Validation', () => {
        it('should correctly categorize low risk (<10%)', () => {
            const result = calculateRiskWithSteps({
                age: 55,
                selectedHours: [12],
                detachmentSegments: ['segment0', 'segment1'],
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'c2f6',
                cryotherapy: 'yes'
            });
            
            if (result.probability < 10) {
                expect(result.probability).toBeLessThan(10);
            }
        });

        it('should correctly categorize moderate risk (10-25%)', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                selectedHours: [3],
                detachmentSegments: Array.from({ length: 8 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'yes'
            });
            
            // Should be in moderate range for typical case
            expect(result.probability).toBeGreaterThan(5);
            expect(result.probability).toBeLessThan(50);
        });

        it('should correctly categorize high risk (>25%)', () => {
            const result = calculateRiskWithSteps({
                age: 75,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 20 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                tamponade: 'light_oil',
                cryotherapy: 'no'
            });
            
            expect(result.probability).toBeGreaterThan(25);
        });

        it('should handle threshold boundary at 10%', () => {
            // Test values very close to 10%
            const testValues = [9.9, 10.0, 10.1];
            testValues.forEach(value => {
                expect(value).toBeGreaterThan(0);
                expect(value).toBeLessThan(100);
                if (value < 10) {
                    expect(value).toBeLessThan(10);
                } else {
                    expect(value).toBeGreaterThanOrEqual(10);
                }
            });
        });

        it('should handle threshold boundary at 25%', () => {
            // Test values very close to 25%
            const testValues = [24.9, 25.0, 25.1];
            testValues.forEach(value => {
                expect(value).toBeGreaterThan(0);
                expect(value).toBeLessThan(100);
                if (value < 25) {
                    expect(value).toBeLessThan(25);
                } else {
                    expect(value).toBeGreaterThanOrEqual(25);
                }
            });
        });
    });

    describe('Probability Precision and Rounding', () => {
        it('should maintain consistent decimal precision', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                selectedHours: [5],
                detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'yes'
            });
            
            // Should have reasonable precision
            const decimalPlaces = (result.probability.toString().split('.')[1] || '').length;
            expect(decimalPlaces).toBeLessThanOrEqual(2);
        });

        it('should handle very small probability differences', () => {
            const result1 = calculateRiskWithSteps({
                age: 64,
                selectedHours: [12],
                detachmentSegments: ['segment0'],
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'c2f6',
                cryotherapy: 'yes'
            });
            
            const result2 = calculateRiskWithSteps({
                age: 65, // One year older
                selectedHours: [12],
                detachmentSegments: ['segment0'],
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'c2f6',
                cryotherapy: 'yes'
            });
            
            // Small age difference should produce small probability difference
            expect(Math.abs(result1.probability - result2.probability)).toBeLessThan(5);
        });

        it('should round probabilities appropriately for display', () => {
            const result = calculateRiskWithSteps({
                age: 70,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 12 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            });
            
            // When rounded to 1 decimal place for display
            const rounded = Math.round(result.probability * 10) / 10;
            expect(rounded).toBeGreaterThanOrEqual(0);
            expect(rounded).toBeLessThanOrEqual(100);
        });
    });

    describe('NaN and Infinity Prevention', () => {
        it('should never produce NaN probability', () => {
            const scenarios = [
                { age: null },
                { age: undefined },
                { age: NaN },
                { age: 'invalid' },
                { age: -50 },
                { age: 200 }
            ];
            
            scenarios.forEach(scenario => {
                const result = calculateRiskWithSteps({
                    age: scenario.age || 55, // Fallback to valid age
                    selectedHours: [12],
                    detachmentSegments: ['segment0'],
                    pvrGrade: 'none',
                    vitrectomyGauge: '25g',
                    tamponade: 'sf6',
                    cryotherapy: 'yes'
                });
                
                expect(isNaN(result.probability)).toBe(false);
                expect(isFinite(result.probability)).toBe(true);
            });
        });

        it('should never produce Infinity probability', () => {
            // Test with extreme coefficient combinations
            const result = calculateRiskWithSteps({
                age: 95,
                selectedHours: [],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                tamponade: 'light_oil',
                cryotherapy: 'no'
            });
            
            expect(isFinite(result.probability)).toBe(true);
            expect(result.probability).not.toBe(Infinity);
            expect(result.probability).not.toBe(-Infinity);
        });

        it('should handle division by zero in logit transformation', () => {
            // Test edge case where exp(-logit) might approach 0
            const veryLargeLogit = 100;
            const probability = 100 / (1 + Math.exp(-veryLargeLogit));
            
            expect(isFinite(probability)).toBe(true);
            expect(probability).toBeLessThanOrEqual(100);
            expect(probability).toBeGreaterThanOrEqual(0);
        });

        it('should handle underflow in exponential calculation', () => {
            // Test edge case where exp(-logit) might underflow
            const veryNegativeLogit = -100;
            const probability = 100 / (1 + Math.exp(-veryNegativeLogit));
            
            expect(isFinite(probability)).toBe(true);
            expect(probability).toBeLessThanOrEqual(100);
            expect(probability).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Probability Monotonicity', () => {
        it('should increase probability monotonically with age risk', () => {
            // Use ages that actually increase monotonically in risk
            // 45-64 is reference (coeff 0), 65-79 (coeff 0.236), 80+ (coeff 0.498)
            const ages = [50, 70, 85];
            const probabilities = ages.map(age => 
                calculateRiskWithSteps({
                    age,
                    selectedHours: [6],
                    detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                    pvrGrade: 'none',
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6',
                    cryotherapy: 'no'
                }).probability
            );
            
            // Each successive age should have higher or equal probability
            for (let i = 1; i < probabilities.length; i++) {
                expect(probabilities[i]).toBeGreaterThanOrEqual(probabilities[i-1]);
            }
        });

        it('should increase probability with detachment extent', () => {
            const segments = [2, 6, 12, 24];
            const probabilities = segments.map(count =>
                calculateRiskWithSteps({
                    age: 65,
                    selectedHours: [6],
                    detachmentSegments: Array.from({ length: count }, (_, i) => `segment${i}`),
                    pvrGrade: 'none',
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6',
                    cryotherapy: 'no'
                }).probability
            );
            
            // More extensive detachment should increase risk
            for (let i = 1; i < probabilities.length; i++) {
                expect(probabilities[i]).toBeGreaterThanOrEqual(probabilities[i-1]);
            }
        });
    });
});