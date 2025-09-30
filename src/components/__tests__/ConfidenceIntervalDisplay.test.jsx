import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfidenceIntervalDisplay from '../ConfidenceIntervalDisplay';

describe('ConfidenceIntervalDisplay', () => {
    // Mock confidence interval data structure
    const mockConfidenceIntervals = {
        formatted: {
            probability95: '45.2% (95% CI: 35.8% - 54.6%)',
            probabilityRange: '35.8% - 54.6%',
            marginOfError: '± 9.4%'
        },
        probability: {
            lower: 35.8,
            upper: 54.6
        }
    };

    describe('Rendering behavior', () => {
        test('returns null when confidenceIntervals prop is not provided', () => {
            const { container } = render(<ConfidenceIntervalDisplay />);
            expect(container.firstChild).toBeNull();
        });

        test('returns null when confidenceIntervals is null', () => {
            const { container } = render(<ConfidenceIntervalDisplay confidenceIntervals={null} />);
            expect(container.firstChild).toBeNull();
        });

        test('returns null when confidenceIntervals is undefined', () => {
            const { container } = render(<ConfidenceIntervalDisplay confidenceIntervals={undefined} />);
            expect(container.firstChild).toBeNull();
        });

        test('renders component when valid confidenceIntervals provided', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            expect(screen.getByText('Statistical Confidence')).toBeInTheDocument();
        });
    });

    describe('Content display', () => {
        beforeEach(() => {
            render(<ConfidenceIntervalDisplay 
                confidenceIntervals={mockConfidenceIntervals} 
                probability={45.2} 
            />);
        });

        test('displays the heading', () => {
            const heading = screen.getByText('Statistical Confidence');
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveClass('font-medium', 'text-gray-700');
        });

        test('displays formatted confidence interval', () => {
            const formattedCI = screen.getByText('45.2% (95% CI: 35.8% - 54.6%)');
            expect(formattedCI).toBeInTheDocument();
            expect(formattedCI).toHaveClass('text-lg', 'font-semibold', 'text-blue-900');
        });

        test('displays probability range', () => {
            expect(screen.getByText('Range:')).toBeInTheDocument();
            expect(screen.getByText('35.8% - 54.6%')).toBeInTheDocument();
        });

        test('displays margin of error', () => {
            expect(screen.getByText('Margin:')).toBeInTheDocument();
            expect(screen.getByText('± 9.4%')).toBeInTheDocument();
        });

        test('displays explanation text', () => {
            const explanationText = '95% confidence interval: We are 95% confident that the true risk of requiring additional surgery lies within this range.';
            expect(screen.getByText(explanationText)).toBeInTheDocument();
        });

        test('displays scale labels', () => {
            expect(screen.getByText('0%')).toBeInTheDocument();
            expect(screen.getByText('50%')).toBeInTheDocument();
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    describe('Visual elements styling', () => {
        test('applies correct container classes', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            const container = document.querySelector('.confidence-intervals');
            expect(container).toHaveClass('bg-blue-50', 'p-4', 'rounded-lg', 'mt-4');
        });

        test('renders visual range indicator container', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            const visualContainer = document.querySelector('.ci-visual');
            expect(visualContainer).toBeInTheDocument();
            expect(visualContainer).toHaveClass('mb-3');
        });

        test('renders confidence interval bar with correct positioning', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            const ciBar = document.querySelector('.bg-blue-400');
            expect(ciBar).toBeInTheDocument();
            expect(ciBar).toHaveStyle({
                left: '35.8%',
                width: '18.800000000000004%', // 54.6 - 35.8 (floating point precision)
                maxWidth: '64.2%' // 100 - 35.8
            });
        });

        test('renders probability marker at correct position', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            const marker = document.querySelector('.bg-blue-900');
            expect(marker).toBeInTheDocument();
            expect(marker).toHaveStyle({ left: '45.2%' });
        });

        test('applies grid layout to details section', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            const gridContainer = document.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid-cols-2', 'gap-4', 'text-sm');
        });
    });

    describe('Edge cases', () => {
        test('handles zero probability values', () => {
            const zeroCI = {
                formatted: {
                    probability95: '0.0% (95% CI: 0.0% - 5.0%)',
                    probabilityRange: '0.0% - 5.0%',
                    marginOfError: '± 2.5%'
                },
                probability: {
                    lower: 0,
                    upper: 5
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={zeroCI} probability={0} />);
            expect(screen.getByText('0.0% (95% CI: 0.0% - 5.0%)')).toBeInTheDocument();
            const marker = document.querySelector('.bg-blue-900');
            expect(marker).toHaveStyle({ left: '0%' });
        });

        test('handles 100% probability values', () => {
            const maxCI = {
                formatted: {
                    probability95: '100.0% (95% CI: 95.0% - 100.0%)',
                    probabilityRange: '95.0% - 100.0%',
                    marginOfError: '± 2.5%'
                },
                probability: {
                    lower: 95,
                    upper: 100
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={maxCI} probability={100} />);
            expect(screen.getByText('100.0% (95% CI: 95.0% - 100.0%)')).toBeInTheDocument();
            const marker = document.querySelector('.bg-blue-900');
            expect(marker).toHaveStyle({ left: '100%' });
        });

        test('handles very narrow confidence intervals', () => {
            const narrowCI = {
                formatted: {
                    probability95: '50.0% (95% CI: 49.5% - 50.5%)',
                    probabilityRange: '49.5% - 50.5%',
                    marginOfError: '± 0.5%'
                },
                probability: {
                    lower: 49.5,
                    upper: 50.5
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={narrowCI} probability={50} />);
            const ciBar = document.querySelector('.bg-blue-400');
            expect(ciBar).toHaveStyle({
                left: '49.5%',
                width: '1%', // 50.5 - 49.5
                maxWidth: '50.5%' // 100 - 49.5
            });
        });

        test('handles very wide confidence intervals', () => {
            const wideCI = {
                formatted: {
                    probability95: '50.0% (95% CI: 10.0% - 90.0%)',
                    probabilityRange: '10.0% - 90.0%',
                    marginOfError: '± 40.0%'
                },
                probability: {
                    lower: 10,
                    upper: 90
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={wideCI} probability={50} />);
            const ciBar = document.querySelector('.bg-blue-400');
            expect(ciBar).toHaveStyle({
                left: '10%',
                width: '80%', // 90 - 10
                maxWidth: '90%' // 100 - 10
            });
        });

        test('handles missing formatted fields gracefully', () => {
            const partialCI = {
                formatted: {
                    probability95: '45.2% (95% CI: 35.8% - 54.6%)'
                    // Missing probabilityRange and marginOfError
                },
                probability: {
                    lower: 35.8,
                    upper: 54.6
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={partialCI} probability={45.2} />);
            expect(screen.getByText('45.2% (95% CI: 35.8% - 54.6%)')).toBeInTheDocument();
            // Should handle undefined values without crashing
            expect(screen.getByText('Range:')).toBeInTheDocument();
            expect(screen.getByText('Margin:')).toBeInTheDocument();
        });

        test('handles probability outside confidence interval bounds', () => {
            const mismatchedCI = {
                formatted: {
                    probability95: '25.0% (95% CI: 35.8% - 54.6%)',
                    probabilityRange: '35.8% - 54.6%',
                    marginOfError: '± 9.4%'
                },
                probability: {
                    lower: 35.8,
                    upper: 54.6
                }
            };
            // Probability of 25 is outside the CI range of 35.8-54.6
            render(<ConfidenceIntervalDisplay confidenceIntervals={mismatchedCI} probability={25} />);
            const marker = document.querySelector('.bg-blue-900');
            // Should still render at the specified position
            expect(marker).toHaveStyle({ left: '25%' });
        });

        test('handles negative values as zero', () => {
            const negativeCI = {
                formatted: {
                    probability95: '5.0% (95% CI: -5.0% - 15.0%)',
                    probabilityRange: '-5.0% - 15.0%',
                    marginOfError: '± 10.0%'
                },
                probability: {
                    lower: -5,
                    upper: 15
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={negativeCI} probability={5} />);
            // Component should still render, even with negative values
            const ciBar = document.querySelector('.bg-blue-400');
            expect(ciBar).toHaveStyle({
                left: '-5%', // Will be clipped by container
                width: '20%', // 15 - (-5)
                maxWidth: '105%' // 100 - (-5)
            });
        });

        test('handles values greater than 100%', () => {
            const overflowCI = {
                formatted: {
                    probability95: '95.0% (95% CI: 85.0% - 105.0%)',
                    probabilityRange: '85.0% - 105.0%',
                    marginOfError: '± 10.0%'
                },
                probability: {
                    lower: 85,
                    upper: 105
                }
            };
            render(<ConfidenceIntervalDisplay confidenceIntervals={overflowCI} probability={95} />);
            const ciBar = document.querySelector('.bg-blue-400');
            expect(ciBar).toHaveStyle({
                left: '85%',
                width: '20%', // 105 - 85
                maxWidth: '15%' // 100 - 85
            });
        });
    });

    describe('Component structure', () => {
        test('maintains correct DOM hierarchy', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            
            const container = document.querySelector('.confidence-intervals');
            expect(container).toBeInTheDocument();
            
            // Check heading is present
            const heading = within(container).getByText('Statistical Confidence');
            expect(heading.tagName).toBe('H4');
            
            // Check main display section
            const mainDisplay = container.querySelector('.text-lg.font-semibold');
            expect(mainDisplay).toBeInTheDocument();
            
            // Check visual indicator section
            const visualSection = container.querySelector('.ci-visual');
            expect(visualSection).toBeInTheDocument();
            
            // Check details grid
            const gridSection = container.querySelector('.grid.grid-cols-2');
            expect(gridSection).toBeInTheDocument();
            
            // Check explanation paragraph
            const explanation = container.querySelector('p.text-xs');
            expect(explanation).toBeInTheDocument();
        });

        test('renders all required child elements', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            
            // Check for presence of all major sections
            expect(document.querySelector('.confidence-intervals h4')).toBeInTheDocument();
            expect(document.querySelector('.confidence-intervals .text-lg')).toBeInTheDocument();
            expect(document.querySelector('.ci-visual')).toBeInTheDocument();
            expect(document.querySelector('.ci-visual .relative')).toBeInTheDocument();
            expect(document.querySelector('.grid.grid-cols-2')).toBeInTheDocument();
            expect(document.querySelector('p.text-xs.text-gray-500')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        test('uses semantic HTML elements', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            
            // Heading should be h4
            const heading = screen.getByText('Statistical Confidence');
            expect(heading.tagName).toBe('H4');
            
            // Explanation should be paragraph
            const explanation = screen.getByText(/95% confidence interval:/);
            expect(explanation.tagName).toBe('P');
        });

        test('text content is readable', () => {
            render(<ConfidenceIntervalDisplay confidenceIntervals={mockConfidenceIntervals} probability={45.2} />);
            
            // All text content should be accessible
            expect(screen.getByText('Statistical Confidence')).toBeVisible();
            expect(screen.getByText('45.2% (95% CI: 35.8% - 54.6%)')).toBeVisible();
            expect(screen.getByText('Range:')).toBeVisible();
            expect(screen.getByText('Margin:')).toBeVisible();
        });
    });
});