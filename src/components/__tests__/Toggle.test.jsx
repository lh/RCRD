import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Toggle from '../Toggle';

describe('Toggle', () => {
    const defaultProps = {
        id: 'test-toggle',
        name: 'test',
        checked: false,
        onChange: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders both options with default labels', () => {
        render(<Toggle {...defaultProps} />);
        
        expect(screen.getByLabelText('Yes')).toBeInTheDocument();
        expect(screen.getByLabelText('No')).toBeInTheDocument();
    });

    test('renders custom labels', () => {
        render(
            <Toggle 
                {...defaultProps} 
                labels={{ checked: '25 gauge', unchecked: 'Not 25 gauge' }}
            />
        );
        
        expect(screen.getByLabelText('25 gauge')).toBeInTheDocument();
        expect(screen.getByLabelText('Not 25 gauge')).toBeInTheDocument();
    });

    test('calls onChange with correct value when toggled', () => {
        render(<Toggle {...defaultProps} />);
        
        // Click "Yes" option
        fireEvent.click(screen.getByLabelText('Yes'));
        expect(defaultProps.onChange).toHaveBeenCalledWith(true);

        // Click "No" option
        fireEvent.click(screen.getByLabelText('No'));
        expect(defaultProps.onChange).toHaveBeenCalledWith(false);
    });

    test('reflects checked state correctly', () => {
        render(<Toggle {...defaultProps} checked={true} />);
        
        expect(screen.getByLabelText('Yes')).toBeChecked();
        expect(screen.getByLabelText('No')).not.toBeChecked();
    });

    test('adds mobile suffix to IDs when isMobile is true', () => {
        render(<Toggle {...defaultProps} isMobile={true} />);
        
        expect(screen.getByLabelText('Yes').id).toContain('-mobile');
        expect(screen.getByLabelText('No').id).toContain('-mobile');
    });

    test('displays help text when provided', () => {
        const helpText = 'Select 25 gauge for modern vitrectomy';
        render(<Toggle {...defaultProps} helpText={helpText} />);
        
        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    test('disables inputs when disabled prop is true', () => {
        render(<Toggle {...defaultProps} disabled={true} />);
        
        expect(screen.getByLabelText('Yes')).toBeDisabled();
        expect(screen.getByLabelText('No')).toBeDisabled();
    });

    test('applies custom className', () => {
        const className = 'custom-class';
        render(<Toggle {...defaultProps} className={className} />);
        
        const container = screen.getByLabelText('Yes').closest('.space-y-2');
        expect(container).toHaveClass(className);
    });

    test('maintains proper name grouping', () => {
        render(<Toggle {...defaultProps} />);
        
        const yesInput = screen.getByLabelText('Yes');
        const noInput = screen.getByLabelText('No');
        
        expect(yesInput.name).toBe(noInput.name);
        expect(yesInput.name).toBe('test');
    });

    test('maintains proper name grouping with mobile suffix', () => {
        render(<Toggle {...defaultProps} isMobile={true} />);
        
        const yesInput = screen.getByLabelText('Yes');
        const noInput = screen.getByLabelText('No');
        
        expect(yesInput.name).toBe(noInput.name);
        expect(yesInput.name).toBe('test-mobile');
    });
});
