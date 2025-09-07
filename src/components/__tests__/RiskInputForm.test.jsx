import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TEST_DEFAULTS, TEST_AGES, VALIDATION_SCENARIOS } from '../../test-utils/constants';

// Use centralized mocks for consistency
jest.mock('../GaugeSelection.jsx', () => require('../../test-utils/component-mocks/GaugeSelection.mock').default);
jest.mock('../TamponadeSelection.jsx', () => require('../../test-utils/component-mocks/TamponadeSelection.mock').default);
jest.mock('../CryotherapySelection.jsx', () => require('../../test-utils/component-mocks/CryotherapySelection.mock').default);

import RiskInputForm from '../RiskInputForm';

describe('RiskInputForm - Unit Tests', () => {
    const mockProps = {
        age: TEST_DEFAULTS.age.value,
        setAge: jest.fn(),
        pvrGrade: 'B', // Keep 'B' as it's testing a non-default value
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
        { value: 'none', label: 'No PVR' },
        { value: 'a', label: 'Grade A' },
        { value: 'b', label: 'Grade B' },
        { value: 'c', label: 'Grade C' }
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
            const radioC = screen.getByRole('radio', { name: 'Grade C' });
            
            fireEvent.click(radioC);
            expect(mockProps.setPvrGrade).toHaveBeenCalledWith('C');
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
            expect(ageInput).toHaveClass('bg-red-50', 'border-red-300');
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


    });

    describe('Layout Variations', () => {
        describe('Desktop Layout', () => {
            test('renders desktop layout by default', () => {
                const { container } = render(<RiskInputForm {...mockProps} />);
                const formContainer = container.firstChild;
                expect(formContainer).toHaveClass('space-y-4');
                expect(formContainer).not.toHaveClass('mb-6');
            });

        });

        describe('Mobile Layout', () => {
            test('renders mobile-specific styles', () => {
                const { container } = render(<RiskInputForm {...mockProps} isMobile={true} />);
                const formContainer = container.firstChild;
                expect(formContainer).toHaveClass('space-y-1');
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
            const radioA = screen.getByRole('radio', { name: 'Grade A' });
            fireEvent.click(radioA);
            expect(mockProps.setPvrGrade).toHaveBeenCalledWith('A');
        });

        test('maintains independent state for each field', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} />);
            
            // Change only age
            rerender(<RiskInputForm {...mockProps} age={TEST_AGES.elderly} />);
            expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(75);
            expect(screen.getByRole('radio', { name: 'Grade B' })).toBeChecked();
            
            // Change only PVR
            rerender(<RiskInputForm {...mockProps} age={TEST_AGES.elderly} pvrGrade="C" />);
            expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(75);
            expect(screen.getByRole('radio', { name: 'Grade C' })).toBeChecked();
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