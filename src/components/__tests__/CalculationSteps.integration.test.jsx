import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculationSteps from '../CalculationSteps';

// DO NOT MOCK - Test actual business logic and integration
// Ensure ProbabilityDisplay is not mocked
jest.unmock('../ProbabilityDisplay');

describe('CalculationSteps - Integration Tests', () => {
    describe('Real Business Logic', () => {
        it('should display BEAVRS methodology note', () => {
            const steps = [
                { step: 'Constant', value: -1.611 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.611" probability="16.7%" />);
            
            // Should display the actual methodology note
            expect(screen.getByText(/Following the BEAVRS study final model/)).toBeInTheDocument();
            expect(screen.getByText(/only includes coefficients with p < 0.05/)).toBeInTheDocument();
        });

        it('should display correct explanation for Constant step', () => {
            const steps = [
                { step: 'Constant', value: -1.611 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.611" probability="16.7%" />);
            
            // Should show the actual constant explanation
            expect(screen.getByText(/Base constant: coefficient -1.611 \(p<0.001\)/)).toBeInTheDocument();
        });

        it('should display correct explanation for 25g vitrectomy gauge', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Vitrectomy gauge', value: -0.885 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-2.496" probability="7.6%" />);
            
            // Should show the actual vitrectomy gauge explanation with odds ratio
            expect(screen.getByText(/25g vs 20g.*coefficient -0.885.*odds ratio 0.413.*p=0.014/)).toBeInTheDocument();
        });

        it('should display correct explanation for age group 65-79', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Age group', value: 0.236 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.375" probability="20.2%" />);
            
            // Should show the actual age group explanation
            expect(screen.getByText(/65-79 years vs 45-64 years.*coefficient \+0.236.*odds ratio 1.266.*p=0.005/)).toBeInTheDocument();
        });

        it('should display correct explanation for inferior break location', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Break location', value: 0.607 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.004" probability="26.8%" />);
            
            // Should show the actual break location explanation
            expect(screen.getByText(/5-7 o'clock vs 9-3 o'clock.*coefficient \+0.607.*odds ratio 1.835.*p<0.001/)).toBeInTheDocument();
        });

        it('should display correct explanation for total RD', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Total RD', value: 0.663 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-0.948" probability="27.9%" />);
            
            // Should show the actual total RD explanation
            expect(screen.getByText(/Total detachment vs not total.*coefficient \+0.663.*odds ratio 1.941.*p<0.001/)).toBeInTheDocument();
        });

        it('should display correct explanation for PVR grade C', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'PVR grade', value: 0.220 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.391" probability="19.9%" />);
            
            // Should show the actual PVR grade explanation
            expect(screen.getByText(/Grade C vs None\/A\/B.*coefficient \+0.220.*odds ratio 1.246.*p<0.001/)).toBeInTheDocument();
        });

        it('should display reference category explanations correctly', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Age group', value: 0 },  // Reference category
                { step: 'Break location', value: 0 },  // Reference category
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.611" probability="16.7%" />);
            
            // Should show reference category explanations
            expect(screen.getByText(/45-64 years: reference category/)).toBeInTheDocument();
            expect(screen.getByText(/9-3 o'clock: reference category/)).toBeInTheDocument();
        });
    });

    describe('Complex Multi-Step Calculations', () => {
        it('should display complete calculation with multiple risk factors', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Age group', value: 0.498 },  // ≥80 years
                { step: 'Break location', value: 0.607 },  // 5-7 o'clock
                { step: 'Inferior detachment', value: 0.441 },  // 3-5 hours
                { step: 'Total RD', value: 0.663 },
                { step: 'PVR grade', value: 0.220 },
                { step: 'Vitrectomy gauge', value: -0.885 }
            ];
            
            const totalLogit = '-1.611' + '+0.498' + '+0.607' + '+0.441' + '+0.663' + '+0.220' + '-0.885';
            
            render(<CalculationSteps steps={steps} logit="0.533" probability="63%" />);
            
            // Check all steps are displayed
            expect(screen.getByText('Constant:')).toBeInTheDocument();
            expect(screen.getByText('Age group:')).toBeInTheDocument();
            expect(screen.getByText('Break location:')).toBeInTheDocument();
            expect(screen.getByText('Inferior detachment:')).toBeInTheDocument();
            expect(screen.getByText('Total RD:')).toBeInTheDocument();
            expect(screen.getByText('PVR grade:')).toBeInTheDocument();
            expect(screen.getByText('Vitrectomy gauge:')).toBeInTheDocument();
            
            // Check total logit is displayed
            expect(screen.getByText('Total logit:')).toBeInTheDocument();
            expect(screen.getByText('0.533')).toBeInTheDocument();
        });

        it('should handle inferior detachment categories correctly', () => {
            const testCases = [
                { value: 0, expected: /<3 hours: reference category/ },
                { value: 0.441, expected: /3-5 hours vs <3h.*coefficient \+0.441.*odds ratio 1.554/ },
                { value: 0.435, expected: /6\+ hours vs <3h.*coefficient \+0.435.*odds ratio 1.545/ }
            ];
            
            testCases.forEach(({ value, expected }) => {
                const steps = [
                    { step: 'Constant', value: -1.611 },
                    { step: 'Inferior detachment', value }
                ];
                
                const { unmount } = render(<CalculationSteps steps={steps} logit="-1.0" probability="27%" />);
                
                expect(screen.getByText(expected)).toBeInTheDocument();
                unmount();
            });
        });
    });

    describe('Probability Display Integration', () => {
        it('should render actual ProbabilityDisplay component with correct formula', () => {
            const steps = [
                { step: 'Constant', value: -1.611 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.611" probability="16.7" />);
            
            // Check that the actual ProbabilityDisplay component renders
            // It should show the formula: 1 / (1 + e^-(-1.611)) × 100%
            expect(screen.getByText(/Probability =/)).toBeInTheDocument();
            expect(screen.getByText(/1 \/ \(1 \+ e-1.611\) × 100%/)).toBeInTheDocument();
            
            // And the result (preserves exact format passed)
            expect(screen.getByText(/= 16.7%/)).toBeInTheDocument();
        });

        it('should handle positive logit values in probability display', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Total RD', value: 0.663 },
                { step: 'Break location', value: 0.607 },
                { step: 'Age group', value: 0.498 }
            ];
            
            render(<CalculationSteps steps={steps} logit="0.157" probability="53.9" />);
            
            // Positive logit should show e+0.157
            expect(screen.getByText(/1 \/ \(1 \+ e\+0.157\) × 100%/)).toBeInTheDocument();
            expect(screen.getByText(/= 53.9%/)).toBeInTheDocument();
        });
    });

    describe('Layout and Structure', () => {
        it('should maintain proper visual hierarchy', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Age group', value: 0.236 }
            ];
            
            const { container } = render(<CalculationSteps steps={steps} logit="-1.375" probability="20.2" />);
            
            // Check note is at the top
            const note = container.querySelector('.text-sm.text-gray-600.mb-4');
            expect(note).toHaveTextContent('Following the BEAVRS study');
            
            // Check steps are in the middle
            const stepRows = container.querySelectorAll('.flex.items-baseline');
            expect(stepRows.length).toBeGreaterThanOrEqual(2); // At least the steps
            
            // Check total section has border
            const totalSection = container.querySelector('.mt-4.pt-4.border-t');
            expect(totalSection).toBeInTheDocument();
            expect(totalSection).toHaveTextContent('Total logit');
        });

        it('should align values consistently', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Age group', value: 0.236 },
                { step: 'PVR grade', value: 0.220 }
            ];
            
            const { container } = render(<CalculationSteps steps={steps} logit="-1.155" probability="24.0" />);
            
            // All values should be in mono font
            const monoValues = container.querySelectorAll('.font-mono');
            expect(monoValues.length).toBeGreaterThanOrEqual(4); // 3 steps + total
            
            // Check that values are displayed (as strings in the DOM)
            const constantValue = screen.getByText((content, element) => {
                return element && element.className === 'w-20 font-mono' && content === '-1.611';
            });
            expect(constantValue).toBeInTheDocument();
        });
    });

    describe('Edge Cases and Special Values', () => {
        it('should handle empty steps array', () => {
            render(<CalculationSteps steps={[]} logit="0" probability="50" />);
            
            // Should still show methodology note and total
            expect(screen.getByText(/Following the BEAVRS study/)).toBeInTheDocument();
            expect(screen.getByText('Total logit:')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should handle unknown step types gracefully', () => {
            const steps = [
                { step: 'Unknown Step', value: 999 }
            ];
            
            render(<CalculationSteps steps={steps} logit="999" probability="100" />);
            
            // Should render the step even without explanation
            expect(screen.getByText('Unknown Step:')).toBeInTheDocument();
            // The value will be converted to string in the DOM
            const valueElement = screen.getByText((content, element) => {
                return element && element.className === 'w-20 font-mono' && content === '999';
            });
            expect(valueElement).toBeInTheDocument();
        });

        it('should handle special characters in break location times', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Break location', value: 0.428 }  // 4 or 8 o'clock
            ];
            
            render(<CalculationSteps steps={steps} logit="-1.183" probability="23.5" />);
            
            // Should properly display o'clock notation
            expect(screen.getByText(/4 or 8 o'clock vs 9-3 o'clock/)).toBeInTheDocument();
        });

        it('should handle "No break" category correctly', () => {
            const steps = [
                { step: 'Constant', value: -1.611 },
                { step: 'Break location', value: 0.676 }  // No break
            ];
            
            render(<CalculationSteps steps={steps} logit="-0.935" probability="28.2" />);
            
            // Should show "No break" explanation with its non-significant p-value
            expect(screen.getByText(/No break vs 9-3 o'clock.*coefficient \+0.676.*p=0.242/)).toBeInTheDocument();
        });
    });

    describe('Statistical Information Display', () => {
        it('should display odds ratios for significant predictors', () => {
            const steps = [
                { step: 'Age group', value: 0.498 },  // ≥80 years
                { step: 'Break location', value: 0.607 },  // 5-7 o'clock
                { step: 'Total RD', value: 0.663 }
            ];
            
            render(<CalculationSteps steps={steps.map(s => s)} logit="1.768" probability="85.4" />);
            
            // Check odds ratios are displayed
            expect(screen.getByText(/odds ratio 1.645/)).toBeInTheDocument(); // Age ≥80
            expect(screen.getByText(/odds ratio 1.835/)).toBeInTheDocument(); // Break 5-7
            expect(screen.getByText(/odds ratio 1.941/)).toBeInTheDocument(); // Total RD
        });

        it('should display p-values for all coefficients', () => {
            const steps = [
                { step: 'Vitrectomy gauge', value: -0.885 },
                { step: 'Age group', value: 0.236 },
                { step: 'Break location', value: 0.607 }
            ];
            
            render(<CalculationSteps steps={steps} logit="-0.042" probability="49.0" />);
            
            // Check p-values are displayed
            expect(screen.getByText(/p=0.014/)).toBeInTheDocument(); // Vitrectomy
            expect(screen.getByText(/p=0.005/)).toBeInTheDocument(); // Age
            expect(screen.getByText(/p<0.001/)).toBeInTheDocument(); // Break location
        });
    });
});