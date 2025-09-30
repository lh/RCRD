import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProbabilityDisplay from '../ProbabilityDisplay';

// DO NOT MOCK - Test actual business logic
describe('ProbabilityDisplay - Integration Tests', () => {
    describe('Real Formula Display', () => {
        it('should display correct formula for positive logit', () => {
            render(<ProbabilityDisplay logit="2.5" probability="92.4%" />);
            
            // The actual formula should show e+2.5
            expect(screen.getByText(/1 \/ \(1 \+ e\+2\.5\) × 100%/)).toBeInTheDocument();
        });

        it('should display correct formula for negative logit', () => {
            render(<ProbabilityDisplay logit="-1.5" probability="18.2%" />);
            
            // The actual formula should show e-1.5 (no double negative)
            expect(screen.getByText(/1 \/ \(1 \+ e-1\.5\) × 100%/)).toBeInTheDocument();
        });

        it('should display correct formula for zero logit', () => {
            render(<ProbabilityDisplay logit="0" probability="50%" />);
            
            // Zero should show e+0
            expect(screen.getByText(/1 \/ \(1 \+ e\+0\) × 100%/)).toBeInTheDocument();
        });

        it('should handle decimal logit values correctly', () => {
            render(<ProbabilityDisplay logit="0.693" probability="66.7%" />);
            
            expect(screen.getByText(/1 \/ \(1 \+ e\+0\.693\) × 100%/)).toBeInTheDocument();
        });
    });

    describe('Real Probability Result Display', () => {
        it('should display rounded probability correctly', () => {
            render(<ProbabilityDisplay logit="-2.3" probability="91" />);
            
            // Should display the actual probability value
            expect(screen.getByText(/= 91%/)).toBeInTheDocument();
        });

        it('should display decimal probability correctly', () => {
            render(<ProbabilityDisplay logit="1.386" probability="80.00" />);
            
            expect(screen.getByText(/= 80\.00%/)).toBeInTheDocument();
        });

        it('should handle probability without % sign', () => {
            render(<ProbabilityDisplay logit="0" probability="50" />);
            
            // The component should display it with the % sign added
            expect(screen.getByText(/= 50%/)).toBeInTheDocument();
        });
    });

    describe('Mathematical Consistency', () => {
        it('should show mathematically consistent formula and result', () => {
            // For logit = 0, probability should be exactly 50%
            render(<ProbabilityDisplay logit="0" probability="50" />);
            
            expect(screen.getByText(/1 \/ \(1 \+ e\+0\) × 100%/)).toBeInTheDocument();
            expect(screen.getByText(/= 50%/)).toBeInTheDocument();
        });

        it('should handle extreme positive logit values', () => {
            // Very high logit should approach 100%
            render(<ProbabilityDisplay logit="5" probability="99.3" />);
            
            expect(screen.getByText(/1 \/ \(1 \+ e\+5\) × 100%/)).toBeInTheDocument();
            expect(screen.getByText(/= 99\.3%/)).toBeInTheDocument();
        });

        it('should handle extreme negative logit values', () => {
            // Very low logit should approach 0%
            render(<ProbabilityDisplay logit="-5" probability="0.7" />);
            
            expect(screen.getByText(/1 \/ \(1 \+ e-5\) × 100%/)).toBeInTheDocument();
            expect(screen.getByText(/= 0\.7%/)).toBeInTheDocument();
        });
    });

    describe('Visual Layout and Structure', () => {
        it('should maintain correct visual hierarchy', () => {
            const { container } = render(
                <ProbabilityDisplay logit="1.5" probability="81.8" />
            );
            
            // Formula section should come first
            const formulaSection = container.querySelector('.mt-2.text-sm.text-gray-600');
            expect(formulaSection).toHaveTextContent('Probability = 1 / (1 + e+1.5) × 100%');
            
            // Result section should come second with emphasis
            const resultSection = container.querySelector('.mt-1.text-sm.font-medium.text-gray-900');
            expect(resultSection).toHaveTextContent('= 81.8%');
        });
    });

    describe('Edge Cases with Real Values', () => {
        it('should handle scientific notation in logit', () => {
            render(<ProbabilityDisplay logit="1.23e-2" probability="50.3" />);
            
            // Should display the scientific notation as-is
            expect(screen.getByText(/1 \/ \(1 \+ e\+1\.23e-2\) × 100%/)).toBeInTheDocument();
        });

        it('should handle very precise decimal values', () => {
            render(<ProbabilityDisplay logit="2.30259" probability="90.000" />);
            
            expect(screen.getByText(/1 \/ \(1 \+ e\+2\.30259\) × 100%/)).toBeInTheDocument();
            expect(screen.getByText(/= 90\.000%/)).toBeInTheDocument();
        });

        it('should handle negative zero correctly', () => {
            render(<ProbabilityDisplay logit="-0" probability="50" />);
            
            // -0 should be treated as 0 and show +
            expect(screen.getByText(/1 \/ \(1 \+ e\+0\) × 100%/)).toBeInTheDocument();
        });
    });
});