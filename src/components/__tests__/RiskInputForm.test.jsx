import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TEST_DEFAULTS, TEST_AGES, VALIDATION_SCENARIOS } from '../../test-utils/constants';

// Use centralized mocks for consistency
jest.mock('../GaugeSelection', () => require('../../test-utils/component-mocks/GaugeSelection.mock').default);
jest.mock('../TamponadeSelection', () => require('../../test-utils/component-mocks/TamponadeSelection.mock').default);
jest.mock('../CryotherapySelection', () => require('../../test-utils/component-mocks/CryotherapySelection.mock').default);

import RiskInputForm from '../RiskInputForm';
import GaugeSelection from '../GaugeSelection';
import TamponadeSelection from '../TamponadeSelection';
import CryotherapySelection from '../CryotherapySelection';

describe('RiskInputForm - Unit Tests', () => {
    const mockProps = {
        age: TEST_DEFAULTS.age.value,
        setAge: jest.fn(),
        pvrGrade: 'b', // Keep 'b' as it's testing a non-default value
        setPvrGrade: jest.fn(),
        vitrectomyGauge: '23g', // Keep '23g' as it's testing a non-default value
        setVitrectomyGauge: jest.fn(),
        tamponade: TEST_DEFAULTS.tamponade.value,
        setTamponade: jest.fn(),
        cryotherapy: 'yes', // Keep 'yes' as it's testing a non-default value
        setCryotherapy: jest.fn(),
        errors: {},
        position: 'left'
    };

    const pvrOptions = [
        { value: 'none', label: 'None' },
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        test('renders age input with correct value', () => {
            render(<RiskInputForm {...mockProps} />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveValue(50);
        });

        test('renders PVR grade radio buttons', () => {
            render(<RiskInputForm {...mockProps} />);
            pvrOptions.forEach(option => {
                expect(screen.getByRole('radio', { name: option.label })).toBeInTheDocument();
            });
        });

        test('renders components based on position prop', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            expect(screen.getByTestId('gauge-selection')).toBeInTheDocument();
            expect(screen.queryByTestId('cryotherapy-selection')).not.toBeInTheDocument();
        });

        test('applies correct container classes', () => {
            const { container } = render(<RiskInputForm {...mockProps} />);
            const formContainer = container.firstChild;
            expect(formContainer).toHaveClass('space-y-4');
        });
    });

    describe('State Management', () => {
        test('calls setAge when age input changes', () => {
            render(<RiskInputForm {...mockProps} />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            
            fireEvent.change(ageInput, { target: { value: TEST_AGES.middle } });
            expect(mockProps.setAge).toHaveBeenCalledWith('60');
        });

        test('calls setPvrGrade when radio selection changes', () => {
            render(<RiskInputForm {...mockProps} />);
            const radioC = screen.getByRole('radio', { name: 'C' });
            
            fireEvent.click(radioC);
            expect(mockProps.setPvrGrade).toHaveBeenCalledWith('c');
        });

        test('passes correct props to child components', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            
            expect(GaugeSelection).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: '23g',
                    onChange: mockProps.setVitrectomyGauge,
                    disabled: false,
                    isMobile: false
                }),
                expect.anything()
            );
        });

        test('maintains state across re-renders', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} />);
            
            rerender(<RiskInputForm {...mockProps} age={TEST_AGES.elderly} />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveValue(75);
        });
    });

    describe('Error States', () => {
        test('shows age validation error', () => {
            render(<RiskInputForm {...mockProps} age={VALIDATION_SCENARIOS.invalidAgeTooYoung.value} position="left" />);
            expect(screen.getByText(/Age must be between 18 and 100/i)).toBeInTheDocument();
        });

        test('applies error styling to age input', () => {
            render(<RiskInputForm {...mockProps} age={VALIDATION_SCENARIOS.invalidAgeTooOld.value} position="left" />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveClass('bg-red-50', 'border-red-500');
        });

        test('clears error when valid age entered', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} age={VALIDATION_SCENARIOS.invalidAgeTooYoung.value} position="left" />);
            expect(screen.getByText(/Age must be between 18 and 100/i)).toBeInTheDocument();
            
            rerender(<RiskInputForm {...mockProps} age={TEST_DEFAULTS.age.value} position="left" />);
            expect(screen.queryByText(/Age must be between 18 and 100/i)).not.toBeInTheDocument();
        });

        test('handles empty age input', () => {
            render(<RiskInputForm {...mockProps} age="" position="left" />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveValue(null);
        });

        test('validates numeric age input', () => {
            render(<RiskInputForm {...mockProps} age="abc" position="left" />);
            expect(screen.getByText(/Age must be between 18 and 100/i)).toBeInTheDocument();
        });
    });

    describe('Disabled State', () => {
        test('disables age input when disabled prop is true', () => {
            render(<RiskInputForm {...mockProps} disabled={true} />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toBeDisabled();
        });

        test('disables PVR radio buttons when disabled', () => {
            render(<RiskInputForm {...mockProps} disabled={true} />);
            pvrOptions.forEach(option => {
                expect(screen.getByRole('radio', { name: option.label })).toBeDisabled();
            });
        });

        test('passes disabled state to child components', () => {
            render(<RiskInputForm {...mockProps} position="left" disabled={true} />);
            
            expect(GaugeSelection).toHaveBeenCalledWith(
                expect.objectContaining({ disabled: true }),
                expect.anything()
            );
        });

        test('applies disabled styling', () => {
            render(<RiskInputForm {...mockProps} disabled={true} />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveClass('opacity-50', 'cursor-not-allowed');
        });

        test('prevents state changes when disabled', () => {
            render(<RiskInputForm {...mockProps} disabled={true} />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            
            fireEvent.change(ageInput, { target: { value: TEST_AGES.middle } });
            expect(mockProps.setAge).not.toHaveBeenCalled();
        });
    });

    describe('Layout Variations', () => {
        describe('Desktop Layout', () => {
            test('renders desktop layout by default', () => {
                const { container } = render(<RiskInputForm {...mockProps} />);
                const formContainer = container.firstChild;
                expect(formContainer).toHaveClass('space-y-4');
                expect(formContainer).not.toHaveClass('mb-6');
            });

            test('shows left position components', () => {
                render(<RiskInputForm {...mockProps} position="left" />);
                expect(screen.getByTestId('gauge-selection')).toBeInTheDocument();
                expect(screen.queryByTestId('cryotherapy-selection')).not.toBeInTheDocument();
                expect(screen.queryByTestId('tamponade-selection')).not.toBeInTheDocument();
            });

            test('shows right position components', () => {
                render(<RiskInputForm {...mockProps} position="right" />);
                expect(screen.queryByTestId('gauge-selection')).not.toBeInTheDocument();
                expect(screen.getByTestId('cryotherapy-selection')).toBeInTheDocument();
                expect(screen.getByTestId('tamponade-selection')).toBeInTheDocument();
            });
        });

        describe('Mobile Layout', () => {
            test('renders mobile-specific styles', () => {
                const { container } = render(<RiskInputForm {...mockProps} isMobile={true} />);
                const formContainer = container.firstChild;
                expect(formContainer).toHaveClass('space-y-1');
            });

            test('shows all components in mobile view', () => {
                render(<RiskInputForm {...mockProps} isMobile={true} />);
                expect(screen.getByTestId('gauge-selection')).toBeInTheDocument();
                expect(screen.getByTestId('cryotherapy-selection')).toBeInTheDocument();
                expect(screen.getByTestId('tamponade-selection')).toBeInTheDocument();
            });

            test('passes isMobile prop to child components', () => {
                render(<RiskInputForm {...mockProps} isMobile={true} />);
                
                expect(GaugeSelection).toHaveBeenCalledWith(
                    expect.objectContaining({ isMobile: true }),
                    expect.anything()
                );
            });

            test('maintains proper spacing in mobile layout', () => {
                render(<RiskInputForm {...mockProps} isMobile={true} />);
                
                const form = screen.getByTestId('gauge-selection').closest('form');
                expect(form).toHaveClass('space-y-1');
            });
        });
    });

    describe('Component Interactions', () => {
        test('updates multiple fields in sequence', () => {
            render(<RiskInputForm {...mockProps} />);
            
            // Update age
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            fireEvent.change(ageInput, { target: { value: TEST_AGES.senior } });
            expect(mockProps.setAge).toHaveBeenCalledWith('65');
            
            // Update PVR grade
            const radioA = screen.getByRole('radio', { name: 'A' });
            fireEvent.click(radioA);
            expect(mockProps.setPvrGrade).toHaveBeenCalledWith('a');
        });

        test('maintains independent state for each field', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} />);
            
            // Change only age
            rerender(<RiskInputForm {...mockProps} age={TEST_AGES.elderly} />);
            expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(75);
            expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
            
            // Change only PVR
            rerender(<RiskInputForm {...mockProps} age={TEST_AGES.elderly} pvrGrade="c" />);
            expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(75);
            expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
        });
    });

    describe('Edge Cases', () => {
        test('handles missing props gracefully', () => {
            const minimalProps = {
                setAge: jest.fn(),
                setPvrGrade: jest.fn(),
                position: 'left'
            };
            
            render(<RiskInputForm {...minimalProps} />);
            expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(null);
        });

        test('handles position change', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} position="left" />);
            expect(screen.getByTestId('gauge-selection')).toBeInTheDocument();
            
            rerender(<RiskInputForm {...mockProps} position="right" />);
            expect(screen.queryByTestId('gauge-selection')).not.toBeInTheDocument();
            expect(screen.getByTestId('cryotherapy-selection')).toBeInTheDocument();
        });

        test('handles transition from mobile to desktop', () => {
            const { rerender, container } = render(<RiskInputForm {...mockProps} isMobile={true} />);
            let formContainer = container.firstChild;
            expect(formContainer).toHaveClass('space-y-1');
            
            rerender(<RiskInputForm {...mockProps} isMobile={false} />);
            formContainer = container.firstChild;
            expect(formContainer).toHaveClass('space-y-4');
        });
    });
});