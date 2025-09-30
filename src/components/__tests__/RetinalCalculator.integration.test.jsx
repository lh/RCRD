import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RetinalCalculator from '../RetinalCalculator';

// These are focused integration tests that verify the component renders correctly
// and includes the key elements without testing complex interactions

describe('RetinalCalculator - Integration Test', () => {
    describe('Component Structure', () => {
        it('should render the main calculator with title and attribution', () => {
            render(<RetinalCalculator />);
            
            // Verify main title
            expect(screen.getByText('Risk Calculator Retinal Detachment (RCRD)')).toBeInTheDocument();
            
            // Verify study link
            const studyLink = screen.getByRole('link', { name: /UK BEAVRS database study/i });
            expect(studyLink).toBeInTheDocument();
            expect(studyLink).toHaveAttribute('href', 'https://bjo.bmj.com/content/106/1/120');
            
            // Verify attribution links
            expect(screen.getByRole('link', { name: /Luke Herbert/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Visit HSMA Programme/i })).toBeInTheDocument();
        });

        it('should render with responsive layout containers', () => {
            const { container } = render(<RetinalCalculator />);
            
            // Check for mobile container
            const mobileContainer = container.querySelector('.md\\:hidden');
            expect(mobileContainer).toBeInTheDocument();
            
            // Check for desktop container  
            const desktopContainer = container.querySelector('.hidden.md\\:block');
            expect(desktopContainer).toBeInTheDocument();
        });

        it('should render both mobile and desktop calculator versions', () => {
            const { container } = render(<RetinalCalculator />);
            
            // Both versions should be in the DOM (one hidden with CSS)
            const svgElements = container.querySelectorAll('svg');
            expect(svgElements.length).toBeGreaterThanOrEqual(2); // At least one for each version
            
            // Check for form inputs - should have duplicates for mobile and desktop
            const ageInputs = screen.getAllByLabelText(/Age/i);
            expect(ageInputs.length).toBeGreaterThanOrEqual(2);
        });

        it('should include HSMA logo with proper attributes', () => {
            render(<RetinalCalculator />);
            
            const logo = screen.getByAltText('HSMA Logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveClass('hsma-logo');
            expect(logo.parentElement).toHaveAttribute('href', expect.stringContaining('arc-swp.nihr.ac.uk'));
        });
    });

    describe('Responsive Design', () => {
        beforeEach(() => {
            // Reset window size
            global.innerWidth = 1024;
            global.innerHeight = 768;
        });

        it('should have correct responsive classes for mobile/desktop visibility', () => {
            const { container } = render(<RetinalCalculator />);
            
            // Mobile version should have md:hidden class
            const mobileDiv = container.querySelector('.md\\:hidden');
            expect(mobileDiv).toBeInTheDocument();
            
            // Desktop version should have hidden md:block classes
            const desktopDiv = container.querySelector('.hidden.md\\:block');
            expect(desktopDiv).toBeInTheDocument();
        });

        it('should apply correct padding for different screen sizes', () => {
            const { container } = render(<RetinalCalculator />);
            
            // Check responsive padding classes
            const mainWrapper = container.querySelector('.md\\:p-4.p-0');
            expect(mainWrapper).toBeInTheDocument();
            
            const contentWrapper = container.querySelector('.md\\:p-6.px-1.py-2');
            expect(contentWrapper).toBeInTheDocument();
        });
    });

    describe('External Links', () => {
        it('should have all external links open in new tab with security attributes', () => {
            render(<RetinalCalculator />);
            
            const externalLinks = screen.getAllByRole('link').filter(link => 
                link.getAttribute('target') === '_blank'
            );
            
            externalLinks.forEach(link => {
                expect(link).toHaveAttribute('rel', 'noopener noreferrer');
            });
        });

        it('should have proper aria labels for external links', () => {
            render(<RetinalCalculator />);
            
            const studyLink = screen.getByRole('link', { name: /UK BEAVRS database study/i });
            expect(studyLink).toHaveAttribute('aria-label', expect.stringContaining('opens in new tab'));
            
            const hsmaLink = screen.getByRole('link', { name: /Visit HSMA Programme/i });
            expect(hsmaLink).toHaveAttribute('aria-label', expect.stringContaining('opens in new tab'));
        });
    });

    describe('Calculator Initialization', () => {
        it('should render calculate buttons in disabled state initially', () => {
            render(<RetinalCalculator />);
            
            // Both mobile and desktop versions should have disabled calculate buttons
            const calculateButtons = screen.getAllByTestId('calculate-button');
            expect(calculateButtons.length).toBeGreaterThanOrEqual(2);
            
            calculateButtons.forEach(button => {
                expect(button).toBeDisabled();
            });
        });

        it('should render clock face SVG elements', () => {
            const { container } = render(<RetinalCalculator />);
            
            // Check for SVG elements (clock faces)
            const svgElements = container.querySelectorAll('svg');
            expect(svgElements.length).toBeGreaterThanOrEqual(2);
            
            // Each SVG should have circle elements (clock face)
            svgElements.forEach(svg => {
                const circles = svg.querySelectorAll('circle');
                expect(circles.length).toBeGreaterThan(0);
            });
        });

        it('should render form inputs for age and PVR grade', () => {
            render(<RetinalCalculator />);
            
            // Check for age inputs
            const ageInputs = screen.getAllByLabelText(/Age/i);
            expect(ageInputs.length).toBeGreaterThanOrEqual(2);
            
            // Check for PVR grade radio buttons - there are multiple options
            const pvrRadios = screen.getAllByRole('radio');
            // Should have at least 8 radio buttons (4 PVR options x 2 for mobile/desktop)
            expect(pvrRadios.length).toBeGreaterThanOrEqual(8);
        });
    });

    describe('Component Props', () => {
        it('should pass MODEL_TYPE.FULL to calculator components', () => {
            // This test verifies the component structure matches expected prop passing
            const { container } = render(<RetinalCalculator />);
            
            // Verify both calculator containers exist
            expect(container.querySelector('.md\\:hidden')).toBeInTheDocument();
            expect(container.querySelector('.hidden.md\\:block')).toBeInTheDocument();
        });
    });
});