import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TamponadeSelection from '../TamponadeSelection';

describe('TamponadeSelection', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all tamponade options', () => {
        render(<TamponadeSelection {...defaultProps} />);
        
        const expectedOptions = [
            'SF6 gas',
            'C2F6 gas',
            'C3F8 gas',
            'Air',
            'Light silicone oil',
            'Heavy silicone oil'
        ];

        expectedOptions.forEach(option => {
            expect(screen.getByRole('radio', { name: option })).toBeInTheDocument();
        });
    });

    test('handles tamponade selection', () => {
        render(<TamponadeSelection {...defaultProps} />);
        
        const radio = screen.getByRole('radio', { name: /C2F6 gas/ });
        fireEvent.click(radio);
        
        expect(defaultProps.onChange).toHaveBeenCalledWith('c2f6');
    });

    test('disables selection when disabled prop is true', () => {
        render(<TamponadeSelection {...defaultProps} disabled={true} />);
        
        const radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect(radio).toBeDisabled();
        });
    });

    test('applies custom className', () => {
        const className = 'custom-class';
        render(<TamponadeSelection {...defaultProps} className={className} />);
        
        const container = screen.getByLabelText('Tamponade').closest('.space-y-4');
        expect(container).toHaveClass(className);
    });

    test('has proper accessibility attributes', () => {
        render(<TamponadeSelection {...defaultProps} />);
        
        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toHaveAttribute('aria-required', 'true');
        expect(radioGroup).toHaveAttribute('aria-labelledby', 'tamponade-group-label');
        expect(screen.getByText('Tamponade')).toHaveAttribute('id', 'tamponade-group-label');
    });

    test('maintains selection after multiple changes', () => {
        const { rerender } = render(<TamponadeSelection {...defaultProps} />);
        
        // Select C2F6
        fireEvent.click(screen.getByRole('radio', { name: /C2F6 gas/ }));
        expect(defaultProps.onChange).toHaveBeenCalledWith('c2f6');
        
        // Update component with new value
        rerender(<TamponadeSelection {...defaultProps} value="c2f6" />);
        expect(screen.getByRole('radio', { name: /C2F6 gas/ })).toBeChecked();
        
        // Change to light oil
        fireEvent.click(screen.getByRole('radio', { name: /Light silicone oil/ }));
        expect(defaultProps.onChange).toHaveBeenCalledWith('light_oil');
    });

    test('shows no selection by default', () => {
        render(<TamponadeSelection {...defaultProps} />);
        
        const radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect(radio).not.toBeChecked();
        });
    });

    test('preserves selected value on rerender', () => {
        const { rerender } = render(<TamponadeSelection {...defaultProps} value="c2f6" />);
        expect(screen.getByRole('radio', { name: /C2F6 gas/ })).toBeChecked();

        rerender(<TamponadeSelection {...defaultProps} value="c2f6" />);
        expect(screen.getByRole('radio', { name: /C2F6 gas/ })).toBeChecked();
    });

    test('each option has proper label association', () => {
        render(<TamponadeSelection {...defaultProps} />);
        
        const options = [
            { value: 'sf6', label: 'SF6 gas' },
            { value: 'c2f6', label: 'C2F6 gas' },
            { value: 'c3f8', label: 'C3F8 gas' },
            { value: 'air', label: 'Air' },
            { value: 'light_oil', label: 'Light silicone oil' },
            { value: 'heavy_oil', label: 'Heavy silicone oil' }
        ];

        options.forEach(option => {
            const radio = screen.getByRole('radio', { name: option.label });
            expect(radio).toHaveAttribute('id', `tamponade-${option.value}`);
            expect(screen.getByLabelText(option.label)).toBe(radio);
        });
    });
});
