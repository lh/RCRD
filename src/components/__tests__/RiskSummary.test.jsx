import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskSummary from '../RiskSummary';
import { getRiskSummaryText, getRiskSummarySubtitle } from '../../utils/riskResultsText';

// Mock the utility functions
jest.mock('../../utils/riskResultsText', () => ({
    getRiskSummaryText: jest.fn(),
    getRiskSummarySubtitle: jest.fn()
}));

// Mock lucide-react Printer icon
jest.mock('lucide-react', () => ({
    Printer: ({ size }) => <svg data-testid="printer-icon" data-size={size} />
}));

describe('RiskSummary', () => {
    const defaultProps = {
        probability: '75%',
        onPrint: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getRiskSummaryText.mockImplementation((prob) => `Risk probability: ${prob}`);
        getRiskSummarySubtitle.mockImplementation(() => 'Based on clinical factors');
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByText(/Risk probability/)).toBeInTheDocument();
        });

        it('should display summary text from utility function', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByText('Risk probability: 75%')).toBeInTheDocument();
        });

        it('should display subtitle text from utility function', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByText('Based on clinical factors')).toBeInTheDocument();
        });

        it('should render print button', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByRole('button')).toBeInTheDocument();
            expect(screen.getByText('Print/Save')).toBeInTheDocument();
        });

        it('should render printer icon', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByTestId('printer-icon')).toBeInTheDocument();
        });

        it('should have correct button title attribute', () => {
            render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('title', 'Print or save as PDF');
        });
    });

    describe('Props Handling', () => {
        it('should pass probability to getRiskSummaryText', () => {
            render(<RiskSummary probability="25%" onPrint={jest.fn()} />);
            expect(getRiskSummaryText).toHaveBeenCalledWith('25%');
        });

        it('should handle different probability formats', () => {
            const testCases = ['10%', '50.5%', '99.99%', '0.1%'];
            
            testCases.forEach((probability) => {
                getRiskSummaryText.mockClear();
                render(<RiskSummary probability={probability} onPrint={jest.fn()} />);
                expect(getRiskSummaryText).toHaveBeenCalledWith(probability);
            });
        });

        it('should call getRiskSummarySubtitle', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(getRiskSummarySubtitle).toHaveBeenCalled();
        });
    });

    describe('User Interactions', () => {
        it('should call onPrint when print button is clicked', () => {
            const mockOnPrint = jest.fn();
            render(<RiskSummary probability="50%" onPrint={mockOnPrint} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            expect(mockOnPrint).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple clicks on print button', () => {
            const mockOnPrint = jest.fn();
            render(<RiskSummary probability="50%" onPrint={mockOnPrint} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);
            
            expect(mockOnPrint).toHaveBeenCalledTimes(3);
        });

        it('should not throw error if onPrint is undefined', () => {
            expect(() => {
                render(<RiskSummary probability="50%" />);
                const button = screen.getByRole('button');
                fireEvent.click(button);
            }).not.toThrow();
        });
    });

    describe('Styling', () => {
        it('should apply correct CSS classes to container', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            const mainDiv = container.querySelector('.p-4.bg-gray-50.rounded-lg.risk-results');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should apply flex layout to inner container', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            const flexDiv = container.querySelector('.flex.justify-between.items-center');
            expect(flexDiv).toBeInTheDocument();
        });

        it('should apply correct CSS classes to summary text', () => {
            render(<RiskSummary {...defaultProps} />);
            const summaryText = screen.getByText(/Risk probability/);
            expect(summaryText).toHaveClass('text-lg', 'font-semibold');
        });

        it('should apply correct CSS classes to subtitle text', () => {
            render(<RiskSummary {...defaultProps} />);
            const subtitleText = screen.getByText('Based on clinical factors');
            expect(subtitleText).toHaveClass('text-sm', 'text-gray-600', 'mt-1');
        });

        it('should apply correct CSS classes to print button', () => {
            render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            expect(button).toHaveClass(
                'flex',
                'items-center',
                'gap-2',
                'px-3',
                'py-2',
                'text-sm',
                'text-gray-600',
                'hover:text-gray-900',
                'no-print'
            );
        });

        it('should have no-print class on button for print styles', () => {
            render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('no-print');
        });

        it('should have risk-results class for styling hooks', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            expect(container.querySelector('.risk-results')).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should have correct DOM hierarchy', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            
            const mainDiv = container.querySelector('.risk-results');
            expect(mainDiv).toBeInTheDocument();
            
            const flexContainer = mainDiv.querySelector('.flex');
            expect(flexContainer).toBeInTheDocument();
            
            const textContainer = flexContainer.querySelector('div');
            expect(textContainer).toBeInTheDocument();
            
            const button = flexContainer.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should render summary and subtitle in correct order', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            const paragraphs = container.querySelectorAll('p');
            
            expect(paragraphs).toHaveLength(2);
            expect(paragraphs[0]).toHaveTextContent('Risk probability: 75%');
            expect(paragraphs[1]).toHaveTextContent('Based on clinical factors');
        });

        it('should render icon before text in button', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            const buttonChildren = Array.from(button.children);
            
            expect(buttonChildren[0]).toHaveAttribute('data-testid', 'printer-icon');
            expect(buttonChildren[1]).toHaveTextContent('Print/Save');
        });
    });

    describe('Integration with Utility Functions', () => {
        it('should handle custom summary text', () => {
            getRiskSummaryText.mockReturnValue('High risk detected');
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByText('High risk detected')).toBeInTheDocument();
        });

        it('should handle custom subtitle text', () => {
            getRiskSummarySubtitle.mockReturnValue('Updated clinical model');
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByText('Updated clinical model')).toBeInTheDocument();
        });

        it('should handle empty string returns from utilities', () => {
            getRiskSummaryText.mockReturnValue('');
            getRiskSummarySubtitle.mockReturnValue('');
            
            const { container } = render(<RiskSummary {...defaultProps} />);
            const paragraphs = container.querySelectorAll('p');
            
            expect(paragraphs[0]).toHaveTextContent('');
            expect(paragraphs[1]).toHaveTextContent('');
        });

        it('should handle undefined returns from utilities', () => {
            getRiskSummaryText.mockReturnValue(undefined);
            getRiskSummarySubtitle.mockReturnValue(undefined);
            
            render(<RiskSummary {...defaultProps} />);
            // Should render without crashing
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should call utility functions once per render', () => {
            render(<RiskSummary {...defaultProps} />);
            expect(getRiskSummaryText).toHaveBeenCalledTimes(1);
            expect(getRiskSummarySubtitle).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long summary text', () => {
            const longText = 'Very long summary text '.repeat(20);
            getRiskSummaryText.mockReturnValue(longText);
            
            render(<RiskSummary {...defaultProps} />);
            // Check that the text is rendered (it will be normalized with single spaces)
            const summaryElement = screen.getByText((content, element) => {
                return element && element.className === 'text-lg font-semibold' && 
                       content.includes('Very long summary text');
            });
            expect(summaryElement).toBeInTheDocument();
        });

        it('should handle special characters in text', () => {
            getRiskSummaryText.mockReturnValue('Risk: >90% & <100%');
            getRiskSummarySubtitle.mockReturnValue('Model "A" & Model "B"');
            
            render(<RiskSummary {...defaultProps} />);
            expect(screen.getByText('Risk: >90% & <100%')).toBeInTheDocument();
            expect(screen.getByText('Model "A" & Model "B"')).toBeInTheDocument();
        });

        it('should handle probability prop with extra spaces', () => {
            render(<RiskSummary probability="  75%  " onPrint={jest.fn()} />);
            expect(getRiskSummaryText).toHaveBeenCalledWith('  75%  ');
        });

        it('should handle rapid re-renders', () => {
            const { rerender } = render(<RiskSummary {...defaultProps} />);
            
            for (let i = 0; i < 10; i++) {
                rerender(<RiskSummary probability={`${i * 10}%`} onPrint={defaultProps.onPrint} />);
            }
            
            expect(getRiskSummaryText).toHaveBeenLastCalledWith('90%');
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button with descriptive text', () => {
            render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            expect(button).toHaveAccessibleName();
        });

        it('should have descriptive title attribute on button', () => {
            render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('title', 'Print or save as PDF');
        });

        it('should maintain logical reading order', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            const allText = container.textContent;
            
            const summaryIndex = allText.indexOf('Risk probability');
            const subtitleIndex = allText.indexOf('Based on clinical factors');
            const buttonIndex = allText.indexOf('Print/Save');
            
            expect(summaryIndex).toBeLessThan(subtitleIndex);
            expect(subtitleIndex).toBeLessThan(buttonIndex);
        });

        it('should use semantic HTML elements', () => {
            const { container } = render(<RiskSummary {...defaultProps} />);
            
            expect(container.querySelector('button')).toBeInTheDocument();
            expect(container.querySelectorAll('p')).toHaveLength(2);
            expect(container.querySelectorAll('div')).toHaveLength(3);
        });
    });

    describe('Icon Integration', () => {
        it('should render Printer icon with correct size prop', () => {
            render(<RiskSummary {...defaultProps} />);
            const icon = screen.getByTestId('printer-icon');
            expect(icon).toHaveAttribute('data-size', '16');
        });

        it('should position icon correctly in button', () => {
            render(<RiskSummary {...defaultProps} />);
            const button = screen.getByRole('button');
            const firstChild = button.firstChild;
            expect(firstChild).toHaveAttribute('data-testid', 'printer-icon');
        });
    });
});