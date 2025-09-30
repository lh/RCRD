import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskSummary from '../RiskSummary';

// DO NOT MOCK - Test actual business logic

describe('RiskSummary - Integration Tests', () => {
    describe('Real Risk Summary Display', () => {
        it('should display actual risk summary text for high risk', () => {
            const mockOnPrint = jest.fn();
            render(<RiskSummary probability="75" onPrint={mockOnPrint} />);
            
            // The actual getRiskSummaryText function returns "Estimated Risk of Failure: X%"
            expect(screen.getByText('Estimated Risk of Failure: 75%')).toBeInTheDocument();
        });

        it('should display actual risk summary text for low risk', () => {
            const mockOnPrint = jest.fn();
            render(<RiskSummary probability="15" onPrint={mockOnPrint} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 15%')).toBeInTheDocument();
        });

        it('should round probability values correctly', () => {
            const mockOnPrint = jest.fn();
            render(<RiskSummary probability="66.7" onPrint={mockOnPrint} />);
            
            // Math.round should round 66.7 to 67
            expect(screen.getByText('Estimated Risk of Failure: 67%')).toBeInTheDocument();
        });

        it('should handle decimal rounding edge cases', () => {
            const testCases = [
                { input: "49.4", expected: "49" },
                { input: "49.5", expected: "50" },
                { input: "49.6", expected: "50" },
                { input: "99.9", expected: "100" }
            ];
            
            testCases.forEach(({ input, expected }) => {
                const { unmount } = render(<RiskSummary probability={input} onPrint={jest.fn()} />);
                expect(screen.getByText(`Estimated Risk of Failure: ${expected}%`)).toBeInTheDocument();
                unmount();
            });
        });

        it('should display the standard subtitle', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            // The actual getRiskSummarySubtitle returns a specific string
            expect(screen.getByText('Based on BEAVRS study final model (only includes coefficients with p < 0.05)')).toBeInTheDocument();
        });
    });

    describe('Print Functionality', () => {
        it('should render print button with correct text', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Print/Save');
            expect(button).toHaveAttribute('title', 'Print or save as PDF');
        });

        it('should call onPrint callback when button clicked', () => {
            const mockOnPrint = jest.fn();
            render(<RiskSummary probability="50" onPrint={mockOnPrint} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            expect(mockOnPrint).toHaveBeenCalledTimes(1);
        });

        it('should have no-print class for print CSS', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveClass('no-print');
        });

        it('should handle missing onPrint prop gracefully', () => {
            // Should not throw error
            expect(() => {
                render(<RiskSummary probability="50" />);
                const button = screen.getByRole('button');
                fireEvent.click(button);
            }).not.toThrow();
        });
    });

    describe('Probability Edge Cases', () => {
        it('should handle probability as number', () => {
            render(<RiskSummary probability={42.3} onPrint={jest.fn()} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 42%')).toBeInTheDocument();
        });

        it('should handle probability as string without percent', () => {
            render(<RiskSummary probability="33" onPrint={jest.fn()} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 33%')).toBeInTheDocument();
        });

        it('should handle very small probabilities', () => {
            render(<RiskSummary probability="0.4" onPrint={jest.fn()} />);
            
            // Should round 0.4 to 0
            expect(screen.getByText('Estimated Risk of Failure: 0%')).toBeInTheDocument();
        });

        it('should handle very large probabilities', () => {
            render(<RiskSummary probability="99.8" onPrint={jest.fn()} />);
            
            // Should round 99.8 to 100
            expect(screen.getByText('Estimated Risk of Failure: 100%')).toBeInTheDocument();
        });

        it('should handle invalid probability gracefully', () => {
            render(<RiskSummary probability="invalid" onPrint={jest.fn()} />);
            
            // NaN should result in "NaN%"
            expect(screen.getByText('Estimated Risk of Failure: NaN%')).toBeInTheDocument();
        });
    });

    describe('Component Layout', () => {
        it('should maintain correct visual structure', () => {
            const { container } = render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            // Check main container has correct classes
            const mainDiv = container.querySelector('.p-4.bg-gray-50.rounded-lg.risk-results');
            expect(mainDiv).toBeInTheDocument();
            
            // Check flex layout
            const flexDiv = container.querySelector('.flex.justify-between.items-center');
            expect(flexDiv).toBeInTheDocument();
            
            // Check text is in left div, button in right
            const textDiv = flexDiv.firstChild;
            const button = flexDiv.lastChild;
            
            expect(textDiv).toHaveTextContent('Estimated Risk of Failure');
            expect(button).toHaveTextContent('Print/Save');
        });

        it('should apply correct typography classes', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            const mainText = screen.getByText(/Estimated Risk of Failure/);
            expect(mainText).toHaveClass('text-lg', 'font-semibold');
            
            const subtitle = screen.getByText(/Based on BEAVRS study/);
            expect(subtitle).toHaveClass('text-sm', 'text-gray-600', 'mt-1');
        });
    });

    describe('Icon Integration', () => {
        it('should render Printer icon from lucide-react', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            // Look for the SVG element with lucide-react class pattern
            const button = screen.getByRole('button');
            const svg = button.querySelector('svg');
            
            expect(svg).toBeInTheDocument();
            // Lucide icons typically have specific attributes
            expect(svg).toHaveAttribute('width');
            expect(svg).toHaveAttribute('height');
        });

        it('should position icon before text in button', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            const button = screen.getByRole('button');
            const buttonContent = button.textContent;
            
            // Text should be "Print/Save" and icon should be before it
            expect(buttonContent).toMatch(/Print\/Save$/);
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button with proper labeling', () => {
            render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('title', 'Print or save as PDF');
            expect(button).toHaveTextContent('Print/Save');
        });

        it('should maintain semantic HTML structure', () => {
            const { container } = render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            // Should use p tags for text content
            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(2);
            
            // Should use button element for interaction
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should have proper reading order', () => {
            const { container } = render(<RiskSummary probability="50" onPrint={jest.fn()} />);
            
            const allText = container.textContent;
            const riskIndex = allText.indexOf('Estimated Risk');
            const subtitleIndex = allText.indexOf('Based on BEAVRS');
            const buttonIndex = allText.indexOf('Print/Save');
            
            expect(riskIndex).toBeLessThan(subtitleIndex);
            expect(subtitleIndex).toBeLessThan(buttonIndex);
        });
    });

    describe('Real-World Scenarios', () => {
        it('should handle typical surgical case - moderate risk', () => {
            render(<RiskSummary probability="45.2" onPrint={jest.fn()} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 45%')).toBeInTheDocument();
            expect(screen.getByText(/Based on BEAVRS study/)).toBeInTheDocument();
        });

        it('should handle high-risk surgical case', () => {
            render(<RiskSummary probability="87.3" onPrint={jest.fn()} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 87%')).toBeInTheDocument();
        });

        it('should handle low-risk surgical case', () => {
            render(<RiskSummary probability="12.8" onPrint={jest.fn()} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 13%')).toBeInTheDocument();
        });

        it('should support rapid updates for real-time calculations', () => {
            const { rerender } = render(<RiskSummary probability="20" onPrint={jest.fn()} />);
            
            expect(screen.getByText('Estimated Risk of Failure: 20%')).toBeInTheDocument();
            
            // Simulate rapid updates as user changes inputs
            rerender(<RiskSummary probability="35" onPrint={jest.fn()} />);
            expect(screen.getByText('Estimated Risk of Failure: 35%')).toBeInTheDocument();
            
            rerender(<RiskSummary probability="55.5" onPrint={jest.fn()} />);
            expect(screen.getByText('Estimated Risk of Failure: 56%')).toBeInTheDocument();
            
            rerender(<RiskSummary probability="72.1" onPrint={jest.fn()} />);
            expect(screen.getByText('Estimated Risk of Failure: 72%')).toBeInTheDocument();
        });
    });
});