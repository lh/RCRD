import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskInputForm from '../RiskInputForm';
import { pvrOptions } from '../../constants/riskCalculatorConstants';

// Mock child components
jest.mock('../GaugeSelection', () => {
    return function MockGaugeSelection({ value, onChange, disabled }) {
        return (
            <div data-testid="gauge-selection">
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    data-testid="gauge-select"
                >
                    <option value="">Select gauge...</option>
                    <option value="20g">20 gauge</option>
                    <option value="23g">23 gauge</option>
                    <option value="25g">25 gauge</option>
                    <option value="27g">27 gauge</option>
                    <option value="not_recorded">Not recorded</option>
                </select>
            </div>
        );
    };
});

jest.mock('../TamponadeSelection', () => {
    return function MockTamponadeSelection({ value, onChange, disabled }) {
        return (
            <div data-testid="tamponade-selection">
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    data-testid="tamponade-select"
                >
                    <option value="">Select tamponade...</option>
                    <option value="sf6">SF6 gas</option>
                    <option value="c2f6">C2F6 gas</option>
                    <option value="c3f8">C3F8 gas</option>
                    <option value="air">Air</option>
                    <option value="light_oil">Light oil</option>
                    <option value="heavy_oil">Heavy oil</option>
                </select>
            </div>
        );
    };
});

jest.mock('../CryotherapySelection', () => {
    return function MockCryotherapySelection({ value, onChange, disabled }) {
        return (
            <div data-testid="cryotherapy-selection">
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    data-testid="cryotherapy-select"
                >
                    <option value="">Select option...</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        );
    };
});

describe('RiskInputForm', () => {
    const mockProps = {
        age: '45',
        setAge: jest.fn(),
        pvrGrade: 'none',
        setPvrGrade: jest.fn(),
        vitrectomyGauge: '25g',
        setVitrectomyGauge: jest.fn(),
        cryotherapy: 'no',
        setCryotherapy: jest.fn(),
        tamponade: 'sf6',
        setTamponade: jest.fn(),
        position: 'left',
        onReset: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all selection components with correct props', () => {
        render(<RiskInputForm {...mockProps} position="right" />);

        // Verify gauge selection
        const gaugeSelect = screen.getByTestId('gauge-select');
        expect(gaugeSelect).toHaveValue('25g');
        fireEvent.change(gaugeSelect, { target: { value: '23g' } });
        expect(mockProps.setVitrectomyGauge).toHaveBeenCalledWith('23g');

        // Verify tamponade selection
        const tamponadeSelect = screen.getByTestId('tamponade-select');
        expect(tamponadeSelect).toHaveValue('sf6');
        fireEvent.change(tamponadeSelect, { target: { value: 'c2f6' } });
        expect(mockProps.setTamponade).toHaveBeenCalledWith('c2f6');

        // Verify cryotherapy selection
        const cryoSelect = screen.getByTestId('cryotherapy-select');
        expect(cryoSelect).toHaveValue('no');
        fireEvent.change(cryoSelect, { target: { value: 'yes' } });
        expect(mockProps.setCryotherapy).toHaveBeenCalledWith('yes');
    });

    test('disables all inputs when disabled prop is true', () => {
        render(<RiskInputForm {...mockProps} disabled={true} />);

        // Age input should be disabled
        expect(screen.getByRole('spinbutton')).toBeDisabled();

        // PVR grade radios should be disabled
        const pvrRadios = screen.getAllByRole('radio');
        pvrRadios.forEach(radio => {
            expect(radio).toBeDisabled();
        });

        // Treatment options should be disabled
        expect(screen.getByTestId('gauge-select')).toBeDisabled();
        expect(screen.getByTestId('tamponade-select')).toBeDisabled();
        expect(screen.getByTestId('cryotherapy-select')).toBeDisabled();
    });

    test('preserves all values when switching positions', () => {
        const { rerender } = render(
            <RiskInputForm 
                {...mockProps} 
                position="right"
                age="65"
                pvrGrade="C"
                vitrectomyGauge="23g"
                cryotherapy="yes"
                tamponade="c2f6"
            />
        );

        // Switch positions
        rerender(
            <RiskInputForm 
                {...mockProps} 
                position="left"
                age="65"
                pvrGrade="C"
                vitrectomyGauge="23g"
                cryotherapy="yes"
                tamponade="c2f6"
            />
        );

        // Switch back
        rerender(
            <RiskInputForm 
                {...mockProps} 
                position="right"
                age="65"
                pvrGrade="C"
                vitrectomyGauge="23g"
                cryotherapy="yes"
                tamponade="c2f6"
            />
        );

        // Verify all values are preserved
        expect(screen.getByTestId('gauge-select')).toHaveValue('23g');
        expect(screen.getByTestId('tamponade-select')).toHaveValue('c2f6');
        expect(screen.getByTestId('cryotherapy-select')).toHaveValue('yes');
    });

    test('resets form correctly', () => {
        render(
            <RiskInputForm 
                {...mockProps} 
                position="right"
                isMobile={true}
            />
        );

        // Change all values
        fireEvent.change(screen.getByTestId('gauge-select'), { target: { value: '23g' } });
        fireEvent.change(screen.getByTestId('tamponade-select'), { target: { value: 'c2f6' } });
        fireEvent.change(screen.getByTestId('cryotherapy-select'), { target: { value: 'yes' } });

        // Reset form
        const form = screen.getByRole('form');
        fireEvent.reset(form);

        // Verify onReset was called
        expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });
});
