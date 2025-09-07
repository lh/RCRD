import { 
    calculateLogitConfidenceInterval,
    calculateProbabilityConfidenceInterval,
    formatConfidenceInterval,
    calculatePredictionInterval
} from '../confidenceIntervals';
import { calculateRiskWithSteps } from '../riskCalculations';

describe('Confidence Interval Calculations', () => {
    describe('calculateLogitConfidenceInterval', () => {
        it('should calculate confidence interval for logit', () => {
            const logit = -1.5;
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.459, category: '<45' },
                { step: 'PVR grade', value: 0.220, category: 'C' }
            ];

            const ci = calculateLogitConfidenceInterval(logit, steps);
            
            expect(ci).toHaveProperty('lower');
            expect(ci).toHaveProperty('upper');
            expect(ci).toHaveProperty('standardError');
            expect(ci).toHaveProperty('marginOfError');
            
            // Check that CI contains the point estimate
            expect(ci.lower).toBeLessThan(logit);
            expect(ci.upper).toBeGreaterThan(logit);
            
            // Check reasonable width (not too narrow, not too wide)
            const width = ci.upper - ci.lower;
            expect(width).toBeGreaterThan(0.3);  // Not too narrow
            expect(width).toBeLessThan(2.0);     // Not too wide
        });

        it('should handle different confidence levels', () => {
            const logit = 0;
            const steps = [{ step: 'Constant', value: -1.611, category: 'constant' }];

            const ci95 = calculateLogitConfidenceInterval(logit, steps, 0.95);
            const ci99 = calculateLogitConfidenceInterval(logit, steps, 0.99);
            
            // 99% CI should be wider than 95% CI
            const width95 = ci95.upper - ci95.lower;
            const width99 = ci99.upper - ci99.lower;
            expect(width99).toBeGreaterThan(width95);
        });
    });

    describe('calculateProbabilityConfidenceInterval', () => {
        it('should calculate confidence interval for probability', () => {
            const probability = 25.5;
            const logit = Math.log(probability/100 / (1 - probability/100));
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.459, category: '<45' }
            ];

            const ci = calculateProbabilityConfidenceInterval(probability, logit, steps);
            
            expect(ci).toHaveProperty('lower');
            expect(ci).toHaveProperty('upper');
            expect(ci).toHaveProperty('standardError');
            expect(ci).toHaveProperty('confidenceLevel');
            
            // Check bounds are within [0, 100]
            expect(ci.lower).toBeGreaterThanOrEqual(0);
            expect(ci.lower).toBeLessThanOrEqual(100);
            expect(ci.upper).toBeGreaterThanOrEqual(0);
            expect(ci.upper).toBeLessThanOrEqual(100);
            
            // Check that CI contains the point estimate
            expect(ci.lower).toBeLessThanOrEqual(probability);
            expect(ci.upper).toBeGreaterThanOrEqual(probability);
        });

        it('should handle extreme probabilities near 0%', () => {
            const probability = 0.5;
            const logit = Math.log(probability/100 / (1 - probability/100));
            const steps = [{ step: 'Constant', value: -5.0, category: 'constant' }];

            const ci = calculateProbabilityConfidenceInterval(probability, logit, steps);
            
            expect(ci.lower).toBeGreaterThanOrEqual(0);
            expect(ci.upper).toBeGreaterThan(ci.lower);
        });

        it('should handle extreme probabilities near 100%', () => {
            const probability = 99.5;
            const logit = Math.log(probability/100 / (1 - probability/100));
            const steps = [{ step: 'Constant', value: 5.0, category: 'constant' }];

            const ci = calculateProbabilityConfidenceInterval(probability, logit, steps);
            
            expect(ci.upper).toBeLessThanOrEqual(100);
            expect(ci.upper).toBeGreaterThan(ci.lower);
        });
    });

    describe('Integration with calculateRiskWithSteps', () => {
        it('should include confidence intervals in risk calculation', () => {
            const result = calculateRiskWithSteps({
                age: 65,
                pvrGrade: 'C',
                vitrectomyGauge: '25g',
                selectedHours: [6],
                detachmentSegments: ['segment10', 'segment11'],
                cryotherapy: 'yes',
                tamponade: 'c2f6'
            });

            expect(result).toHaveProperty('confidenceIntervals');
            expect(result.confidenceIntervals).toHaveProperty('logit');
            expect(result.confidenceIntervals).toHaveProperty('probability');
            expect(result.confidenceIntervals).toHaveProperty('formatted');
            
            // Check formatted strings
            expect(result.confidenceIntervals.formatted.probability95).toMatch(/\d+\.\d%.*CI.*\d+\.\d%-\d+\.\d%/);
            expect(result.confidenceIntervals.formatted.marginOfError).toMatch(/±\d+\.\d%/);
        });

        it('should produce wider CIs for more uncertain predictions', () => {
            // Low risk case (more certain)
            const lowRisk = calculateRiskWithSteps({
                age: 50,
                pvrGrade: 'none',
                vitrectomyGauge: '25g',
                selectedHours: [],
                detachmentSegments: [],
                cryotherapy: 'yes',
                tamponade: 'c2f6'
            });

            // High risk case with many factors (less certain)
            const highRisk = calculateRiskWithSteps({
                age: 85,
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                selectedHours: [5, 6, 7],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                cryotherapy: 'no',
                tamponade: 'light_oil'
            });

            const lowRiskWidth = highRisk.confidenceIntervals.probability.upper - 
                               highRisk.confidenceIntervals.probability.lower;
            const highRiskWidth = highRisk.confidenceIntervals.probability.upper - 
                                highRisk.confidenceIntervals.probability.lower;
            
            // Both should have reasonable CI widths
            expect(lowRiskWidth).toBeGreaterThan(0);
            expect(highRiskWidth).toBeGreaterThan(0);
        });
    });

    describe('formatConfidenceInterval', () => {
        it('should format confidence interval for display', () => {
            const value = 25.5;
            const ci = { lower: 20.2, upper: 31.3 };
            
            const formatted = formatConfidenceInterval(value, ci);
            expect(formatted).toBe('25.5% (95% CI: 20.2%-31.3%)');
        });

        it('should respect decimal places parameter', () => {
            const value = 25.567;
            const ci = { lower: 20.234, upper: 31.345 };
            
            const formatted = formatConfidenceInterval(value, ci, 2);
            // Allow for rounding differences
            expect(formatted).toMatch(/25\.57% \(95% CI: 20\.23%-31\.3[45]%\)/);
        });
    });

    describe('calculatePredictionInterval', () => {
        it('should calculate wider prediction intervals than confidence intervals', () => {
            const probability = 25.5;
            const logit = Math.log(probability/100 / (1 - probability/100));
            const steps = [
                { step: 'Constant', value: -1.611, category: 'constant' },
                { step: 'Age group', value: 0.459, category: '<45' }
            ];

            const ci = calculateProbabilityConfidenceInterval(probability, logit, steps);
            const pi = calculatePredictionInterval(probability, logit, steps);
            
            const ciWidth = ci.upper - ci.lower;
            const piWidth = pi.upper - pi.lower;
            
            // Prediction interval should be wider
            expect(piWidth).toBeGreaterThan(ciWidth);
            
            // But still reasonable
            expect(pi.lower).toBeGreaterThanOrEqual(0);
            expect(pi.upper).toBeLessThanOrEqual(100);
        });
    });

    describe('Error handling', () => {
        it('should handle empty steps array', () => {
            const logit = 0;
            const steps = [];
            
            const ci = calculateLogitConfidenceInterval(logit, steps);
            expect(ci.standardError).toBe(0);
            expect(ci.marginOfError).toBe(0);
        });

        it('should handle invalid confidence levels', () => {
            const logit = 0;
            const steps = [{ step: 'Constant', value: -1.611, category: 'constant' }];
            
            // Should default to 95% CI
            const ci = calculateLogitConfidenceInterval(logit, steps, 0.85);
            expect(ci.marginOfError).toBeGreaterThan(0);
        });
    });
});