import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RiskResults from '../RiskResults';
import { MODEL_TYPE } from '../../constants/modelTypes';

describe('RiskResults', () => {
    // Example case from the paper: 82-year-old patient with total RD, PVR grade C,
    // break at 6 o'clock, using 23g vitrectomy and silicone oil
    const mockFullModelRisk = {
        probability: 74.5,
        logit: 1.074,
        steps: [
            {
                step: 'Age group',
                value: 0.498,
                detail: '(≥80 years)',
                category: 'age',
            },
            {
                step: 'Break location',
                value: 0.607,
                detail: '(5-7 o\'clock)',
                category: 'breakLocation',
            },
            {
                step: 'Total detachment',
                value: 0.663,
                detail: '(Yes)',
                category: 'totalDetachment',
            },
            {
                step: 'Inferior detachment',
                value: 0.435,
                detail: '(6 hours)',
                category: 'inferiorDetachment',
            },
            {
                step: 'PVR grade',
                value: 0.220,
                detail: '(Grade C)',
                category: 'pvrGrade',
            },
            {
                step: 'Vitrectomy gauge',
                value: -0.408,
                detail: '(23g)',
                category: 'vitrectomyGauge',
            },
            {
                step: 'Tamponade',
                value: 0.670,
                detail: '(Light oil)',
                category: 'tamponade',
            }
        ]
    };

    // For significant model, some coefficients are excluded
    const mockSignificantModelRisk = {
        probability: 72.3,
        logit: 0.980,
        steps: [
            {
                step: 'Age group',
                value: 0.498,
                detail: '(≥80 years)',
                category: 'age',
            },
            {
                step: 'Break location',
                value: 0.607,
                detail: '(5-7 o\'clock)',
                category: 'breakLocation',
            },
            {
                step: 'Total detachment',
                value: 0.663,
                detail: '(Yes)',
                category: 'totalDetachment',
            },
            {
                step: 'Inferior detachment',
                value: 0.435,
                detail: '(6 hours)',
                category: 'inferiorDetachment',
            },
            {
                step: 'PVR grade',
                value: 0.220,
                detail: '(Grade C)',
                category: 'pvrGrade',
            },
            {
                step: 'Vitrectomy gauge',
                value: -0.408,
                detail: '(23g)',
                category: 'vitrectomyGauge',
                excluded: true,
            },
            {
                step: 'Tamponade',
                value: 0.670,
                detail: '(Light oil)',
                category: 'tamponade',
                excluded: true,
            }
        ]
    };

    describe('Medical Accuracy Validations', () => {
        it('should calculate and display risk probability within valid medical range', () => {
            render(<RiskResults 
                fullModelRisk={mockFullModelRisk} 
                significantModelRisk={mockSignificantModelRisk} 
            />);
            
            const probabilityElement = screen.getByTestId('risk-probability');
            const probabilityValue = screen.getByTestId('risk-probability-value');
            
            // Validate probability is within medical range (0-100%)
            expect(probabilityElement).toHaveAttribute('aria-label', 'Risk percentage: 74.5%');
            expect(probabilityValue).toHaveTextContent('74.5%');
            
            // Validate risk category assignment
            expect(probabilityElement).toHaveAttribute('data-risk-category', 'high-risk');
            expect(probabilityElement).toHaveAttribute('data-model-type', MODEL_TYPE.FULL);
            
            // Validate that probability matches the logit transformation
            const expectedProbability = (100 / (1 + Math.exp(-1.074))).toFixed(1);
            expect(probabilityValue.textContent).toBe(`${expectedProbability}%`);
        });

        it('should correctly categorize risk levels based on medical thresholds', () => {
            // Test low risk (<10%)
            const lowRisk = { probability: 8.5, logit: -2.35, steps: [] };
            const { rerender } = render(<RiskResults fullModelRisk={lowRisk} significantModelRisk={lowRisk} />);
            
            let probabilityElement = screen.getByTestId('risk-probability');
            expect(probabilityElement).toHaveAttribute('data-risk-category', 'low-risk');
            
            // Test moderate risk (10-25%)
            const moderateRisk = { probability: 18.0, logit: -1.52, steps: [] };
            rerender(<RiskResults fullModelRisk={moderateRisk} significantModelRisk={moderateRisk} />);
            
            probabilityElement = screen.getByTestId('risk-probability');
            expect(probabilityElement).toHaveAttribute('data-risk-category', 'moderate-risk');
            
            // Test high risk (>25%)
            const highRisk = { probability: 45.0, logit: -0.20, steps: [] };
            rerender(<RiskResults fullModelRisk={highRisk} significantModelRisk={highRisk} />);
            
            probabilityElement = screen.getByTestId('risk-probability');
            expect(probabilityElement).toHaveAttribute('data-risk-category', 'high-risk');
        });

        it('should validate coefficient values for clinical relevance', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            
            fireEvent.click(screen.getByText('Show Calculation Details'));
            
            // Validate age coefficient
            const ageStep = screen.getByTestId('step-age-group');
            expect(ageStep).toHaveAttribute('data-coefficient', '0.498');
            expect(ageStep).toHaveAttribute('data-category', 'age');
            
            // Validate PVR grade coefficient
            const pvrStep = screen.getByTestId('step-pvr-grade');
            expect(pvrStep).toHaveAttribute('data-coefficient', '0.22');
            expect(pvrStep).toHaveAttribute('data-category', 'pvrGrade');
            
            // Validate vitrectomy gauge (negative coefficient for smaller gauge)
            const gaugeStep = screen.getByTestId('step-vitrectomy-gauge');
            expect(gaugeStep).toHaveAttribute('data-coefficient', '-0.408');
            expect(parseFloat(gaugeStep.getAttribute('data-coefficient'))).toBeLessThan(0);
        });
    });

    it('should render basic risk results correctly', () => {
        render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
        
        // Check title using test ID for stronger assertion
        const resultsContainer = screen.getByTestId('risk-results');
        expect(resultsContainer).toHaveTextContent('Risk Calculation Results');
        
        // Check probability with medical validation
        const probabilityValue = screen.getByTestId('risk-probability-value');
        expect(probabilityValue).toHaveTextContent('74.5%');
        
        // Validate clinical context message
        expect(resultsContainer).toHaveTextContent('Probability of requiring additional surgery within 6 months');
        
        // Check model description with stronger selector
        const modelToggle = screen.getByTestId('model-toggle');
        expect(modelToggle).toHaveTextContent(/Full Model|Full Paper Model/);
    });

    it('should toggle calculation details visibility', () => {
        render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
        
        // Details should be hidden initially - check via query
        const detailsQuery = screen.queryByText('Calculation Details');
        expect(detailsQuery).toBeNull();
        
        // Click to show details
        fireEvent.click(screen.getByText('Show Calculation Details'));
        
        // Details should now be visible with specific structure validation
        const calculationDetails = screen.getByText('Calculation Details');
        expect(calculationDetails.tagName).toBe('H4');
        
        // Validate calculation structure
        const stepsHeader = screen.getByText('Steps');
        expect(stepsHeader.tagName).toBe('H5');
        
        const logitHeader = screen.getByText('Logit Transformation');
        expect(logitHeader.tagName).toBe('H5');
        
        // Validate specific step data with medical accuracy
        const ageStep = screen.getByTestId('step-age-group');
        expect(ageStep).toHaveAttribute('data-coefficient', '0.498');
        expect(ageStep).toHaveTextContent('Age group:');
        expect(ageStep).toHaveTextContent('0.498');
        
        // Check logit value with precision
        const logitDisplay = screen.getByText('Logit:').parentElement;
        expect(logitDisplay).toHaveTextContent('1.074');
        
        // Button text should change
        const toggleButton = screen.getByRole('button', { name: /hide calculation details/i });
        expect(toggleButton).toHaveTextContent('Hide Calculation Details');
    });

    it('should hide calculation details when toggled off', () => {
        render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
        
        // Show details first
        fireEvent.click(screen.getByText('Show Calculation Details'));
        const detailsVisible = screen.getByText('Calculation Details');
        expect(detailsVisible).toBeTruthy();
        
        // Hide details
        fireEvent.click(screen.getByText('Hide Calculation Details'));
        const detailsHidden = screen.queryByText('Calculation Details');
        expect(detailsHidden).toBeNull();
    });

    it('should switch between full and significant models', () => {
        render(
            <RiskResults 
                fullModelRisk={mockFullModelRisk} 
                significantModelRisk={mockSignificantModelRisk}
            />
        );
        
        // Initially shows full model with validation
        const probabilityElement = screen.getByTestId('risk-probability');
        const probabilityValue = screen.getByTestId('risk-probability-value');
        
        expect(probabilityValue).toHaveTextContent('74.5%');
        expect(probabilityElement).toHaveAttribute('data-model-type', MODEL_TYPE.FULL);
        
        // Switch to significant model
        const significantRadio = screen.getByLabelText(/Significant Only/);
        fireEvent.click(significantRadio);
        
        // Should now show significant model probability with validation
        expect(probabilityValue).toHaveTextContent('72.3%');
        expect(probabilityElement).toHaveAttribute('data-model-type', MODEL_TYPE.SIGNIFICANT);
        
        // Validate model description update
        const modelToggle = screen.getByTestId('model-toggle');
        expect(modelToggle).toHaveTextContent(/Significant|Significant Only/);
    });

    it('should display excluded coefficients in significant model', () => {
        render(
            <RiskResults 
                fullModelRisk={mockFullModelRisk} 
                significantModelRisk={mockSignificantModelRisk}
            />
        );
        
        // Switch to significant model and show details
        fireEvent.click(screen.getByLabelText(/Significant Only/));
        fireEvent.click(screen.getByText('Show Calculation Details'));
        
        // Check for excluded coefficient display with medical validation
        const excludedSteps = document.querySelectorAll('[data-excluded="true"]');
        expect(excludedSteps.length).toBeGreaterThan(0);
        
        // Validate exclusion reason
        const vitrectomyStep = screen.getByTestId('step-vitrectomy-gauge');
        expect(vitrectomyStep).toHaveAttribute('data-excluded', 'true');
        expect(vitrectomyStep).toHaveAttribute('data-p-value', '>=0.05');
        expect(vitrectomyStep).toHaveTextContent('0.000');
        expect(vitrectomyStep).toHaveTextContent(/excluded due to p ≥ 0.05/i);
    });

    it('should display logit transformation formula correctly', () => {
        render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
        
        fireEvent.click(screen.getByText('Show Calculation Details'));
        
        // Check for formula elements with mathematical validation
        const transformSection = screen.getByText('Logit Transformation').parentElement;
        
        // Validate formula structure
        const formula = within(transformSection).getByText(/p = 1 \/ \(1 \+ e/);
        expect(formula.parentElement).toHaveTextContent('p = 1 / (1 + e-logit)');
        
        // Validate mathematical components
        const probabilityExplanation = within(transformSection).getByText(/p is the probability/);
        expect(probabilityExplanation).toHaveTextContent(`p is the probability (${(mockFullModelRisk.probability/100).toFixed(3)})`);
        
        const eulerExplanation = within(transformSection).getByText(/e is Euler's number/);
        expect(eulerExplanation).toHaveTextContent("e is Euler's number (≈ 2.71828)");
        
        const logitExplanation = within(transformSection).getByText(/logit is the sum of coefficients/);
        expect(logitExplanation).toHaveTextContent(`logit is the sum of coefficients (${mockFullModelRisk.logit.toFixed(3)})`);
        
        // Validate calculation result
        const calculationResult = within(transformSection).getByText(/1 \/ \(1 \+/);
        const expectedExp = Math.exp(-mockFullModelRisk.logit).toFixed(3);
        const expectedProb = (mockFullModelRisk.probability/100).toFixed(3);
        expect(calculationResult).toHaveTextContent(`1 / (1 + ${expectedExp}) = ${expectedProb}`);
    });

    it('should handle mobile display correctly', () => {
        render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} isMobile={true} />);
        
        // Component should still render all elements with mobile context
        const resultsContainer = screen.getByTestId('risk-results');
        expect(resultsContainer).toHaveTextContent('Risk Calculation Results');
        
        const probabilityValue = screen.getByTestId('risk-probability-value');
        expect(probabilityValue).toHaveTextContent('74.5%');
        
        // Validate mobile-specific behavior in model toggle
        const modelToggle = screen.getByTestId('model-toggle');
        expect(modelToggle).toHaveAttribute('data-mobile', 'true');
    });

    it('should not render when risk data is missing', () => {
        const { container } = render(<RiskResults />);
        expect(container.firstChild).toBeNull();
    });

    it('should handle probability edge cases correctly', () => {
        // Test probability clamping for values over 100
        const overflowRisk = { probability: 150, logit: 10, steps: [] };
        const { rerender } = render(<RiskResults fullModelRisk={overflowRisk} significantModelRisk={overflowRisk} />);
        
        let probabilityValue = screen.getByTestId('risk-probability-value');
        expect(probabilityValue).toHaveTextContent('100.0%');
        
        // Test probability clamping for negative values
        const negativeRisk = { probability: -10, logit: -10, steps: [] };
        rerender(<RiskResults fullModelRisk={negativeRisk} significantModelRisk={negativeRisk} />);
        
        probabilityValue = screen.getByTestId('risk-probability-value');
        expect(probabilityValue).toHaveTextContent('0.0%');
        
        // Test NaN handling
        const nanRisk = { probability: NaN, logit: NaN, steps: [] };
        rerender(<RiskResults fullModelRisk={nanRisk} significantModelRisk={nanRisk} />);
        
        probabilityValue = screen.getByTestId('risk-probability-value');
        expect(probabilityValue).toHaveTextContent('0.0%');
    });

    describe('Coefficient Medical Validation', () => {
        it('should validate age coefficient increases risk for older patients', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            fireEvent.click(screen.getByText('Show Calculation Details'));
            
            const ageStep = screen.getByTestId('step-age-group');
            const coefficient = parseFloat(ageStep.getAttribute('data-coefficient'));
            
            // Age coefficient should be positive for ≥80 years (increases risk)
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.498, 3);
        });

        it('should validate PVR grade increases risk', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            fireEvent.click(screen.getByText('Show Calculation Details'));
            
            const pvrStep = screen.getByTestId('step-pvr-grade');
            const coefficient = parseFloat(pvrStep.getAttribute('data-coefficient'));
            
            // PVR Grade C should have positive coefficient (increases risk)
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.220, 3);
        });

        it('should validate smaller gauge vitrectomy reduces risk', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            fireEvent.click(screen.getByText('Show Calculation Details'));
            
            const gaugeStep = screen.getByTestId('step-vitrectomy-gauge');
            const coefficient = parseFloat(gaugeStep.getAttribute('data-coefficient'));
            
            // 23g (smaller gauge) should have negative coefficient (reduces risk)
            expect(coefficient).toBeLessThan(0);
            expect(coefficient).toBeCloseTo(-0.408, 3);
        });

        it('should validate tamponade type affects risk appropriately', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            fireEvent.click(screen.getByText('Show Calculation Details'));
            
            const tamponadeStep = screen.getByTestId('step-tamponade');
            const coefficient = parseFloat(tamponadeStep.getAttribute('data-coefficient'));
            
            // Light oil tamponade should have positive coefficient (increases risk vs gas)
            expect(coefficient).toBeGreaterThan(0);
            expect(coefficient).toBeCloseTo(0.670, 3);
        });
    });

    describe('Calculation Accuracy', () => {
        it('should verify logit sum matches individual coefficients', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            fireEvent.click(screen.getByText('Show Calculation Details'));
            
            // Sum all visible coefficients
            const steps = mockFullModelRisk.steps;
            const calculatedLogit = steps.reduce((sum, step) => sum + step.value, 0);
            
            // Compare with displayed logit
            const logitDisplay = screen.getByText('Logit:').parentElement;
            expect(logitDisplay).toHaveTextContent(calculatedLogit.toFixed(3));
            expect(calculatedLogit).toBeCloseTo(mockFullModelRisk.logit, 2);
        });

        it('should verify probability calculation from logit', () => {
            render(<RiskResults fullModelRisk={mockFullModelRisk} significantModelRisk={mockSignificantModelRisk} />);
            
            // Calculate expected probability from logit
            const expectedProbability = 100 / (1 + Math.exp(-mockFullModelRisk.logit));
            
            const probabilityValue = screen.getByTestId('risk-probability-value');
            const displayedProbability = parseFloat(probabilityValue.textContent);
            
            expect(displayedProbability).toBeCloseTo(expectedProbability, 1);
        });
    });
});