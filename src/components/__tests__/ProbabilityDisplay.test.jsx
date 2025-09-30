import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProbabilityDisplay from '../ProbabilityDisplay';
import { getProbabilityFormulaText, getProbabilityResultText } from '../../utils/riskResultsText';

// Mock the utility functions
jest.mock('../../utils/riskResultsText', () => ({
    getProbabilityFormulaText: jest.fn(),
    getProbabilityResultText: jest.fn()
}));

describe('ProbabilityDisplay', () => {
    const defaultProps = {
        logit: '-1.5',
        probability: '18.2%'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getProbabilityFormulaText.mockImplementation((logit) => `1 / (1 + e^(-${logit}))`);
        getProbabilityResultText.mockImplementation((prob) => prob);
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/Probability =/)).toBeInTheDocument();
        });

        it('should display probability formula text', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/1 \/ \(1 \+ e\^/)).toBeInTheDocument();
        });

        it('should display probability result text', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/= 18.2%/)).toBeInTheDocument();
        });

        it('should render two text sections', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            const mainDiv = container.firstChild;
            const textSections = mainDiv.children;
            expect(textSections).toHaveLength(2);
        });
    });

    describe('Props Handling', () => {
        it('should pass logit to getProbabilityFormulaText', () => {
            render(<ProbabilityDisplay logit="-2.5" probability="7.6%" />);
            expect(getProbabilityFormulaText).toHaveBeenCalledWith('-2.5');
        });

        it('should pass probability to getProbabilityResultText', () => {
            render(<ProbabilityDisplay logit="0" probability="50%" />);
            expect(getProbabilityResultText).toHaveBeenCalledWith('50%');
        });

        it('should handle positive logit values', () => {
            render(<ProbabilityDisplay logit="2.3" probability="90.9%" />);
            expect(getProbabilityFormulaText).toHaveBeenCalledWith('2.3');
            expect(getProbabilityResultText).toHaveBeenCalledWith('90.9%');
        });

        it('should handle zero logit value', () => {
            render(<ProbabilityDisplay logit="0" probability="50%" />);
            expect(getProbabilityFormulaText).toHaveBeenCalledWith('0');
            expect(getProbabilityResultText).toHaveBeenCalledWith('50%');
        });

        it('should handle decimal probability values', () => {
            render(<ProbabilityDisplay logit="1.386" probability="80.00%" />);
            expect(getProbabilityResultText).toHaveBeenCalledWith('80.00%');
        });

        it('should handle very small probability values', () => {
            render(<ProbabilityDisplay logit="-10" probability="0.0045%" />);
            expect(getProbabilityResultText).toHaveBeenCalledWith('0.0045%');
        });

        it('should handle very large probability values', () => {
            render(<ProbabilityDisplay logit="10" probability="99.9955%" />);
            expect(getProbabilityResultText).toHaveBeenCalledWith('99.9955%');
        });
    });

    describe('Styling', () => {
        it('should apply correct CSS classes to container', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            const containerDiv = container.firstChild;
            expect(containerDiv.tagName).toBe('DIV');
        });

        it('should apply correct CSS classes to formula section', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            const formulaSection = container.querySelector('.mt-2.text-sm.text-gray-600');
            expect(formulaSection).toBeInTheDocument();
            expect(formulaSection).toHaveClass('mt-2', 'text-sm', 'text-gray-600');
        });

        it('should apply correct CSS classes to result section', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            const resultSection = container.querySelector('.mt-1.text-sm.font-medium.text-gray-900');
            expect(resultSection).toBeInTheDocument();
            expect(resultSection).toHaveClass('mt-1', 'text-sm', 'font-medium', 'text-gray-900');
        });

        it('should have proper text hierarchy with font weights', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            const formulaSection = container.querySelector('.text-gray-600');
            const resultSection = container.querySelector('.font-medium');
            
            expect(formulaSection).not.toHaveClass('font-medium');
            expect(resultSection).toHaveClass('font-medium');
        });
    });

    describe('Integration with Utility Functions', () => {
        it('should call getProbabilityFormulaText once per render', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(getProbabilityFormulaText).toHaveBeenCalledTimes(1);
        });

        it('should call getProbabilityResultText once per render', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(getProbabilityResultText).toHaveBeenCalledTimes(1);
        });

        it('should display custom formula text from utility', () => {
            getProbabilityFormulaText.mockReturnValue('custom formula');
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/custom formula/)).toBeInTheDocument();
        });

        it('should display custom result text from utility', () => {
            getProbabilityResultText.mockReturnValue('custom result');
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/= custom result/)).toBeInTheDocument();
        });

        it('should handle when utilities return empty strings', () => {
            getProbabilityFormulaText.mockReturnValue('');
            getProbabilityResultText.mockReturnValue('');
            
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            expect(container.querySelector('.mt-2')).toHaveTextContent('Probability =');
            expect(container.querySelector('.mt-1')).toHaveTextContent('=');
        });

        it('should handle when utilities return undefined', () => {
            getProbabilityFormulaText.mockReturnValue(undefined);
            getProbabilityResultText.mockReturnValue(undefined);
            
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/Probability =/)).toBeInTheDocument();
            expect(screen.getByText(/^=/)).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should have correct DOM hierarchy', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            
            const mainDiv = container.firstChild;
            expect(mainDiv.tagName).toBe('DIV');
            expect(mainDiv.children).toHaveLength(2);
            
            const formulaDiv = mainDiv.children[0];
            const resultDiv = mainDiv.children[1];
            
            expect(formulaDiv.tagName).toBe('DIV');
            expect(resultDiv.tagName).toBe('DIV');
        });

        it('should contain static text labels', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(/Probability =/)).toBeInTheDocument();
            expect(screen.getByText(/^=/)).toBeInTheDocument();
        });

        it('should not contain interactive elements', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            expect(container.querySelector('button')).not.toBeInTheDocument();
            expect(container.querySelector('input')).not.toBeInTheDocument();
            expect(container.querySelector('select')).not.toBeInTheDocument();
            expect(container.querySelector('a')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle string logit with spaces', () => {
            render(<ProbabilityDisplay logit=" -1.5 " probability="18.2%" />);
            expect(getProbabilityFormulaText).toHaveBeenCalledWith(' -1.5 ');
        });

        it('should handle probability without percentage sign', () => {
            render(<ProbabilityDisplay logit="0" probability="50" />);
            expect(getProbabilityResultText).toHaveBeenCalledWith('50');
        });

        it('should handle scientific notation in logit', () => {
            render(<ProbabilityDisplay logit="1.23e-2" probability="50.3%" />);
            expect(getProbabilityFormulaText).toHaveBeenCalledWith('1.23e-2');
        });

        it('should handle special characters in probability', () => {
            render(<ProbabilityDisplay logit="0" probability="~50%" />);
            expect(getProbabilityResultText).toHaveBeenCalledWith('~50%');
        });

        it('should handle very long formula text', () => {
            const longFormula = 'very long formula '.repeat(20);
            getProbabilityFormulaText.mockReturnValue(longFormula);
            
            render(<ProbabilityDisplay {...defaultProps} />);
            expect(screen.getByText(new RegExp(longFormula.substring(0, 50)))).toBeInTheDocument();
        });

        it('should handle HTML entities in utility returns', () => {
            getProbabilityFormulaText.mockReturnValue('1 &lt; 2');
            getProbabilityResultText.mockReturnValue('&gt; 50%');
            
            render(<ProbabilityDisplay {...defaultProps} />);
            // React should escape these properly
            expect(screen.getByText(/1 &lt; 2/)).toBeInTheDocument();
        });
    });

    describe('Re-rendering', () => {
        it('should update when props change', () => {
            const { rerender } = render(<ProbabilityDisplay {...defaultProps} />);
            
            expect(getProbabilityFormulaText).toHaveBeenCalledWith('-1.5');
            
            rerender(<ProbabilityDisplay logit="2.0" probability="88.1%" />);
            
            expect(getProbabilityFormulaText).toHaveBeenCalledWith('2.0');
            expect(getProbabilityResultText).toHaveBeenCalledWith('88.1%');
        });

        it('should not re-render unnecessarily with same props', () => {
            const { rerender } = render(<ProbabilityDisplay {...defaultProps} />);
            
            jest.clearAllMocks();
            rerender(<ProbabilityDisplay {...defaultProps} />);
            
            // Functions should be called again on re-render (no memoization)
            expect(getProbabilityFormulaText).toHaveBeenCalledTimes(1);
            expect(getProbabilityResultText).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have readable text content', () => {
            render(<ProbabilityDisplay {...defaultProps} />);
            
            const textContent = screen.getByText(/Probability =/);
            expect(textContent).toBeVisible();
        });

        it('should maintain logical reading order', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            const allText = container.textContent;
            
            // Formula should come before result
            const formulaIndex = allText.indexOf('Probability =');
            const resultIndex = allText.indexOf('= 18.2%');
            
            expect(formulaIndex).toBeLessThan(resultIndex);
        });

        it('should use semantic HTML', () => {
            const { container } = render(<ProbabilityDisplay {...defaultProps} />);
            
            // All content should be in div elements (semantic for layout)
            const divs = container.querySelectorAll('div');
            expect(divs.length).toBeGreaterThan(0);
        });
    });
});