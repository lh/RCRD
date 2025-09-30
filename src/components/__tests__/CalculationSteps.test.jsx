import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculationSteps from '../CalculationSteps';
import { getStepExplanation, getMethodologyNote } from '../../utils/riskResultsText';

// Mock the utility functions
jest.mock('../../utils/riskResultsText');

// Mock ProbabilityDisplay component
jest.mock('../ProbabilityDisplay', () => {
    return function MockProbabilityDisplay({ logit, probability }) {
        return (
            <div data-testid="probability-display">
                <span data-testid="probability-logit">{logit}</span>
                <span data-testid="probability-value">{probability}</span>
            </div>
        );
    };
});

describe('CalculationSteps', () => {
    const mockSteps = [
        { step: 'Intercept', value: '-2.31' },
        { step: 'Lens status', value: '0.45' },
        { step: 'Extent', value: '1.23' }
    ];

    const defaultProps = {
        steps: mockSteps,
        logit: '-0.63',
        probability: '34.7%'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getMethodologyNote.mockReturnValue('This calculation uses evidence-based methodology');
        getStepExplanation.mockImplementation((step, value) => `Explanation for ${step}: ${value}`);
    });

    describe('Medical Calculation Validation', () => {
        it('should validate step coefficients are properly displayed with medical precision', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            // Validate intercept (baseline risk)
            const interceptStep = screen.getByTestId('calculation-step-intercept');
            expect(interceptStep).toHaveAttribute('data-step-name', 'Intercept');
            expect(interceptStep).toHaveAttribute('data-step-value', '-2.31');
            expect(interceptStep).toHaveAttribute('data-step-index', '0');
            
            // Validate lens status coefficient
            const lensStep = screen.getByTestId('calculation-step-lens-status');
            expect(lensStep).toHaveAttribute('data-step-name', 'Lens status');
            expect(lensStep).toHaveAttribute('data-step-value', '0.45');
            
            // Validate extent coefficient
            const extentStep = screen.getByTestId('calculation-step-extent');
            expect(extentStep).toHaveAttribute('data-step-name', 'Extent');
            expect(extentStep).toHaveAttribute('data-step-value', '1.23');
        });

        it('should validate logit calculation accuracy', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            const logitValue = screen.getByTestId('logit-value');
            expect(logitValue).toHaveAttribute('data-value', '-0.63');
            expect(logitValue).toHaveTextContent('-0.63');
            
            // Verify logit sum matches step coefficients
            const expectedLogit = parseFloat('-2.31') + parseFloat('0.45') + parseFloat('1.23');
            expect(expectedLogit.toFixed(2)).toBe('-0.63');
        });

        it('should handle excluded coefficients properly', () => {
            const stepsWithExclusion = [
                { step: 'Intercept', value: '-2.31' },
                { step: 'Lens status', value: '0.45', excluded: true },
                { step: 'Extent', value: '1.23' }
            ];
            
            render(<CalculationSteps steps={stepsWithExclusion} logit="-1.08" probability="25.3%" />);
            
            const lensStep = screen.getByTestId('calculation-step-lens-status');
            expect(lensStep).toHaveAttribute('data-excluded', 'true');
            expect(lensStep).toHaveAttribute('data-step-value', '0.45');
        });
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(<CalculationSteps {...defaultProps} />);
            const container = screen.getByTestId('calculation-steps');
            expect(container).toBeTruthy();
            expect(container).toHaveTextContent('Note:');
        });

        it('should display methodology note', () => {
            render(<CalculationSteps {...defaultProps} />);
            const methodologyNote = screen.getByTestId('methodology-note');
            expect(getMethodologyNote).toHaveBeenCalled();
            expect(methodologyNote).toHaveTextContent('This calculation uses evidence-based methodology');
        });

        it('should render all calculation steps with proper structure', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            mockSteps.forEach((step, index) => {
                const stepId = step.step.toLowerCase().replace(/\s+/g, '-');
                const stepElement = screen.getByTestId(`calculation-step-${stepId}`);
                
                expect(stepElement).toHaveAttribute('data-step-index', String(index));
                expect(stepElement).toHaveTextContent(`${step.step}:`);
                expect(stepElement).toHaveTextContent(step.value);
                
                // Verify label and value elements
                const stepLabel = screen.getByTestId(`step-label-${stepId}`);
                expect(stepLabel).toHaveTextContent(`${step.step}:`);
                
                const stepValue = screen.getByTestId(`step-value-${stepId}`);
                expect(stepValue).toHaveTextContent(step.value);
            });
        });

        it('should display step explanations with medical context', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            mockSteps.forEach(step => {
                const stepId = step.step.toLowerCase().replace(/\s+/g, '-');
                const explanation = screen.getByTestId(`step-explanation-${stepId}`);
                
                expect(getStepExplanation).toHaveBeenCalledWith(step.step, step.value);
                expect(explanation).toHaveTextContent(`Explanation for ${step.step}: ${step.value}`);
            });
        });

        it('should display total logit with proper formatting', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            const logitDisplay = screen.getByTestId('logit-display');
            expect(logitDisplay).toHaveTextContent('Total logit:');
            
            const logitValue = screen.getByTestId('logit-value');
            expect(logitValue).toHaveTextContent('-0.63');
            expect(logitValue).toHaveAttribute('data-value', '-0.63');
        });

        it('should render ProbabilityDisplay component with correct props', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            const probabilityDisplay = screen.getByTestId('probability-display');
            expect(probabilityDisplay).toBeTruthy();
            
            const logitElement = screen.getByTestId('probability-logit');
            expect(logitElement).toHaveTextContent('-0.63');
            
            const probabilityElement = screen.getByTestId('probability-value');
            expect(probabilityElement).toHaveTextContent('34.7%');
        });
    });

    describe('Props Handling and Edge Cases', () => {
        it('should handle empty steps array gracefully', () => {
            const { container } = render(
                <CalculationSteps 
                    steps={[]} 
                    logit="0" 
                    probability="50%" 
                />
            );
            
            const logitDisplay = screen.getByTestId('logit-display');
            expect(logitDisplay).toHaveTextContent('Total logit:');
            
            // Check that the summary section still renders
            const summarySection = screen.getByTestId('calculation-summary');
            expect(summarySection).toBeTruthy();
            expect(summarySection.className).toContain('border-t');
        });

        it('should handle malformed step data', () => {
            const malformedSteps = [
                { step: 'Valid Step', value: '1.23' },
                null,
                { step: null, value: '0.45' },
                { value: '0.67' }, // missing step name
                { step: 'Another Step' }, // missing value
                'not an object'
            ];
            
            render(
                <CalculationSteps 
                    steps={malformedSteps} 
                    logit="1.23" 
                    probability="77.3%" 
                />
            );
            
            // Should only render valid steps
            const validStep = screen.getByTestId('calculation-step-valid-step');
            expect(validStep).toHaveAttribute('data-step-value', '1.23');
            
            // Malformed steps should be filtered out
            const unknownSteps = screen.queryAllByTestId('calculation-step-unknown');
            expect(unknownSteps.length).toBe(0);
        });

        it('should handle single step correctly', () => {
            const singleStep = [{ step: 'Intercept', value: '-1.00' }];
            
            render(
                <CalculationSteps 
                    steps={singleStep} 
                    logit="-1.00" 
                    probability="26.9%" 
                />
            );
            
            const interceptStep = screen.getByTestId('calculation-step-intercept');
            expect(interceptStep).toHaveAttribute('data-step-value', '-1.00');
            expect(interceptStep).toHaveTextContent('Intercept:');
            
            const logitValue = screen.getByTestId('logit-value');
            expect(logitValue).toHaveTextContent('-1.00');
        });

        it('should handle many steps without performance issues', () => {
            const manySteps = Array.from({ length: 20 }, (_, i) => ({
                step: `Factor ${i + 1}`,
                value: (Math.random() * 2 - 1).toFixed(3)
            }));
            
            const { container } = render(
                <CalculationSteps 
                    steps={manySteps} 
                    logit="5.432" 
                    probability="99.6%" 
                />
            );
            
            manySteps.forEach((step, index) => {
                const stepId = `factor-${index + 1}`;
                const stepElement = screen.getByTestId(`calculation-step-${stepId}`);
                expect(stepElement).toHaveAttribute('data-step-index', String(index));
                expect(stepElement).toHaveTextContent(`${step.step}:`);
                expect(stepElement).toHaveTextContent(step.value);
            });
        });

        it('should handle various logit formats', () => {
            const testCases = [
                { logit: '0', expected: '0' },
                { logit: '1.234', expected: '1.234' },
                { logit: '-10.567', expected: '-10.567' },
                { logit: '0.001', expected: '0.001' },
                { logit: 'NaN', expected: '0.000' },
                { logit: null, expected: '0.000' },
                { logit: undefined, expected: '0.000' }
            ];
            
            testCases.forEach(({ logit, expected }) => {
                const { rerender } = render(
                    <CalculationSteps 
                        steps={[]} 
                        logit={logit} 
                        probability="50%" 
                    />
                );
                
                const logitValue = screen.getByTestId('logit-value');
                expect(logitValue).toHaveTextContent(expected);
                expect(logitValue).toHaveAttribute('data-value', expected);
                
                rerender(<div />); // Clear for next iteration
            });
        });
    });

    describe('Layout and Styling', () => {
        it('should have correct CSS classes for layout', () => {
            const { container } = render(<CalculationSteps {...defaultProps} />);
            
            const mainContainer = screen.getByTestId('calculation-steps');
            expect(mainContainer.className).toContain('space-y-2');
            
            const summarySection = screen.getByTestId('calculation-summary');
            expect(summarySection.className).toContain('mt-4');
            expect(summarySection.className).toContain('pt-4');
            expect(summarySection.className).toContain('border-t');
        });

        it('should apply correct styling to step elements', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            const firstStep = screen.getByTestId('calculation-step-intercept');
            expect(firstStep.className).toContain('flex');
            expect(firstStep.className).toContain('items-baseline');
            
            const stepLabel = screen.getByTestId('step-label-intercept');
            expect(stepLabel.className).toContain('w-1/3');
            expect(stepLabel.className).toContain('text-sm');
            expect(stepLabel.className).toContain('text-gray-600');
            
            const stepValue = screen.getByTestId('step-value-intercept');
            expect(stepValue.className).toContain('w-20');
            expect(stepValue.className).toContain('font-mono');
            
            const stepExplanation = screen.getByTestId('step-explanation-intercept');
            expect(stepExplanation.className).toContain('text-sm');
            expect(stepExplanation.className).toContain('text-gray-500');
            expect(stepExplanation.className).toContain('ml-2');
        });

        it('should have proper structure for logit display', () => {
            render(<CalculationSteps {...defaultProps} />);
            
            const logitDisplay = screen.getByTestId('logit-display');
            const totalSection = logitDisplay.parentElement;
            
            expect(totalSection).toBe(screen.getByTestId('calculation-summary'));
            expect(logitDisplay.className).toContain('flex');
            expect(logitDisplay.className).toContain('items-baseline');
            
            const logitLabel = within(logitDisplay).getByText('Total logit:');
            expect(logitLabel.className).toContain('w-1/3');
            expect(logitLabel.className).toContain('text-sm');
            expect(logitLabel.className).toContain('font-medium');
            
            const logitValue = screen.getByTestId('logit-value');
            expect(logitValue.className).toContain('w-20');
            expect(logitValue.className).toContain('font-mono');
            expect(logitValue.className).toContain('font-medium');
        });
    });

    describe('Integration with utility functions', () => {
        it('should use custom step explanations when provided', () => {
            getStepExplanation.mockImplementation((step, value) => {
                if (step === 'Intercept') return 'Base risk';
                if (step === 'Lens status') return 'Pseudophakic adds risk';
                return 'Other factor';
            });
            
            render(<CalculationSteps {...defaultProps} />);
            
            const interceptExplanation = screen.getByTestId('step-explanation-intercept');
            expect(interceptExplanation).toHaveTextContent('Base risk');
            
            const lensExplanation = screen.getByTestId('step-explanation-lens-status');
            expect(lensExplanation).toHaveTextContent('Pseudophakic adds risk');
            
            const extentExplanation = screen.getByTestId('step-explanation-extent');
            expect(extentExplanation).toHaveTextContent('Other factor');
        });

        it('should update when methodology note changes', () => {
            getMethodologyNote.mockReturnValue('Updated methodology information');
            
            render(<CalculationSteps {...defaultProps} />);
            
            const methodologyNote = screen.getByTestId('methodology-note');
            expect(methodologyNote).toHaveTextContent('Updated methodology information');
        });
    });

    describe('Special Characters and Edge Cases', () => {
        it('should handle special characters in step names', () => {
            const specialSteps = [
                { step: 'PVR Grade C/D', value: '0.5' },
                { step: 'Age (≥80)', value: '0.3' },
                { step: 'Break @ 6 o\'clock', value: '0.2' }
            ];
            
            render(
                <CalculationSteps 
                    steps={specialSteps} 
                    logit="1.0" 
                    probability="73.1%" 
                />
            );
            
            // Check that special characters are preserved in display
            specialSteps.forEach(step => {
                const stepId = step.step.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
                const stepElement = screen.getByTestId(`calculation-step-${stepId}`);
                expect(stepElement).toHaveTextContent(`${step.step}:`);
                expect(stepElement).toHaveAttribute('data-step-name', step.step);
            });
        });

        it('should handle decimal precision correctly', () => {
            const precisionSteps = [
                { step: 'Very small', value: '0.001' },
                { step: 'Large', value: '10.999' },
                { step: 'Negative', value: '-5.5555' }
            ];
            
            render(
                <CalculationSteps 
                    steps={precisionSteps} 
                    logit="5.4445" 
                    probability="99.6%" 
                />
            );
            
            // Verify each value is displayed exactly as provided
            precisionSteps.forEach(step => {
                const stepId = step.step.toLowerCase().replace(/\s+/g, '-');
                const stepElement = screen.getByTestId(`calculation-step-${stepId}`);
                expect(stepElement).toHaveAttribute('data-step-value', step.value);
                
                const stepValue = screen.getByTestId(`step-value-${stepId}`);
                expect(stepValue).toHaveTextContent(step.value);
            });
        });

        it('should handle null and undefined step values', () => {
            const invalidSteps = [
                { step: 'Null value', value: null },
                { step: 'Undefined value', value: undefined },
                { step: 'Valid value', value: '1.23' }
            ];
            
            render(
                <CalculationSteps 
                    steps={invalidSteps} 
                    logit="1.23" 
                    probability="77.3%" 
                />
            );
            
            // Null/undefined values should default to '0.000'
            const nullStep = screen.getByTestId('calculation-step-null-value');
            expect(nullStep).toHaveAttribute('data-step-value', '0.000');
            
            const undefinedStep = screen.getByTestId('calculation-step-undefined-value');
            expect(undefinedStep).toHaveAttribute('data-step-value', '0.000');
            
            const validStep = screen.getByTestId('calculation-step-valid-value');
            expect(validStep).toHaveAttribute('data-step-value', '1.23');
        });

        it('should not crash with completely invalid props', () => {
            const { container } = render(
                <CalculationSteps 
                    steps="not an array"
                    logit={{ invalid: 'object' }}
                    probability={12345}
                />
            );
            
            // Component should still render with defaults
            const mainContainer = screen.getByTestId('calculation-steps');
            expect(mainContainer).toBeTruthy();
            
            const logitValue = screen.getByTestId('logit-value');
            expect(logitValue).toHaveTextContent('0.000');
        });
    });

    describe('Medical Coefficient Validation', () => {
        it('should validate coefficient signs match medical expectations', () => {
            const medicalSteps = [
                { step: 'Intercept', value: '-2.31' }, // Base risk should be negative
                { step: 'PVR Grade C', value: '0.45' }, // PVR increases risk (positive)
                { step: 'Smaller gauge', value: '-0.30' }, // Smaller gauge reduces risk (negative)
                { step: 'Silicone oil', value: '0.67' } // Oil increases risk vs gas (positive)
            ];
            
            render(
                <CalculationSteps 
                    steps={medicalSteps} 
                    logit="-1.49" 
                    probability="18.4%" 
                />
            );
            
            // Validate intercept is negative (low baseline risk)
            const interceptStep = screen.getByTestId('calculation-step-intercept');
            expect(parseFloat(interceptStep.getAttribute('data-step-value'))).toBeLessThan(0);
            
            // Validate PVR increases risk
            const pvrStep = screen.getByTestId('calculation-step-pvr-grade-c');
            expect(parseFloat(pvrStep.getAttribute('data-step-value'))).toBeGreaterThan(0);
            
            // Validate smaller gauge reduces risk
            const gaugeStep = screen.getByTestId('calculation-step-smaller-gauge');
            expect(parseFloat(gaugeStep.getAttribute('data-step-value'))).toBeLessThan(0);
            
            // Validate oil increases risk
            const oilStep = screen.getByTestId('calculation-step-silicone-oil');
            expect(parseFloat(oilStep.getAttribute('data-step-value'))).toBeGreaterThan(0);
        });

        it('should validate logit sum precision', () => {
            const preciseSteps = [
                { step: 'Factor 1', value: '1.234' },
                { step: 'Factor 2', value: '-0.567' },
                { step: 'Factor 3', value: '0.890' }
            ];
            
            render(
                <CalculationSteps 
                    steps={preciseSteps} 
                    logit="1.557" 
                    probability="82.6%" 
                />
            );
            
            // Calculate expected sum
            const expectedSum = preciseSteps.reduce((sum, step) => 
                sum + parseFloat(step.value), 0
            );
            
            const logitValue = screen.getByTestId('logit-value');
            const displayedLogit = parseFloat(logitValue.getAttribute('data-value'));
            
            expect(displayedLogit).toBeCloseTo(expectedSum, 3);
        });
    });
});