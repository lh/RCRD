import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModelToggle from '../ModelToggle';
import { MODEL_TYPE, MODEL_DESCRIPTIONS, MODEL_EXPLANATIONS } from '../../constants/modelTypes';

describe('ModelToggle', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    test('renders with significant model selected', () => {
        render(
            <ModelToggle 
                modelType={MODEL_TYPE.SIGNIFICANT} 
                onChange={mockOnChange} 
            />
        );

        // Check title and description
        expect(screen.getByText('Risk Model Selection')).toBeInTheDocument();
        expect(screen.getByText(MODEL_DESCRIPTIONS[MODEL_TYPE.SIGNIFICANT])).toBeInTheDocument();
        
        // Check explanation text (use partial matching due to whitespace)
        expect(screen.getByText(/This model includes only statistically significant coefficients/)).toBeInTheDocument();
        expect(screen.getByText(/following standard statistical practice/)).toBeInTheDocument();

        // Check that "Significant Only" radio is checked
        expect(screen.getByLabelText('Significant Only')).toBeChecked();
        expect(screen.getByLabelText('Full Model')).not.toBeChecked();
    });

    test('renders with full model selected', () => {
        render(
            <ModelToggle 
                modelType={MODEL_TYPE.FULL} 
                onChange={mockOnChange} 
            />
        );

        // Check title and description
        expect(screen.getByText('Risk Model Selection')).toBeInTheDocument();
        expect(screen.getByText(MODEL_DESCRIPTIONS[MODEL_TYPE.FULL])).toBeInTheDocument();
        
        // Check explanation text (use partial matching due to whitespace)
        expect(screen.getByText(/This model includes all coefficients from Table 2/)).toBeInTheDocument();
        expect(screen.getByText(/including those that did not reach statistical significance/)).toBeInTheDocument();

        // Check that "Full Model" radio is checked
        expect(screen.getByLabelText('Full Model')).toBeChecked();
        expect(screen.getByLabelText('Significant Only')).not.toBeChecked();
    });

    test('calls onChange when toggling between models', () => {
        const { rerender } = render(
            <ModelToggle 
                modelType={MODEL_TYPE.SIGNIFICANT} 
                onChange={mockOnChange} 
            />
        );

        // Initially "Significant Only" is checked
        expect(screen.getByLabelText('Significant Only')).toBeChecked();

        // Click "Full Model" radio button
        fireEvent.click(screen.getByLabelText('Full Model'));
        expect(mockOnChange).toHaveBeenCalledWith(MODEL_TYPE.FULL);

        // Clear mock and rerender with full model
        mockOnChange.mockClear();
        rerender(
            <ModelToggle 
                modelType={MODEL_TYPE.FULL} 
                onChange={mockOnChange} 
            />
        );

        // Now "Full Model" is checked, click "Significant Only"
        fireEvent.click(screen.getByLabelText('Significant Only'));
        expect(mockOnChange).toHaveBeenCalledWith(MODEL_TYPE.SIGNIFICANT);
    });

    test('hides title in mobile mode', () => {
        render(
            <ModelToggle 
                modelType={MODEL_TYPE.FULL} 
                onChange={mockOnChange} 
                isMobile={true}
            />
        );

        // Title should not be rendered in mobile mode
        expect(screen.queryByText('Risk Model Selection')).not.toBeInTheDocument();
        
        // But toggle and descriptions should still be present
        expect(screen.getByLabelText('Full Model')).toBeInTheDocument();
        expect(screen.getByText(MODEL_DESCRIPTIONS[MODEL_TYPE.FULL])).toBeInTheDocument();
    });

    test('renders as part of a radiogroup for accessibility', () => {
        render(
            <ModelToggle 
                modelType={MODEL_TYPE.FULL} 
                onChange={mockOnChange} 
            />
        );

        // Check that the Toggle component creates a radiogroup
        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toBeInTheDocument();
        
        // Check that both radio options are present
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(2);
    });
});