import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskResults from '../RiskResults';
import { MODEL_TYPE } from '../../constants/modelTypes';

describe('RiskResults', () => {
    // Example case from the paper: 82-year-old patient with total RD, PVR grade C,
    // break at 6 o'clock, using 23g vitrectomy and silicone oil
    const mockRiskData = {
        probability: 74.5,
        logit: 1.074,
        steps: [
            {
                label: 'Age group',
                value: 0.498,
                detail: '(≥80 years)',
                category: 'age',
            },
            {
                label: 'Break location',
                value: 0.607,
                detail: '(5-7 o\'clock)',
                category: 'breakLocation',
            },
            {
                label: 'Total detachment',
                value: 0.663,
                detail: '(Yes)',
                category: 'totalDetachment',
            },
            {
                label: 'Inferior detachment',
                value: 0.435,
                detail: '(6 hours)',
                category: 'inferiorDetachment',
            },
            {
                label: 'PVR grade',
                value: 0.220,
                detail: '(Grade C)',
                category: 'pvrGrade',
            },
            {
                label: 'Vitrectomy gauge',
                value: -0.408,
                detail: '(23g)',
                category: 'vitrectomyGauge',
            },
            {
                label: 'Tamponade',
                value: 0.670,
                detail: '(Light oil)',
                category: 'tamponade',
            }
        ]
    };

    test('uses full model by default', () => {
        render(<RiskResults risk={mockRiskData} />);
        expect(screen.getByText(/includes all coefficients from Table 2/i)).toBeInTheDocument();
    });

    test('renders full model results correctly', () => {
        render(<RiskResults risk={mockRiskData} />);

        // Check probability and logit
        expect(screen.getByText('74.5%')).toBeInTheDocument();
        expect(screen.getByText('1.074')).toBeInTheDocument();

        // All coefficients should be shown with their values
        mockRiskData.steps.forEach(step => {
            expect(screen.getByText(step.label + ':')).toBeInTheDocument();
            expect(screen.getByText(step.value.toString())).toBeInTheDocument();
            expect(screen.getByText(step.detail)).toBeInTheDocument();
        });

        // Should show full model note
        expect(screen.getByText(/includes all coefficients from Table 2/i)).toBeInTheDocument();
    });

    test('allows switching to significant model', () => {
        render(<RiskResults risk={mockRiskData} />);

        // Find and click the model toggle
        const toggle = screen.getByRole('switch');
        fireEvent.click(toggle);

        // 23g vitrectomy should show as excluded (p ≥ 0.05)
        expect(screen.getByText('Vitrectomy gauge:')).toBeInTheDocument();
        expect(screen.getByText('0.000')).toBeInTheDocument();
        expect(screen.getByText(/excluded due to p ≥ 0.05/i)).toBeInTheDocument();

        // Other coefficients should be shown normally
        expect(screen.getByText('Age group:')).toBeInTheDocument();
        expect(screen.getByText('0.498')).toBeInTheDocument();

        // Should show significant model note
        expect(screen.getByText(/uses only statistically significant coefficients/i)).toBeInTheDocument();
    });

    test('allows switching back to full model', () => {
        render(<RiskResults risk={mockRiskData} />);

        // Switch to significant model
        const toggle = screen.getByRole('switch');
        fireEvent.click(toggle);

        // Switch back to full model
        fireEvent.click(toggle);

        // All coefficients should be shown with their values
        mockRiskData.steps.forEach(step => {
            expect(screen.getByText(step.label + ':')).toBeInTheDocument();
            expect(screen.getByText(step.value.toString())).toBeInTheDocument();
            expect(screen.getByText(step.detail)).toBeInTheDocument();
        });

        // Should show full model note
        expect(screen.getByText(/includes all coefficients from Table 2/i)).toBeInTheDocument();
    });

    test('handles null risk data', () => {
        render(<RiskResults risk={null} />);
        expect(screen.queryByText('Risk Calculation Results')).not.toBeInTheDocument();
    });

    test('preserves model selection when risk data updates', () => {
        const { rerender } = render(<RiskResults risk={mockRiskData} />);

        // Switch to significant model
        const toggle = screen.getByRole('switch');
        fireEvent.click(toggle);

        // Verify significant model is shown
        expect(screen.getByText(/uses only statistically significant coefficients/i)).toBeInTheDocument();

        // Update with new risk data
        const newRiskData = { ...mockRiskData, probability: 80.0 };
        rerender(<RiskResults risk={newRiskData} />);

        // Should still show significant model
        expect(screen.getByText(/uses only statistically significant coefficients/i)).toBeInTheDocument();
    });
});
