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
        expect(screen.getByText(MODEL_EXPLANATIONS[MODEL_TYPE.SIGNIFICANT].trim())).toBeInTheDocument();

        // Warning should not be present for significant model
        expect(screen.queryByText(/includes coefficients that did not reach statistical significance/i))
            .not.toBeInTheDocument();
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
        expect(screen.getByText(MODEL_EXPLANATIONS[MODEL_TYPE.FULL].trim())).toBeInTheDocument();

        // Warning should be present for full model
        expect(screen.getByText(/includes coefficients that did not reach statistical significance/i))
            .toBeInTheDocument();
    });

    test('calls onChange when toggling between models', () => {
        render(
            <ModelToggle 
                modelType={MODEL_TYPE.SIGNIFICANT} 
                onChange={mockOnChange} 
            />
        );

        // Click toggle to switch to full model
        fireEvent.click(screen.getByRole('switch'));
        expect(mockOnChange).toHaveBeenCalledWith(MODEL_TYPE.FULL);

        // Clear mock and render with full model
        mockOnChange.mockClear();
        render(
            <ModelToggle 
                modelType={MODEL_TYPE.FULL} 
                onChange={mockOnChange} 
            />
        );

        // Click toggle to switch to significant model
        fireEvent.click(screen.getByRole('switch'));
        expect(mockOnChange).toHaveBeenCalledWith(MODEL_TYPE.SIGNIFICANT);
    });
});
