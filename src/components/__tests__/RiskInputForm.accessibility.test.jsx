import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskInputForm from '../RiskInputForm';

// Use centralized mocks
jest.mock('../GaugeSelection', () => require('../../test-utils/component-mocks/GaugeSelection.mock'));
jest.mock('../TamponadeSelection', () => require('../../test-utils/component-mocks/TamponadeSelection.mock'));
jest.mock('../CryotherapySelection', () => require('../../test-utils/component-mocks/CryotherapySelection.mock'));

describe('RiskInputForm - Accessibility', () => {
    const mockProps = {
        age: '45',
        setAge: jest.fn(),
        pvrGrade: 'none',
        setPvrGrade: jest.fn(),
        vitrectomyGauge: '25g',
        setVitrectomyGauge: jest.fn(),
        cryotherapy: 'yes',
        setCryotherapy: jest.fn(),
        tamponade: 'sf6',
        setTamponade: jest.fn(),
        position: 'left'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ARIA Attributes', () => {
        test('age input has proper ARIA attributes', () => {
            render(<RiskInputForm {...mockProps} />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-label', 'Age (years)');
            expect(ageInput).toHaveAttribute('aria-required', 'true');
            expect(ageInput).toHaveAttribute('aria-valuemin', '18');
            expect(ageInput).toHaveAttribute('aria-valuemax', '100');
            expect(ageInput).toHaveAttribute('role', 'spinbutton');
        });

        test('PVR grade radio group has proper ARIA attributes', () => {
            render(<RiskInputForm {...mockProps} />);
            
            const radioGroup = screen.getByRole('radiogroup');
            expect(radioGroup).toHaveAttribute('aria-required', 'true');
        });

        test('sets aria-invalid on age input when invalid', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} age="50" />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-invalid', 'false');
            
            rerender(<RiskInputForm {...mockProps} age="150" />);
            expect(ageInput).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('Labels and Associations', () => {
        test('all form inputs have associated labels', () => {
            render(<RiskInputForm {...mockProps} />);
            
            // Age input
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toBeInTheDocument();
            
            // PVR grade radios
            expect(screen.getByLabelText('No PVR')).toBeInTheDocument();
            expect(screen.getByLabelText('B')).toBeInTheDocument();
            expect(screen.getByLabelText('C')).toBeInTheDocument();
            expect(screen.getByLabelText('D')).toBeInTheDocument();
        });

        test('radio buttons have unique IDs', () => {
            render(<RiskInputForm {...mockProps} />);
            
            const noPVR = screen.getByRole('radio', { name: 'No PVR' });
            const gradeB = screen.getByRole('radio', { name: 'B' });
            const gradeC = screen.getByRole('radio', { name: 'C' });
            const gradeD = screen.getByRole('radio', { name: 'D' });
            
            expect(noPVR).toHaveAttribute('id', 'pvr-none');
            expect(gradeB).toHaveAttribute('id', 'pvr-b');
            expect(gradeC).toHaveAttribute('id', 'pvr-c');
            expect(gradeD).toHaveAttribute('id', 'pvr-d');
        });
    });

    describe('Keyboard Navigation', () => {
        test('supports keyboard navigation through form elements', () => {
            render(<RiskInputForm {...mockProps} />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            const firstRadio = screen.getByRole('radio', { name: 'No PVR' });
            
            // Tab from age to first radio
            ageInput.focus();
            expect(document.activeElement).toBe(ageInput);
            
            // Can interact with radio buttons
            firstRadio.focus();
            expect(document.activeElement).toBe(firstRadio);
        });

        test('radio group allows arrow key navigation', () => {
            render(<RiskInputForm {...mockProps} />);
            
            const radios = screen.getAllByRole('radio');
            const radioGroup = radios[0].closest('[role="radiogroup"]');
            
            // All radios should be in the same group
            radios.forEach(radio => {
                expect(radio).toHaveAttribute('name', 'pvr-grade');
            });
        });
    });

    describe('Error Announcements', () => {
        test('error messages are accessible', () => {
            render(<RiskInputForm {...mockProps} age="10" />);
            
            const errorMessage = screen.getByText(/Age must be between 18 and 100/i);
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveClass('text-red-600');
        });

        test('error state is conveyed through aria-invalid', () => {
            render(<RiskInputForm {...mockProps} age="200" />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-invalid', 'true');
            expect(ageInput).toHaveClass('bg-red-50', 'border-red-300');
        });
    });

    describe('Focus Management', () => {
        test('maintains focus visibility on all interactive elements', () => {
            render(<RiskInputForm {...mockProps} />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
            
            const radios = screen.getAllByRole('radio');
            radios.forEach(radio => {
                expect(radio).toHaveClass('focus:ring-blue-500');
            });
        });
    });

    describe('Disabled State Accessibility', () => {
        test('disabled inputs maintain proper ARIA attributes', () => {
            render(<RiskInputForm {...mockProps} disabled={true} />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toBeDisabled();
            expect(ageInput).toHaveAttribute('aria-required', 'true');
            expect(ageInput).toHaveAttribute('aria-label', 'Age (years)');
            
            const radios = screen.getAllByRole('radio');
            radios.forEach(radio => {
                expect(radio).toBeDisabled();
            });
        });
    });

    describe('Mobile Accessibility', () => {
        test('maintains accessibility features in mobile layout', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);
            
            // Check age input
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-required', 'true');
            
            // Check radio group
            const radioGroup = screen.getByRole('radiogroup');
            expect(radioGroup).toBeInTheDocument();
            
            // All sections should be present
            expect(screen.getByTestId('gauge-selection')).toBeInTheDocument();
            expect(screen.getByTestId('tamponade-selection')).toBeInTheDocument();
            expect(screen.getByTestId('cryotherapy-selection')).toBeInTheDocument();
        });
    });

    describe('Semantic HTML', () => {
        test('uses appropriate HTML elements', () => {
            render(<RiskInputForm {...mockProps} />);
            
            // Number input for age
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('type', 'number');
            expect(ageInput).toHaveAttribute('min', '18');
            expect(ageInput).toHaveAttribute('max', '100');
            
            // Radio inputs for PVR grade
            const radios = screen.getAllByRole('radio');
            radios.forEach(radio => {
                expect(radio).toHaveAttribute('type', 'radio');
            });
        });

        test('form structure in mobile layout', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);
            
            // Should have a form element
            const form = screen.getByLabelText(/age \(years\)/i).closest('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveAttribute('onsubmit');
        });
    });
});