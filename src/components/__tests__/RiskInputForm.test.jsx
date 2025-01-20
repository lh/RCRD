import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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

    describe('Mobile View', () => {
        test('renders all components in mobile layout', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);

            // Verify all components are rendered
            expect(screen.getByRole('spinbutton')).toBeInTheDocument(); // Age input
            expect(screen.getByTestId('gauge-select')).toBeInTheDocument();
            expect(screen.getByTestId('tamponade-select')).toBeInTheDocument();
            expect(screen.getByTestId('cryotherapy-select')).toBeInTheDocument();
            expect(screen.getAllByRole('radio')).toHaveLength(4); // PVR options
        });

        test('handles form submission in mobile view', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);
            
            const form = screen.getByTestId('gauge-select').closest('form');
            fireEvent.submit(form);
            
            // Verify default submission is prevented
            expect(mockProps.onReset).not.toHaveBeenCalled();
        });

        test('disables all inputs in mobile view when disabled prop is true', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} disabled={true} />);

            // Verify all inputs are disabled
            expect(screen.getByRole('spinbutton')).toBeDisabled();
            expect(screen.getByTestId('gauge-select')).toBeDisabled();
            expect(screen.getByTestId('tamponade-select')).toBeDisabled();
            expect(screen.getByTestId('cryotherapy-select')).toBeDisabled();
            screen.getAllByRole('radio').forEach(radio => {
                expect(radio).toBeDisabled();
            });
        });

        test('resets form correctly in mobile view', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);

            // Change values
            fireEvent.change(screen.getByTestId('gauge-select'), { target: { value: '23g' } });
            fireEvent.change(screen.getByTestId('tamponade-select'), { target: { value: 'c2f6' } });
            fireEvent.change(screen.getByTestId('cryotherapy-select'), { target: { value: 'yes' } });

            // Reset form
            const form = screen.getByTestId('gauge-select').closest('form');
            fireEvent.reset(form);

            // Verify reset callback was called
            expect(mockProps.onReset).toHaveBeenCalledTimes(1);
        });
    });

    describe('Desktop View - Left Panel', () => {
        test('renders left panel components correctly', () => {
            render(<RiskInputForm {...mockProps} position="left" />);

            // Verify left panel components
            expect(screen.getByRole('spinbutton')).toBeInTheDocument(); // Age input
            expect(screen.getAllByRole('radio')).toHaveLength(4); // PVR options
            expect(screen.getByTestId('gauge-select')).toBeInTheDocument();

            // Verify right panel components are not rendered
            expect(screen.queryByTestId('tamponade-select')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cryotherapy-select')).not.toBeInTheDocument();
        });

        test('handles left panel interactions', () => {
            render(<RiskInputForm {...mockProps} position="left" />);

            // Test age input
            const ageInput = screen.getByRole('spinbutton');
            fireEvent.change(ageInput, { target: { value: '50' } });
            expect(mockProps.setAge).toHaveBeenCalledWith('50');

            // Test gauge selection
            const gaugeSelect = screen.getByTestId('gauge-select');
            fireEvent.change(gaugeSelect, { target: { value: '23g' } });
            expect(mockProps.setVitrectomyGauge).toHaveBeenCalledWith('23g');

            // Test PVR selection
            const pvrRadios = screen.getAllByRole('radio');
            fireEvent.click(pvrRadios[1]); // Select second option
            expect(mockProps.setPvrGrade).toHaveBeenCalled();
        });
    });

    describe('Desktop View - Right Panel', () => {
        test('renders right panel components correctly', () => {
            render(<RiskInputForm {...mockProps} position="right" />);

            // Verify right panel components
            expect(screen.getByTestId('tamponade-select')).toBeInTheDocument();
            expect(screen.getByTestId('cryotherapy-select')).toBeInTheDocument();

            // Verify left panel components are not rendered
            expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
            expect(screen.queryByRole('radio')).not.toBeInTheDocument();
            expect(screen.queryByTestId('gauge-select')).not.toBeInTheDocument();
        });

        test('handles right panel interactions', () => {
            render(<RiskInputForm {...mockProps} position="right" />);

            // Test tamponade selection
            const tamponadeSelect = screen.getByTestId('tamponade-select');
            fireEvent.change(tamponadeSelect, { target: { value: 'c2f6' } });
            expect(mockProps.setTamponade).toHaveBeenCalledWith('c2f6');

            // Test cryotherapy selection
            const cryoSelect = screen.getByTestId('cryotherapy-select');
            fireEvent.change(cryoSelect, { target: { value: 'yes' } });
            expect(mockProps.setCryotherapy).toHaveBeenCalledWith('yes');
        });
    });

    describe('Shared Behavior', () => {
        test('validates age input', async () => {
            const { rerender } = render(<RiskInputForm {...mockProps} isMobile={true} />);
            const ageInput = screen.getByRole('spinbutton');
            
            // Test initial state
            expect(ageInput).toHaveAttribute('aria-invalid', 'false');
            
            // Test invalid age
            await act(async () => {
                fireEvent.change(ageInput, { target: { value: '15' } });
                rerender(<RiskInputForm {...mockProps} age="15" isMobile={true} />);
            });
            
            await waitFor(() => {
                expect(mockProps.setAge).toHaveBeenCalledWith('15');
                expect(ageInput).toHaveAttribute('aria-invalid', 'true');
                expect(screen.getByText(/age must be between 18 and 100/i)).toBeInTheDocument();
            });
            
            // Test valid age
            await act(async () => {
                fireEvent.change(ageInput, { target: { value: '50' } });
                rerender(<RiskInputForm {...mockProps} age="50" isMobile={true} />);
            });
            
            await waitFor(() => {
                expect(mockProps.setAge).toHaveBeenCalledWith('50');
                expect(ageInput).toHaveAttribute('aria-invalid', 'false');
                expect(screen.queryByText(/age must be between 18 and 100/i)).not.toBeInTheDocument();
            });
        });

        test('preserves values when switching between mobile and desktop views', () => {
            const { rerender } = render(<RiskInputForm {...mockProps} isMobile={true} />);
            
            const updatedProps = {
                ...mockProps,
                vitrectomyGauge: '23g',
                tamponade: 'c2f6'
            };
            
            // Switch to desktop view with updated props
            rerender(<RiskInputForm {...updatedProps} position="left" />);
            expect(screen.getByTestId('gauge-select')).toHaveValue('23g');
            
            rerender(<RiskInputForm {...updatedProps} position="right" />);
            expect(screen.getByTestId('tamponade-select')).toHaveValue('c2f6');
        });
    });
});
