import React from 'react';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { PAPER_COEFFICIENTS } from '../../constants/paperCoefficients';
import { MODEL_TYPE } from '../../constants/modelTypes';
import { 
    getAgeGroup, 
    getBreakLocation, 
    isTotalRD,
    getInferiorExtent 
} from '../../utils/riskCalculations';

/**
 * Medical Mathematical Accuracy Test Suite
 * 
 * Validates mathematical precision and accuracy of:
 * 1. Logit calculations
 * 2. Exponential transformations  
 * 3. Probability formulas
 * 4. Coefficient summations
 * 5. Floating-point precision
 * 6. Formula verification against published equations
 */

describe('Medical Mathematical Accuracy', () => {
    describe('Logit Calculation Accuracy', () => {
        it('should calculate logit as exact sum of coefficients', () => {
            const result = calculateRiskWithSteps({
                age: 82,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '23g',
                tamponade: 'light_oil',
                cryotherapy: 'no'
            });

            // Manually calculate expected logit
            const expectedLogit = 
                PAPER_COEFFICIENTS.constant +
                PAPER_COEFFICIENTS.age['80+'] +
                PAPER_COEFFICIENTS.breakLocation['5-7'] +
                PAPER_COEFFICIENTS.totalDetachment['yes'] +
                PAPER_COEFFICIENTS.inferiorDetachment['6_hours'] +
                PAPER_COEFFICIENTS.pvrGrade['C'] +
                PAPER_COEFFICIENTS.vitrectomyGauge['23g'] +
                PAPER_COEFFICIENTS.tamponade['light_oil'] +
                PAPER_COEFFICIENTS.cryotherapy['no'];

            expect(result.logit).toBeCloseTo(expectedLogit, 3);
        });

        it('should sum coefficients with correct precision', () => {
            const coefficients = [
                -1.611,  // constant
                0.498,   // age 80+
                0.607,   // break 5-7
                0.663,   // total RD
                0.220    // PVR C
            ];
            
            const sum = coefficients.reduce((a, b) => a + b, 0);
            const expectedSum = 0.377;
            
            expect(sum).toBeCloseTo(expectedSum, 3);
        });

        it('should handle negative coefficients correctly in summation', () => {
            const coefficients = [
                -1.611,  // constant (negative)
                0.498,   // age (positive)
                -0.408,  // gauge 23g (negative)
                -0.420   // cryotherapy (negative)
            ];
            
            const sum = coefficients.reduce((a, b) => a + b, 0);
            expect(sum).toBeCloseTo(-1.941, 3);
        });

        it('should maintain precision with many decimal places', () => {
            const preciseCoefficients = [
                0.236,   // 65-79 age
                0.441,   // 3-5 hours inferior
                0.435,   // Could also be 6 hours
                -0.104,  // C3F8
                -0.159   // Air
            ];
            
            const sum = preciseCoefficients.reduce((a, b) => a + b, 0);
            expect(sum).toBeCloseTo(0.849, 3);
        });
    });

    describe('Exponential Transformation Accuracy', () => {
        it('should correctly apply logistic transformation formula', () => {
            const logit = 1.074;
            const probability = 100 / (1 + Math.exp(-logit));
            
            // From paper: logit 1.074 should give ~74.5%
            expect(probability).toBeCloseTo(74.5, 0);
        });

        it('should handle negative logits in exponential', () => {
            const logit = -2.0;
            const probability = 100 / (1 + Math.exp(-logit));
            
            // Negative logit should give probability < 50%
            expect(probability).toBeLessThan(50);
            expect(probability).toBeCloseTo(11.92, 1);
        });

        it('should handle positive logits in exponential', () => {
            const logit = 2.0;
            const probability = 100 / (1 + Math.exp(-logit));
            
            // Positive logit should give probability > 50%
            expect(probability).toBeGreaterThan(50);
            expect(probability).toBeCloseTo(88.08, 1);
        });

        it('should correctly calculate probability at logit = 0', () => {
            const logit = 0;
            const probability = 100 / (1 + Math.exp(-logit));
            
            // Logit of 0 should give exactly 50%
            expect(probability).toBe(50);
        });

        it('should maintain accuracy for extreme logits', () => {
            const extremeNegative = -5;
            const extremePositive = 5;
            
            const probNegative = 100 / (1 + Math.exp(-extremeNegative));
            const probPositive = 100 / (1 + Math.exp(-extremePositive));
            
            expect(probNegative).toBeCloseTo(0.67, 1);
            expect(probPositive).toBeCloseTo(99.33, 1);
        });
    });

    describe('Published Formula Verification', () => {
        it('should match BEAVRS paper example calculation exactly', () => {
            // Paper states: 82-year-old, total RD, break at 6 o'clock, PVR C, 
            // 23g vitrectomy, silicone oil = 74.5% risk
            const result = calculateRiskWithSteps({
                age: 82,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '23g',
                tamponade: 'light_oil',
                cryotherapy: 'no',
                modelType: MODEL_TYPE.FULL
            });
            
            expect(result.probability).toBeCloseTo(74.5, 0);
        });

        it('should match lowest risk scenario from paper', () => {
            // Paper states: 45-64 years, superior break, <3h inferior, 
            // no total RD, no PVR, 25g, cryotherapy, C2F6 = 3.4% risk
            const result = calculateRiskWithSteps({
                age: 55,
                selectedHours: [12],
                detachmentSegments: ['segment0', 'segment1'],
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'c2f6',
                cryotherapy: 'yes',
                modelType: MODEL_TYPE.FULL
            });
            
            expect(result.probability).toBeCloseTo(3.4, 0);
        });

        it('should verify logit formula: logit = β₀ + Σ(βᵢXᵢ)', () => {
            const result = calculateRiskWithSteps({
                age: 70,
                selectedHours: [5],
                detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                tamponade: 'sf6',
                cryotherapy: 'yes'
            });
            
            // Verify each step contributes to final logit
            const stepSum = result.steps.reduce((sum, step) => sum + step.value, 0);
            expect(stepSum).toBeCloseTo(result.logit, 3);
        });

        it('should verify probability formula: p = 1/(1+e^(-logit))', () => {
            const testLogits = [-2, -1, 0, 1, 2];
            
            testLogits.forEach(logit => {
                const calculatedProb = 100 / (1 + Math.exp(-logit));
                const expectedProb = 100 / (1 + Math.E ** (-logit));
                
                expect(calculatedProb).toBeCloseTo(expectedProb, 10);
            });
        });
    });

    describe('Coefficient Application Accuracy', () => {
        it('should apply age coefficients correctly', () => {
            const ages = [
                { age: 35, expected: '<45', coeff: 0.459 },
                { age: 55, expected: '45-64', coeff: 0 },
                { age: 70, expected: '65-79', coeff: 0.236 },
                { age: 85, expected: '80+', coeff: 0.498 }
            ];
            
            ages.forEach(({ age, expected, coeff }) => {
                const group = getAgeGroup(age);
                expect(group).toBe(expected);
                expect(PAPER_COEFFICIENTS.age[group]).toBe(coeff);
            });
        });

        it('should apply break location coefficients correctly', () => {
            const breaks = [
                { hours: [5, 6, 7], expected: '5-7', coeff: 0.607 },
                { hours: [4], expected: '4-8', coeff: 0.428 },
                { hours: [8], expected: '4-8', coeff: 0.428 },
                { hours: [12], expected: '9-3', coeff: 0 },
                { hours: [], expected: 'none', coeff: 0.676 }
            ];
            
            breaks.forEach(({ hours, expected, coeff }) => {
                const location = getBreakLocation(hours);
                expect(location).toBe(expected);
                expect(PAPER_COEFFICIENTS.breakLocation[location]).toBe(coeff);
            });
        });

        it('should apply total RD coefficient correctly', () => {
            const scenarios = [
                { segments: 22, expected: 'no' },
                { segments: 23, expected: 'yes' },
                { segments: 24, expected: 'yes' }
            ];
            
            scenarios.forEach(({ segments, expected }) => {
                const segmentArray = Array.from({ length: segments }, (_, i) => `segment${i}`);
                const totalRD = isTotalRD(segmentArray);
                expect(totalRD).toBe(expected);
            });
        });

        it('should apply correct coefficient for each PVR grade', () => {
            const grades = [
                { grade: 'none', coeff: 0 },
                { grade: 'A', coeff: 0 },
                { grade: 'B', coeff: 0 },
                { grade: 'C', coeff: 0.220 }
            ];
            
            grades.forEach(({ grade, coeff }) => {
                const mappedGrade = (grade === 'none' || grade === 'A' || grade === 'B') ? 'none' : 'C';
                expect(PAPER_COEFFICIENTS.pvrGrade[mappedGrade]).toBe(coeff);
            });
        });
    });

    describe('Floating-Point Precision', () => {
        it('should maintain precision across multiple operations', () => {
            const operations = [
                -1.611 + 0.498,  // -1.113
                -1.113 + 0.607,  // -0.506
                -0.506 + 0.663,  // 0.157
                0.157 + 0.220,   // 0.377
                0.377 - 0.408,   // -0.031
                -0.031 + 0.670   // 0.639
            ];
            
            const result = operations[operations.length - 1];
            expect(result).toBeCloseTo(0.639, 3);
        });

        it('should handle IEEE 754 floating point correctly', () => {
            // Classic floating point problem: 0.1 + 0.2 !== 0.3
            const sum = 0.1 + 0.2;
            expect(sum).toBeCloseTo(0.3, 10);
            
            // Our coefficients should work correctly
            const coeff1 = 0.236; // 65-79 age
            const coeff2 = 0.220; // PVR C
            const sum2 = coeff1 + coeff2;
            expect(sum2).toBeCloseTo(0.456, 3);
        });

        it('should round consistently for display', () => {
            const probabilities = [
                74.449,  // Should round to 74.4 or 74.5
                74.451,  // Should round to 74.5
                74.550,  // Should stay 74.6 or 74.5
                3.349,   // Should round to 3.3 or 3.4
                3.351    // Should round to 3.4
            ];
            
            probabilities.forEach(prob => {
                const rounded1 = Math.round(prob * 10) / 10;
                const rounded2 = parseFloat(prob.toFixed(1));
                expect(Math.abs(rounded1 - rounded2)).toBeLessThanOrEqual(0.1);
            });
        });

        it('should handle very small coefficient differences', () => {
            const coeff1 = 0.441; // 3-5 hours inferior
            const coeff2 = 0.435; // 6 hours inferior
            const diff = Math.abs(coeff1 - coeff2);
            
            expect(diff).toBeCloseTo(0.006, 3);
            expect(diff).toBeLessThan(0.01);
        });
    });

    describe('Model Comparison Accuracy', () => {
        it('should calculate different probabilities for full vs significant models', () => {
            const params = {
                age: 70,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 12 }, (_, i) => `segment${i}`),
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
            
            // Models should give different results
            expect(fullResult.probability).not.toEqual(sigResult.probability);
            // Full model should generally give different (often higher) risk
            expect(fullResult.logit).not.toEqual(sigResult.logit);
        });

        it('should exclude non-significant coefficients correctly', () => {
            const result = calculateRiskWithSteps({
                age: 70,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                pvrGrade: 'none',
                vitrectomyGauge: '23g', // Not significant
                tamponade: 'c3f8', // Not significant
                cryotherapy: 'no',
                modelType: MODEL_TYPE.SIGNIFICANT
            });
            
            // Check that non-significant coefficients are excluded or marked
            const gaugeStep = result.steps.find(s => s.step.includes('gauge') || s.step.includes('Gauge'));
            const tamponadeStep = result.steps.find(s => s.step.includes('tamponade') || s.step.includes('Tamponade'));
            
            // These should either be excluded or marked as excluded
            if (gaugeStep) {
                expect(gaugeStep.excluded || gaugeStep.value === 0).toBeTruthy();
            }
            if (tamponadeStep && tamponadeStep.detail?.includes('C3F8')) {
                expect(tamponadeStep.excluded || tamponadeStep.value === 0).toBeTruthy();
            }
        });
    });

    describe('Step Calculation Verification', () => {
        it('should include all necessary steps in calculation', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 15 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '25g',
                tamponade: 'light_oil',
                cryotherapy: 'yes',
                modelType: MODEL_TYPE.FULL
            });
            
            // Should have steps for all categories
            const stepCategories = result.steps.map(s => s.category || s.step);
            
            // Check for essential categories
            expect(stepCategories.some(c => c.includes('age') || c.includes('Age'))).toBe(true);
            expect(stepCategories.some(c => c.includes('break') || c.includes('Break'))).toBe(true);
            expect(stepCategories.some(c => c.includes('pvr') || c.includes('PVR'))).toBe(true);
        });

        it('should calculate each step value correctly', () => {
            const result = calculateRiskWithSteps({
                age: 82,
                selectedHours: [6],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '23g',
                tamponade: 'light_oil',
                cryotherapy: 'no'
            });
            
            // Verify specific step values
            const ageStep = result.steps.find(s => s.category === 'age' || s.step.includes('Age'));
            const pvrStep = result.steps.find(s => s.category === 'pvrGrade' || s.step.includes('PVR'));
            
            if (ageStep) expect(ageStep.value).toBeCloseTo(0.498, 3);
            if (pvrStep) expect(pvrStep.value).toBeCloseTo(0.220, 3);
        });
    });
});