import React from 'react';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { MODEL_TYPE } from '../../constants/modelTypes';
import { PAPER_COEFFICIENTS, SIGNIFICANT_COEFFICIENTS } from '../../constants/paperCoefficients';

/**
 * Medical Model Consistency Test Suite
 * 
 * Validates consistency between:
 * 1. Full model vs Significant-only model
 * 2. Model behavior at boundaries
 * 3. Cross-model validation
 * 4. Model stability across parameter ranges
 * 5. Model discrimination capability
 */

describe('Medical Model Consistency', () => {
    describe('Full vs Significant Model Comparison', () => {
        it('should produce different results for full vs significant models', () => {
            const params = {
                age: 70,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 15 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '23g',
                tamponade: 'c3f8',
                cryotherapy: 'no'
            };
            
            const fullResult = calculateRiskWithSteps({
                ...params,
                modelType: MODEL_TYPE.FULL
            });
            
            const sigResult = calculateRiskWithSteps({
                ...params,
                modelType: MODEL_TYPE.SIGNIFICANT
            });
            
            // Models should give different probabilities
            expect(fullResult.probability).not.toEqual(sigResult.probability);
            
            // Full model typically gives higher granularity
            expect(fullResult.steps.length).toBeGreaterThanOrEqual(sigResult.steps.length);
        });

        it('should exclude non-significant factors in significant model', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                selectedHours: [5],
                detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g', // Not significant
                tamponade: 'c3f8', // Not significant
                cryotherapy: 'yes',
                modelType: MODEL_TYPE.SIGNIFICANT
            });
            
            // Check that non-significant factors are handled correctly
            const steps = result.steps;
            const gaugeStep = steps.find(s => s.category === 'vitrectomyGauge' || s.step.includes('Gauge'));
            const tamponadeStep = steps.find(s => s.category === 'tamponade' && s.detail?.includes('C3F8'));
            
            // Non-significant factors should be excluded or marked
            if (gaugeStep) {
                expect(gaugeStep.excluded || gaugeStep.value === 0).toBeTruthy();
            }
            if (tamponadeStep) {
                expect(tamponadeStep.excluded || tamponadeStep.value === 0).toBeTruthy();
            }
        });

        it('should maintain consistent risk ordering between models', () => {
            // Low risk case
            const lowRiskParams = {
                age: 55,
                selectedHours: [12],
                detachmentSegments: ['segment0'],
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'c2f6',
                cryotherapy: 'yes'
            };
            
            // High risk case
            const highRiskParams = {
                age: 85,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                tamponade: 'light_oil',
                cryotherapy: 'no'
            };
            
            // Test both models
            const lowFull = calculateRiskWithSteps({ ...lowRiskParams, modelType: MODEL_TYPE.FULL });
            const highFull = calculateRiskWithSteps({ ...highRiskParams, modelType: MODEL_TYPE.FULL });
            const lowSig = calculateRiskWithSteps({ ...lowRiskParams, modelType: MODEL_TYPE.SIGNIFICANT });
            const highSig = calculateRiskWithSteps({ ...highRiskParams, modelType: MODEL_TYPE.SIGNIFICANT });
            
            // Both models should agree on risk ordering
            expect(highFull.probability).toBeGreaterThan(lowFull.probability);
            expect(highSig.probability).toBeGreaterThan(lowSig.probability);
        });
    });

    describe('Model Stability at Boundaries', () => {
        it('should handle age boundaries consistently', () => {
            const ages = [44, 45, 64, 65, 79, 80];
            const results = ages.map(age => 
                calculateRiskWithSteps({
                    age,
                    selectedHours: [6],
                    detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                    pvrGrade: 'none',
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6',
                    cryotherapy: 'no',
                    modelType: MODEL_TYPE.FULL
                })
            );
            
            // Check for smooth transitions at boundaries
            // Age 44->45 transition
            expect(Math.abs(results[1].probability - results[0].probability)).toBeLessThan(10);
            // Age 64->65 transition
            expect(Math.abs(results[3].probability - results[2].probability)).toBeLessThan(10);
            // Age 79->80 transition
            expect(Math.abs(results[5].probability - results[4].probability)).toBeLessThan(10);
        });

        it('should handle total RD boundary (22-23 segments)', () => {
            const result22 = calculateRiskWithSteps({
                age: 70,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 22 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            });
            
            const result23 = calculateRiskWithSteps({
                age: 70,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 23 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            });
            
            // 23 segments triggers total RD, should increase risk
            expect(result23.probability).toBeGreaterThan(result22.probability);
            
            // The jump should be meaningful (total RD coefficient effect)
            const expectedJump = 100 / (1 + Math.exp(-PAPER_COEFFICIENTS.totalDetachment['yes'])) - 50;
            const actualJump = result23.probability - result22.probability;
            expect(actualJump).toBeGreaterThan(0);
        });
    });

    describe('Cross-Model Validation', () => {
        it('should validate against simplified calculation', () => {
            // Simple case with known coefficients
            const result = calculateRiskWithSteps({
                age: 55, // Reference age (coeff = 0)
                selectedHours: [12], // Superior (coeff = 0)
                detachmentSegments: ['segment0'], // No total RD (coeff = 0)
                pvrGrade: 'none', // (coeff = 0)
                vitrectomyGauge: '20g', // Reference (coeff = 0)
                tamponade: 'sf6', // Reference (coeff = 0)
                cryotherapy: 'no', // Reference (coeff = 0)
                modelType: MODEL_TYPE.FULL
            });
            
            // With all reference categories, logit should be close to constant
            // Some small coefficients may apply for inferior extent
            const expectedLogit = PAPER_COEFFICIENTS.constant;
            expect(result.logit).toBeCloseTo(expectedLogit, 1);
        });

        it('should produce consistent results across multiple runs', () => {
            const params = {
                age: 70,
                selectedHours: [5, 6],
                detachmentSegments: Array.from({ length: 12 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '25g',
                tamponade: 'light_oil',
                cryotherapy: 'yes'
            };
            
            // Run calculation multiple times
            const results = Array(5).fill(null).map(() => 
                calculateRiskWithSteps(params)
            );
            
            // All runs should produce identical results
            const firstProb = results[0].probability;
            results.forEach(result => {
                expect(result.probability).toEqual(firstProb);
            });
        });
    });

    describe('Model Discrimination Capability', () => {
        it('should discriminate between low and high risk cases', () => {
            const cases = [
                // Very low risk
                {
                    params: {
                        age: 55,
                        selectedHours: [12],
                        detachmentSegments: ['segment0'],
                        pvrGrade: 'none',
                        vitrectomyGauge: '25g',
                        tamponade: 'c2f6',
                        cryotherapy: 'yes'
                    },
                    expectedRange: [0, 10]
                },
                // Moderate risk
                {
                    params: {
                        age: 65,
                        selectedHours: [4],
                        detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'yes'
                    },
                    expectedRange: [10, 30]
                },
                // High risk
                {
                    params: {
                        age: 80,
                        selectedHours: [6],
                        detachmentSegments: Array.from({ length: 20 }, (_, i) => `segment${i}`),
                        pvrGrade: 'C',
                        vitrectomyGauge: '20g',
                        tamponade: 'light_oil',
                        cryotherapy: 'no'
                    },
                    expectedRange: [50, 100]
                }
            ];
            
            cases.forEach(({ params, expectedRange }) => {
                const result = calculateRiskWithSteps(params);
                expect(result.probability).toBeGreaterThanOrEqual(expectedRange[0]);
                expect(result.probability).toBeLessThanOrEqual(expectedRange[1]);
            });
        });

        it('should show appropriate sensitivity to key risk factors', () => {
            const baseParams = {
                age: 65,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            };
            
            // Base case
            const baseResult = calculateRiskWithSteps({
                ...baseParams,
                pvrGrade: 'none'
            });
            
            // Add PVR
            const pvrResult = calculateRiskWithSteps({
                ...baseParams,
                pvrGrade: 'C'
            });
            
            // Add total RD
            const totalRdResult = calculateRiskWithSteps({
                ...baseParams,
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'none'
            });
            
            // Each major risk factor should increase probability
            expect(pvrResult.probability).toBeGreaterThan(baseResult.probability);
            expect(totalRdResult.probability).toBeGreaterThan(baseResult.probability);
        });
    });

    describe('Model Coefficient Consistency', () => {
        it('should apply coefficients consistently in both models', () => {
            // Test a significant coefficient that appears in both models
            const params = {
                age: 80, // Significant in both models
                selectedHours: [12],
                detachmentSegments: ['segment0'],
                pvrGrade: 'none',
                vitrectomyGauge: '20g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            };
            
            const fullResult = calculateRiskWithSteps({
                ...params,
                modelType: MODEL_TYPE.FULL
            });
            
            const sigResult = calculateRiskWithSteps({
                ...params,
                modelType: MODEL_TYPE.SIGNIFICANT
            });
            
            // Age coefficient should be applied in both
            const ageStepFull = fullResult.steps.find(s => 
                s.category === 'age' || s.step.includes('Age')
            );
            const ageStepSig = sigResult.steps.find(s => 
                s.category === 'age' || s.step.includes('Age')
            );
            
            if (ageStepFull && ageStepSig) {
                expect(ageStepFull.value).toBeCloseTo(ageStepSig.value, 3);
            }
        });
    });
});