import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskInputForm from '../RiskInputForm';
import { TEST_DEFAULTS, TEST_AGES } from '../../test-utils/constants';

// NO MOCKING - Full integration test of the form component
// Tests actual form behavior, validation, and child component interactions

describe('RiskInputForm - Full Integration Test', () => {
    describe('Complete Form Rendering', () => {
        it('should render all form fields for left position', () => {
            render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            // Age input should be present
            expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Age/i)).toHaveValue(50);

            // PVR Grade radio buttons should be present
            expect(screen.getByRole('radio', { name: /No PVR/i })).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /Grade A/i })).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /Grade B/i })).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /Grade C/i })).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /No PVR/i })).toBeChecked();

            // Vitrectomy Gauge radio buttons should be present
            expect(screen.getByLabelText(/20 gauge/)).toBeInTheDocument();
            expect(screen.getByLabelText(/23 gauge/)).toBeInTheDocument();
            expect(screen.getByLabelText(/25 gauge/)).toBeInTheDocument();
        });

        it('should render all form fields for right position', () => {
            render(
                <RiskInputForm
                    cryotherapy="no"
                    setCryotherapy={jest.fn()}
                    tamponade="sf6"
                    setTamponade={jest.fn()}
                    position="right"
                />
            );

            // Cryotherapy radio buttons should be present
            expect(screen.getByLabelText(/No/)).toBeInTheDocument();
            expect(screen.getByLabelText(/Yes/)).toBeInTheDocument();

            // Tamponade radio buttons should be present
            expect(screen.getByLabelText(/SF6 gas/)).toBeInTheDocument();
            expect(screen.getByLabelText(/C2F6 gas/)).toBeInTheDocument();
            expect(screen.getByLabelText(/C3F8 gas/)).toBeInTheDocument();
            expect(screen.getByLabelText(/SF6 gas/)).toBeChecked();
        });
    });

    describe('Form Input Interactions', () => {
        it('should handle age input changes', () => {
            const mockSetAge = jest.fn();
            render(
                <RiskInputForm
                    age="50"
                    setAge={mockSetAge}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            const ageInput = screen.getByLabelText(/Age/i);
            
            // Change age
            fireEvent.change(ageInput, { target: { value: TEST_AGES.senior } });
            expect(mockSetAge).toHaveBeenCalledWith('65');

            // Clear age
            fireEvent.change(ageInput, { target: { value: '' } });
            expect(mockSetAge).toHaveBeenCalledWith('');
        });

        it('should handle PVR Grade selection', () => {
            const mockSetPvrGrade = jest.fn();
            render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={mockSetPvrGrade}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            // Click Grade C radio button
            const gradeC = screen.getByRole('radio', { name: /Grade C/i });
            fireEvent.click(gradeC);
            expect(mockSetPvrGrade).toHaveBeenCalledWith('C');

            // Click Grade A radio button
            const gradeA = screen.getByRole('radio', { name: /Grade A/i });
            fireEvent.click(gradeA);
            expect(mockSetPvrGrade).toHaveBeenCalledWith('A');
        });

        it('should handle Vitrectomy Gauge selection', () => {
            const mockSetGauge = jest.fn();
            render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={mockSetGauge}
                    position="left"
                />
            );

            // Click 20g
            const gauge20 = screen.getByLabelText(/20 gauge/);
            fireEvent.click(gauge20);
            expect(mockSetGauge).toHaveBeenCalledWith('20g');

            // Click 23g
            const gauge23 = screen.getByLabelText(/23 gauge/);
            fireEvent.click(gauge23);
            expect(mockSetGauge).toHaveBeenCalledWith('23g');
        });

        it('should handle Cryotherapy selection', () => {
            const mockSetCryo = jest.fn();
            const { rerender } = render(
                <RiskInputForm
                    cryotherapy="no"
                    setCryotherapy={mockSetCryo}
                    tamponade="sf6"
                    setTamponade={jest.fn()}
                    position="right"
                />
            );

            // Initially "No" should be selected
            const cryoNo = screen.getByLabelText(/No/);
            const cryoYes = screen.getByLabelText(/Yes/);
            expect(cryoNo).toBeChecked();
            expect(cryoYes).not.toBeChecked();

            // Click Yes (changes from no to yes)
            fireEvent.click(cryoYes);
            expect(mockSetCryo).toHaveBeenCalledWith('yes');

            // Rerender with new value
            rerender(
                <RiskInputForm
                    cryotherapy="yes"
                    setCryotherapy={mockSetCryo}
                    tamponade="sf6"
                    setTamponade={jest.fn()}
                    position="right"
                />
            );

            // Now "Yes" should be selected
            expect(cryoYes).toBeChecked();
            expect(cryoNo).not.toBeChecked();

            // Click No (changes from yes to no)
            fireEvent.click(cryoNo);
            expect(mockSetCryo).toHaveBeenCalledWith('no');
        });

        it('should handle Tamponade selection', () => {
            const mockSetTamponade = jest.fn();
            render(
                <RiskInputForm
                    cryotherapy="no"
                    setCryotherapy={jest.fn()}
                    tamponade="sf6"
                    setTamponade={mockSetTamponade}
                    position="right"
                />
            );

            // Click C2F6 radio button
            const c2f6 = screen.getByLabelText(/C2F6 gas/);
            fireEvent.click(c2f6);
            expect(mockSetTamponade).toHaveBeenCalledWith('c2f6');

            // Click Light Oil radio button
            const lightOil = screen.getByLabelText(/Light silicone oil/);
            fireEvent.click(lightOil);
            expect(mockSetTamponade).toHaveBeenCalledWith('light_oil');
        });
    });

    describe('Form Validation', () => {
        it('should accept valid age ranges', () => {
            const mockSetAge = jest.fn();
            render(
                <RiskInputForm
                    age=""
                    setAge={mockSetAge}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            const ageInput = screen.getByLabelText(/Age/i);
            
            // Test valid ages
            const validAges = ['18', '45', '65', '80', '100'];
            validAges.forEach(age => {
                fireEvent.change(ageInput, { target: { value: age } });
                expect(mockSetAge).toHaveBeenCalledWith(age);
            });
        });

        it('should handle edge case age values', () => {
            const mockSetAge = jest.fn();
            render(
                <RiskInputForm
                    age=""
                    setAge={mockSetAge}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            const ageInput = screen.getByLabelText(/Age/i);
            
            // Test boundary values
            fireEvent.change(ageInput, { target: { value: '0' } });
            expect(mockSetAge).toHaveBeenCalledWith('0');

            fireEvent.change(ageInput, { target: { value: '150' } });
            expect(mockSetAge).toHaveBeenCalledWith('150');

            // Test decimal
            fireEvent.change(ageInput, { target: { value: '65.5' } });
            expect(mockSetAge).toHaveBeenCalledWith('65.5');
        });

        it('should handle invalid input gracefully', () => {
            const mockSetAge = jest.fn();
            render(
                <RiskInputForm
                    age="50"
                    setAge={mockSetAge}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            const ageInput = screen.getByLabelText(/Age/i);
            
            // HTML5 number input typically prevents non-numeric input
            // But we can test empty string
            fireEvent.change(ageInput, { target: { value: '' } });
            expect(mockSetAge).toHaveBeenCalledWith('');
        });
    });

    describe('Form States and Styling', () => {
        it('should apply correct styling for left position', () => {
            const { container } = render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            // Check for position-specific classes
            const formContainer = container.firstChild;
            expect(formContainer).toHaveClass('space-y-4');
        });

        it('should apply correct styling for right position', () => {
            const { container } = render(
                <RiskInputForm
                    cryotherapy="no"
                    setCryotherapy={jest.fn()}
                    tamponade="sf6"
                    setTamponade={jest.fn()}
                    position="right"
                />
            );

            // Check for position-specific classes
            const formContainer = container.firstChild;
            expect(formContainer).toHaveClass('space-y-4');
        });

        it('should handle disabled state correctly', () => {
            render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                    disabled={true}
                />
            );

            // All inputs should be disabled
            const ageInput = screen.getByLabelText(/Age/i);
            expect(ageInput).toBeDisabled();

            // All PVR radio buttons should be disabled
            expect(screen.getByRole('radio', { name: /No PVR/i })).toBeDisabled();
            expect(screen.getByRole('radio', { name: /Grade A/i })).toBeDisabled();
            expect(screen.getByRole('radio', { name: /Grade B/i })).toBeDisabled();
            expect(screen.getByRole('radio', { name: /Grade C/i })).toBeDisabled();

            const gauge20 = screen.getByLabelText(/20 gauge/);
            expect(gauge20).toBeDisabled();
        });
    });

    describe('Child Component Integration', () => {
        it('should render GaugeSelection component with correct props', () => {
            const mockSetGauge = jest.fn();
            render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="23g"
                    setVitrectomyGauge={mockSetGauge}
                    position="left"
                />
            );

            // GaugeSelection should render with correct selected value
            const gauge23 = screen.getByLabelText(/23 gauge/);
            expect(gauge23).toBeChecked();

            const gauge20 = screen.getByLabelText(/20 gauge/);
            expect(gauge20).not.toBeChecked();
        });

        it('should render TamponadeSelection component with correct props', () => {
            render(
                <RiskInputForm
                    cryotherapy="no"
                    setCryotherapy={jest.fn()}
                    tamponade="c3f8"
                    setTamponade={jest.fn()}
                    position="right"
                />
            );

            // TamponadeSelection should render with correct selected value
            const c3f8Radio = screen.getByLabelText(/C3F8 gas/);
            expect(c3f8Radio).toBeChecked();
            const sf6Radio = screen.getByLabelText(/SF6 gas/);
            expect(sf6Radio).not.toBeChecked();
        });

        it('should render CryotherapySelection component with correct props', () => {
            render(
                <RiskInputForm
                    cryotherapy="yes"
                    setCryotherapy={jest.fn()}
                    tamponade="sf6"
                    setTamponade={jest.fn()}
                    position="right"
                />
            );

            // CryotherapySelection should render with correct selected value
            const cryoYes = screen.getByLabelText(/Yes/);
            expect(cryoYes).toBeChecked();

            const cryoNo = screen.getByLabelText(/No/);
            expect(cryoNo).not.toBeChecked();
        });
    });

    describe('Accessibility', () => {
        it('should have proper labels for all form fields', () => {
            render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            // All inputs should have associated labels
            expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /No PVR/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/20 gauge/)).toBeInTheDocument();
        });

        it('should have proper ARIA attributes', () => {
            render(
                <RiskInputForm
                    age=""
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            const ageInput = screen.getByLabelText(/Age/i);
            
            // Should have appropriate input attributes
            expect(ageInput).toHaveAttribute('type', 'number');
            expect(ageInput).toHaveAttribute('id');
        });

        it('should maintain proper tab order', () => {
            const { container } = render(
                <RiskInputForm
                    age="50"
                    setAge={jest.fn()}
                    pvrGrade="none"
                    setPvrGrade={jest.fn()}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            // Get all focusable elements
            const focusableElements = container.querySelectorAll(
                'input, select, button, [tabindex]:not([tabindex="-1"])'
            );

            // Should have multiple focusable elements in order
            expect(focusableElements.length).toBeGreaterThan(0);
            
            // First should be age input
            expect(focusableElements[0]).toHaveAttribute('type', 'number');
        });
    });

    describe('Real-World Scenarios', () => {
        it('should handle typical patient data entry flow', () => {
            const mockSetAge = jest.fn();
            const mockSetPvr = jest.fn();
            const mockSetGauge = jest.fn();

            render(
                <RiskInputForm
                    age=""
                    setAge={mockSetAge}
                    pvrGrade="none"
                    setPvrGrade={mockSetPvr}
                    vitrectomyGauge="25g"
                    setVitrectomyGauge={mockSetGauge}
                    position="left"
                />
            );

            // Typical flow: Enter age, select PVR, select gauge
            const ageInput = screen.getByLabelText(/Age/i);
            fireEvent.change(ageInput, { target: { value: TEST_AGES.senior } });
            expect(mockSetAge).toHaveBeenCalledWith('65');

            const gradeC = screen.getByRole('radio', { name: /Grade C/i });
            fireEvent.click(gradeC);
            expect(mockSetPvr).toHaveBeenCalledWith('C');

            const gauge20 = screen.getByLabelText(/20 gauge/);
            fireEvent.click(gauge20);
            expect(mockSetGauge).toHaveBeenCalledWith('20g');
        });

        it('should handle data correction flow', () => {
            const mockSetAge = jest.fn();
            const mockSetPvr = jest.fn();

            const { rerender } = render(
                <RiskInputForm
                    age="45"
                    setAge={mockSetAge}
                    pvrGrade="C"
                    setPvrGrade={mockSetPvr}
                    vitrectomyGauge="20g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            // User realizes age was wrong
            const ageInput = screen.getByLabelText(/Age/i);
            fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
            expect(mockSetAge).toHaveBeenCalledWith('50');

            // User changes PVR grade
            const noPvr = screen.getByRole('radio', { name: /No PVR/i });
            fireEvent.click(noPvr);
            expect(mockSetPvr).toHaveBeenCalledWith('none');

            // Verify form reflects changes
            rerender(
                <RiskInputForm
                    age="50"
                    setAge={mockSetAge}
                    pvrGrade="none"
                    setPvrGrade={mockSetPvr}
                    vitrectomyGauge="20g"
                    setVitrectomyGauge={jest.fn()}
                    position="left"
                />
            );

            expect(screen.getByLabelText(/Age/i)).toHaveValue(50);
            expect(screen.getByRole('radio', { name: /No PVR/i })).toBeChecked();
        });
    });
});