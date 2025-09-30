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

    test('renders all gauge options as radio buttons', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        // Check radio group
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
        
        // Check all radio buttons
        expect(screen.getByLabelText('20 gauge')).toBeInTheDocument();
        expect(screen.getByLabelText('23 gauge')).toBeInTheDocument();
        expect(screen.getByLabelText('25 gauge')).toBeInTheDocument();
        expect(screen.getByLabelText('27 gauge')).toBeInTheDocument();
        expect(screen.getByLabelText('Not recorded')).toBeInTheDocument();
        
        // All should be radio inputs
        const radioButtons = screen.getAllByRole('radio');
        expect(radioButtons).toHaveLength(5);
    });

    test('handles gauge selection', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const gauge25 = screen.getByLabelText('25 gauge');
        fireEvent.click(gauge25);
        
        expect(defaultProps.onChange).toHaveBeenCalledWith('25g');
    });

    test('shows selected value', () => {
        render(<GaugeSelection {...defaultProps} value="23g" />);
        
        const gauge23 = screen.getByLabelText('23 gauge');
        expect(gauge23).toBeChecked();
        
        // Others should not be checked
        expect(screen.getByLabelText('20 gauge')).not.toBeChecked();
        expect(screen.getByLabelText('25 gauge')).not.toBeChecked();
    });

    test('disables all options when disabled prop is true', () => {
        render(<GaugeSelection {...defaultProps} disabled={true} />);
        
        const radioButtons = screen.getAllByRole('radio');
        radioButtons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });

    test('applies custom className', () => {
        const className = 'custom-class';
        render(<GaugeSelection {...defaultProps} className={className} />);
        
        const container = screen.getByRole('radiogroup').parentElement.parentElement;
        expect(container).toHaveClass(className);
        expect(container).toHaveClass('space-y-4'); // Default spacing
    });

    test('has proper accessibility attributes', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toHaveAttribute('aria-labelledby', 'gauge-group-label');
        expect(radioGroup).toHaveAttribute('aria-required', 'true');
        
        // Check label
        expect(screen.getByText('Vitrectomy Gauge')).toHaveAttribute('id', 'gauge-group-label');
    });

    test('maintains selection after multiple changes', () => {
        const { rerender } = render(<GaugeSelection {...defaultProps} />);
        
        // Select 25g
        fireEvent.click(screen.getByLabelText('25 gauge'));
        expect(defaultProps.onChange).toHaveBeenCalledWith('25g');
        
        // Update component with new value
        rerender(<GaugeSelection {...defaultProps} value="25g" />);
        expect(screen.getByLabelText('25 gauge')).toBeChecked();
        
        // Change to another gauge
        fireEvent.click(screen.getByLabelText('23 gauge'));
        expect(defaultProps.onChange).toHaveBeenCalledWith('23g');
    });

    test('all options have unique ids', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        expect(screen.getByRole('radio', { name: '20 gauge' })).toHaveAttribute('id', 'gauge-20g');
        expect(screen.getByRole('radio', { name: '23 gauge' })).toHaveAttribute('id', 'gauge-23g');
        expect(screen.getByRole('radio', { name: '25 gauge' })).toHaveAttribute('id', 'gauge-25g');
        expect(screen.getByRole('radio', { name: '27 gauge' })).toHaveAttribute('id', 'gauge-27g');
        expect(screen.getByRole('radio', { name: 'Not recorded' })).toHaveAttribute('id', 'gauge-not_recorded');
    });

    test('preserves selected value on rerender', () => {
        const { rerender } = render(<GaugeSelection {...defaultProps} value="25g" />);
        expect(screen.getByLabelText('25 gauge')).toBeChecked();

        rerender(<GaugeSelection {...defaultProps} value="25g" />);
        expect(screen.getByLabelText('25 gauge')).toBeChecked();
    });

    test('applies mobile styling when isMobile is true', () => {
        render(<GaugeSelection {...defaultProps} isMobile={true} />);
        
        const container = screen.getByRole('radiogroup').parentElement.parentElement;
        expect(container).toHaveClass('space-y-1'); // Mobile spacing
        
        const label = screen.getByText('Vitrectomy Gauge');
        expect(label).toHaveClass('mb-0.5'); // Mobile margin
    });

    test('all radio buttons share the same name attribute', () => {
        render(<GaugeSelection {...defaultProps} />);
        
        const radioButtons = screen.getAllByRole('radio');
        radioButtons.forEach(button => {
            expect(button).toHaveAttribute('name', 'gauge');
        });
    });
});