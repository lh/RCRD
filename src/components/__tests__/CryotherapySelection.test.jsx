import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CryotherapySelection from '../CryotherapySelection';

describe('CryotherapySelection', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders cryotherapy options', () => {
        render(<CryotherapySelection {...defaultProps} />);
        
        expect(screen.getByRole('radio', { name: 'No' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Yes' })).toBeInTheDocument();
    });

    test('handles cryotherapy selection', () => {
        render(<CryotherapySelection {...defaultProps} />);
        
        const radio = screen.getByRole('radio', { name: 'Yes' });
        fireEvent.click(radio);
        
        expect(defaultProps.onChange).toHaveBeenCalledWith('yes');
    });

    test('disables selection when disabled prop is true', () => {
        render(<CryotherapySelection {...defaultProps} disabled={true} />);
        
        const radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect(radio).toBeDisabled();
        });
    });

    test('applies custom className', () => {
        const className = 'custom-class';
        render(<CryotherapySelection {...defaultProps} className={className} />);
        
        const container = screen.getByLabelText('Cryotherapy').closest('.space-y-4');
        expect(container).toHaveClass(className);
    });

    test('has proper accessibility attributes', () => {
        render(<CryotherapySelection {...defaultProps} />);
        
        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toHaveAttribute('aria-required', 'true');
        expect(radioGroup).toHaveAttribute('aria-labelledby', 'cryotherapy-group-label');
        expect(screen.getByText('Cryotherapy')).toHaveAttribute('id', 'cryotherapy-group-label');
    });

    test('maintains selection after multiple changes', () => {
        const { rerender } = render(<CryotherapySelection {...defaultProps} />);
        
        // Select Yes
        fireEvent.click(screen.getByRole('radio', { name: 'Yes' }));
        expect(defaultProps.onChange).toHaveBeenCalledWith('yes');
        
        // Update component with new value
        rerender(<CryotherapySelection {...defaultProps} value="yes" />);
        expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();
        
        // Change to No
        fireEvent.click(screen.getByRole('radio', { name: 'No' }));
        expect(defaultProps.onChange).toHaveBeenCalledWith('no');
    });

    test('shows no selection by default', () => {
        render(<CryotherapySelection {...defaultProps} />);
        
        const radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect(radio).not.toBeChecked();
        });
    });

    test('preserves selected value on rerender', () => {
        const { rerender } = render(<CryotherapySelection {...defaultProps} value="yes" />);
        expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();

        rerender(<CryotherapySelection {...defaultProps} value="yes" />);
        expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();
    });

    test('each option has proper label association', () => {
        render(<CryotherapySelection {...defaultProps} />);
        
        const options = [
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' }
        ];

        options.forEach(option => {
            const radio = screen.getByRole('radio', { name: option.label });
            expect(radio).toHaveAttribute('id', `cryo-${option.value}`);
            expect(screen.getByLabelText(option.label)).toBe(radio);
        });
    });
});
