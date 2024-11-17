import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GaugeSelection from '../GaugeSelection';

describe('GaugeSelection', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all gauge options', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const select = screen.getByRole('combobox');
        const options = Array.from(select.options).map(option => option.text);
        
        expect(options).toEqual([
            'Select gauge...',
            '20 gauge',
            '23 gauge',
            '25 gauge',
            '27 gauge',
            'Not recorded'
        ]);
    });

    test('handles gauge selection', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '25g' } });
        
        expect(defaultProps.onChange).toHaveBeenCalledWith('25g');
    });

    test('disables selection when disabled prop is true', () => {
        render(<GaugeSelection {...defaultProps} disabled={true} />);
        
        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    test('applies custom className', () => {
        const className = 'custom-class';
        render(<GaugeSelection {...defaultProps} className={className} />);
        
        const container = screen.getByLabelText('Vitrectomy Gauge').closest('.space-y-4');
        expect(container).toHaveClass(className);
    });

    test('has proper accessibility attributes', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const select = screen.getByRole('combobox');
        expect(select).toHaveAttribute('aria-required', 'true');
        expect(select).toHaveAttribute('id', 'gauge-select');
        expect(screen.getByLabelText('Vitrectomy Gauge')).toBeInTheDocument();
    });

    test('maintains selection after multiple changes', () => {
        const { rerender } = render(<GaugeSelection {...defaultProps} />);
        
        // Select 25g
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '25g' } });
        expect(defaultProps.onChange).toHaveBeenCalledWith('25g');
        
        // Update component with new value
        rerender(<GaugeSelection {...defaultProps} value="25g" />);
        expect(screen.getByRole('combobox')).toHaveValue('25g');
        
        // Change to another gauge
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '23g' } });
        expect(defaultProps.onChange).toHaveBeenCalledWith('23g');
    });

    test('shows empty selection by default', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const select = screen.getByRole('combobox');
        expect(select.value).toBe('');
        expect(select.options[0].text).toBe('Select gauge...');
    });

    test('preserves selected value on rerender', () => {
        const { rerender } = render(<GaugeSelection {...defaultProps} value="25g" />);
        expect(screen.getByRole('combobox')).toHaveValue('25g');

        rerender(<GaugeSelection {...defaultProps} value="25g" />);
        expect(screen.getByRole('combobox')).toHaveValue('25g');
    });
});
