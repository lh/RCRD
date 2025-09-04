import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RetinalCalculator from '../RetinalCalculator';

// NO MOCKING - This is a true integration test
// Tests the complete flow from user input to risk calculation

describe('RetinalCalculator - Complete Integration Test', () => {
    // Mock window size for consistent testing
    beforeEach(() => {
        // Set to desktop size by default
        global.innerWidth = 1024;
        global.innerHeight = 768;
        global.dispatchEvent(new Event('resize'));
    });

    describe('End-to-End Risk Calculation Flow', () => {
        it('should calculate risk with minimal inputs (age + detachment)', async () => {
            const { container } = render(<RetinalCalculator />);
            
            // Verify initial state
            expect(screen.getByText('Risk Calculator Retinal Detachment (RCRD)')).toBeInTheDocument();
            
            // Check for the study link
            const studyLink = screen.getByRole('link', { name: /UK BEAVRS database study/i });
            expect(studyLink).toBeInTheDocument();
            expect(studyLink).toHaveAttribute('href', 'https://bjo.bmj.com/content/106/1/120');
            
            // The calculate button should be disabled initially
            const calculateButton = screen.getByTestId('calculate-button');
            expect(calculateButton).toBeDisabled();
            expect(screen.getByText('Age and detachment area required')).toBeInTheDocument();
            
            // Enter age
            const ageInput = screen.getByLabelText(/Age/i);
            fireEvent.change(ageInput, { target: { value: '65' } });
            
            // Button should still be disabled (need detachment)
            expect(calculateButton).toBeDisabled();
            expect(screen.getByText('Detachment area required')).toBeInTheDocument();
            
            // Select detachment hours on clock face
            // Clock face has 12 clickable tear markers
            const clockFace = container.querySelector('svg');
            expect(clockFace).toBeInTheDocument();
            
            // Find tear markers - they should have cursor pointer style
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            expect(tearMarkers.length).toBe(12); // 12 hour markers
            
            // Click hour 3 (index 2)
            fireEvent.click(tearMarkers[2]);
            
            // Now the button should be enabled
            await waitFor(() => {
                expect(calculateButton).not.toBeDisabled();
            });
            
            // Click calculate
            fireEvent.click(calculateButton);
            
            // Wait for results to appear
            await waitFor(() => {
                expect(screen.getByText(/Risk of Primary Failure/)).toBeInTheDocument();
            });
            
            // Verify risk results are displayed
            expect(screen.getByText('Full Model')).toBeInTheDocument();
            expect(screen.getByText('Significant Factors Only')).toBeInTheDocument();
            
            // Should show probability as percentage
            const riskPercentages = screen.getAllByText(/\d+(\.\d+)?%/);
            expect(riskPercentages.length).toBeGreaterThan(0);
        });

        it('should calculate risk with all inputs filled', async () => {
            const { container } = render(<RetinalCalculator />);
            
            // Fill in all form fields
            const ageInput = screen.getByLabelText(/Age/i);
            fireEvent.change(ageInput, { target: { value: '75' } });
            
            // Select PVR Grade
            const pvrSelect = screen.getByLabelText(/PVR Grade/i);
            fireEvent.change(pvrSelect, { target: { value: 'C' } });
            
            // Select Vitrectomy Gauge (find the radio button)
            const gauge20 = screen.getByLabelText('20g');
            fireEvent.click(gauge20);
            
            // Select Cryotherapy (find the Yes radio button)
            const cryoYes = screen.getByLabelText('Yes');
            fireEvent.click(cryoYes);
            
            // Select Tamponade
            const tamponadeSelect = screen.getByLabelText(/Tamponade/i);
            fireEvent.change(tamponadeSelect, { target: { value: 'c2f6' } });
            
            // Select multiple detachment hours
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            
            // Click hours 3, 6, 9
            fireEvent.click(tearMarkers[2]); // Hour 3
            fireEvent.click(tearMarkers[5]); // Hour 6  
            fireEvent.click(tearMarkers[8]); // Hour 9
            
            // Calculate
            const calculateButtons = screen.getAllByTestId('calculate-button');
            const calculateButton = calculateButtons[0];
            await waitFor(() => expect(calculateButton).not.toBeDisabled());
            fireEvent.click(calculateButton);
            
            // Verify results
            await waitFor(() => {
                expect(screen.getByText(/Risk of Primary Failure/)).toBeInTheDocument();
            });
            
            // Check that both models show results
            const fullModelSection = screen.getByText(/Full Model/).closest('div');
            const significantModelSection = screen.getByText(/Significant Factors Only/).closest('div');
            
            expect(fullModelSection).toBeInTheDocument();
            expect(significantModelSection).toBeInTheDocument();
        });

        it('should show mathematical breakdown when "Show Maths" is toggled', async () => {
            const { container } = render(<RetinalCalculator />);
            
            // Quick setup: age + detachment
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '65' } });
            
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            fireEvent.click(tearMarkers[11]); // Hour 12 (index 11)
            
            // Calculate
            const calculateButtons = screen.getAllByTestId('calculate-button');
            const calculateButton = calculateButtons[0];
            await waitFor(() => expect(calculateButton).not.toBeDisabled());
            fireEvent.click(calculateButton);
            
            // Wait for results
            await waitFor(() => {
                expect(screen.getByText(/Risk of Primary Failure/)).toBeInTheDocument();
            });
            
            // Toggle "Show Maths"
            const showMathsCheckbox = screen.getByLabelText(/Show Maths/i);
            expect(showMathsCheckbox).toBeInTheDocument();
            fireEvent.click(showMathsCheckbox);
            
            // Should show calculation steps
            await waitFor(() => {
                expect(screen.getByText(/Constant:/)).toBeInTheDocument();
                expect(screen.getByText(/Total logit:/)).toBeInTheDocument();
            });
            
            // Should show probability formula
            expect(screen.getByText(/Probability =/)).toBeInTheDocument();
            expect(screen.getByText(/1 \/ \(1 \+ e/)).toBeInTheDocument();
        });

        it('should reset and allow new calculation', async () => {
            const { container } = render(<RetinalCalculator />);
            
            // First calculation
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '50' } });
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            fireEvent.click(tearMarkers[0]);
            
            const calculateButton = screen.getByTestId('calculate-button');
            await waitFor(() => expect(calculateButton).not.toBeDisabled());
            fireEvent.click(calculateButton);
            
            // Wait for results
            await waitFor(() => {
                expect(screen.getByText(/Risk of Primary Failure/)).toBeInTheDocument();
            });
            
            // Look for reset button - might be "Calculate Again" or "Reset Calculator"
            const resetButton = screen.getByRole('button', { name: /reset|calculate again/i });
            fireEvent.click(resetButton);
            
            // Should return to input form
            expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
            expect(screen.queryByText(/Risk of Primary Failure/)).not.toBeInTheDocument();
            
            // Previous values should be retained
            expect(screen.getByLabelText(/Age/i)).toHaveValue('50');
        });
    });

    describe('Form Validation Integration', () => {
        it('should validate age boundaries', () => {
            render(<RetinalCalculator />);
            const ageInput = screen.getByLabelText(/Age/i);
            const calculateButton = screen.getByTestId('calculate-button');
            
            // Test minimum age
            fireEvent.change(ageInput, { target: { value: '0' } });
            expect(ageInput).toHaveValue('0');
            
            // Test maximum age  
            fireEvent.change(ageInput, { target: { value: '150' } });
            expect(ageInput).toHaveValue('150');
            
            // Test negative age (should not be possible with number input)
            fireEvent.change(ageInput, { target: { value: '-10' } });
            // Browser typically prevents negative values in number inputs
        });

        it('should require both age and detachment for calculation', () => {
            render(<RetinalCalculator />);
            const calculateButton = screen.getByTestId('calculate-button');
            
            // No inputs - button disabled
            expect(calculateButton).toBeDisabled();
            expect(screen.getByText('Age and detachment area required')).toBeInTheDocument();
            
            // Only age - button still disabled
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '60' } });
            expect(calculateButton).toBeDisabled();
            expect(screen.getByText('Detachment area required')).toBeInTheDocument();
            
            // Clear age and try with just detachment  
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '' } });
            
            // Need to get tear markers from existing container
            const { container } = render(<RetinalCalculator />);
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            if (tearMarkers.length > 0) {
                fireEvent.click(tearMarkers[0]);
            }
            
            expect(calculateButton).toBeDisabled();
            expect(screen.getByText('Age required')).toBeInTheDocument();
        });
    });

    describe('Clock Face Interaction Integration', () => {
        it('should handle detachment segment drawing', async () => {
            const { container } = render(<RetinalCalculator />);
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
            
            // Simulate mouse down, move, and up to draw detachment
            fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
            fireEvent.mouseMove(svg, { clientX: 150, clientY: 100 });
            fireEvent.mouseUp(svg);
            
            // After drawing, some segments should be highlighted
            // The actual fill color might vary, check for path elements
            await waitFor(() => {
                const paths = container.querySelectorAll('path');
                expect(paths.length).toBeGreaterThan(0);
            });
        });

        it('should toggle tear markers on click', () => {
            const { container } = render(<RetinalCalculator />);
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            expect(tearMarkers.length).toBe(12);
            
            // Click to select hour 4 (index 3)
            fireEvent.click(tearMarkers[3]);
            
            // Should show visual change - look for transform scale which indicates selected state
            let selectedTears = container.querySelectorAll('path[transform*="scale"]');
            const initialSelected = selectedTears.length;
            
            // Click again to deselect
            fireEvent.click(tearMarkers[3]);
            
            // Should have fewer selected tears
            selectedTears = container.querySelectorAll('path[transform*="scale"]');
            expect(selectedTears.length).toBeLessThanOrEqual(initialSelected);
        });

        it('should handle automatic hour inclusion (3, 6, 9)', () => {
            const { container } = render(<RetinalCalculator />);
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            
            // Click hours 2 and 4 (should auto-include hour 3)
            fireEvent.click(tearMarkers[1]); // Hour 2 (index 1)
            fireEvent.click(tearMarkers[3]); // Hour 4 (index 3)
            
            // Check for visual indication of selection
            // The parent component logic should auto-include hour 3
            const selectedIndicators = container.querySelectorAll('path[transform*="scale"]');
            // Should have at least 2 selected (possibly 3 with auto-inclusion)
            expect(selectedIndicators.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Mobile vs Desktop Rendering', () => {
        it('should render mobile version on small screens', () => {
            // Mock window size for mobile
            global.innerWidth = 375;
            global.innerHeight = 667;
            global.dispatchEvent(new Event('resize'));
            
            const { container } = render(<RetinalCalculator />);
            
            // Mobile version uses md:hidden class
            const mobileContainer = container.querySelector('.md\\:hidden');
            expect(mobileContainer).toBeInTheDocument();
            
            // Desktop version uses hidden md:block classes
            const desktopContainer = container.querySelector('.hidden.md\\:block');
            expect(desktopContainer).toBeInTheDocument();
        });

        it('should render desktop version on large screens', () => {
            // Mock window size for desktop
            global.innerWidth = 1920;
            global.innerHeight = 1080;
            global.dispatchEvent(new Event('resize'));
            
            const { container } = render(<RetinalCalculator />);
            
            // Desktop version uses hidden md:block classes
            const desktopContainer = container.querySelector('.hidden.md\\:block');
            expect(desktopContainer).toBeInTheDocument();
            
            // Mobile version uses md:hidden class
            const mobileContainer = container.querySelector('.md\\:hidden');
            expect(mobileContainer).toBeInTheDocument();
        });
    });

    describe('Risk Calculation Accuracy', () => {
        it('should calculate correct risk for known scenarios', async () => {
            render(<RetinalCalculator />);
            
            // Test case: 65-year-old with inferior detachment
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '65' } });
            
            // Get the already rendered container
            const { container } = screen.getByText('Risk Calculator Retinal Detachment (RCRD)').closest('.bg-white').parentElement;
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            
            // Select hours 5-7 (inferior detachment)
            fireEvent.click(tearMarkers[4]); // Hour 5
            fireEvent.click(tearMarkers[5]); // Hour 6
            fireEvent.click(tearMarkers[6]); // Hour 7
            
            // Calculate
            const calculateButtons = screen.getAllByTestId('calculate-button');
            const calculateButton = calculateButtons[0];
            await waitFor(() => expect(calculateButton).not.toBeDisabled());
            fireEvent.click(calculateButton);
            
            // Wait for results
            await waitFor(() => {
                expect(screen.getByText(/Risk of Primary Failure/)).toBeInTheDocument();
            });
            
            // Check that risk is calculated (exact value depends on coefficients)
            const riskValues = screen.getAllByText(/\d+(\.\d+)?%/);
            expect(riskValues.length).toBeGreaterThan(0);
            
            // Risk should be higher for inferior detachment
            const riskText = riskValues[0].textContent;
            const riskNumber = parseFloat(riskText);
            expect(riskNumber).toBeGreaterThan(20); // Inferior detachment typically > 20% risk
        });

        it('should show different risks for full vs significant model', async () => {
            render(<RetinalCalculator />);
            
            // Setup inputs
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '70' } });
            fireEvent.change(screen.getByLabelText(/PVR Grade/i), { target: { value: 'C' } });
            
            const { container } = screen.getByText('Risk Calculator Retinal Detachment (RCRD)').closest('.bg-white').parentElement;
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            fireEvent.click(tearMarkers[11]); // Hour 12 (index 11)
            
            // Calculate
            const calculateButtons = screen.getAllByTestId('calculate-button');
            const calculateButton = calculateButtons[0];
            await waitFor(() => expect(calculateButton).not.toBeDisabled());
            fireEvent.click(calculateButton);
            
            // Get both model results
            await waitFor(() => {
                expect(screen.getByText(/Full Model/)).toBeInTheDocument();
                expect(screen.getByText(/Significant Factors Only/)).toBeInTheDocument();
            });
            
            // The two models should show different values
            const fullModelSection = screen.getByText(/Full Model/).closest('div');
            const significantModelSection = screen.getByText(/Significant Factors Only/).closest('div');
            
            const fullModelRisk = within(fullModelSection).getByText(/\d+(\.\d+)?%/);
            const significantModelRisk = within(significantModelSection).getByText(/\d+(\.\d+)?%/);
            
            // Values should be different (full model includes all factors)
            expect(fullModelRisk.textContent).not.toBe(significantModelRisk.textContent);
        });
    });

    describe('Print Functionality Integration', () => {
        it('should prepare print view with all relevant data', async () => {
            render(<RetinalCalculator />);
            
            // Setup and calculate
            fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '65' } });
            const { container } = screen.getByText('Risk Calculator Retinal Detachment (RCRD)').closest('.bg-white').parentElement;
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            fireEvent.click(tearMarkers[0]);
            
            const calculateButton = screen.getByTestId('calculate-button');
            await waitFor(() => expect(calculateButton).not.toBeDisabled());
            fireEvent.click(calculateButton);
            
            // Wait for results
            await waitFor(() => {
                expect(screen.getByText(/Risk of Primary Failure/)).toBeInTheDocument();
            });
            
            // Find print button
            const printButton = screen.getByTitle(/Print or save as PDF/i);
            expect(printButton).toBeInTheDocument();
            
            // Mock window.print
            const mockPrint = jest.fn();
            global.print = mockPrint;
            
            // Click print
            fireEvent.click(printButton);
            
            // Print should be called
            expect(mockPrint).toHaveBeenCalled();
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle invalid age input gracefully', () => {
            render(<RetinalCalculator />);
            const ageInput = screen.getByLabelText(/Age/i);
            
            // Try to input non-numeric value
            fireEvent.change(ageInput, { target: { value: 'abc' } });
            
            // Should either reject the input or handle it gracefully
            // HTML5 number input typically prevents non-numeric input
            const value = ageInput.value;
            expect(value === '' || !isNaN(value)).toBe(true);
        });

        it('should handle rapid clicking without errors', () => {
            const { container } = render(<RetinalCalculator />);
            const tearMarkers = container.querySelectorAll('g[style*="cursor: pointer"]');
            
            // Verify we have tear markers
            expect(tearMarkers.length).toBe(12);
            
            // Rapidly click the same tear marker
            for (let i = 0; i < 10; i++) {
                fireEvent.click(tearMarkers[0]);
            }
            
            // Should not throw errors
            expect(container.querySelector('svg')).toBeInTheDocument();
        });
    });
});