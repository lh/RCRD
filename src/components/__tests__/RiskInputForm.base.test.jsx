import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskInputForm from '../RiskInputForm';
import { pvrOptions } from '../../constants/riskCalculatorConstants';

// Mock child components
jest.mock('../GaugeSelection', () => {
    return function MockGaugeSelection({ is25Gauge, setIs25Gauge, detailedGauge, setDetailedGauge }) {
        return (
            <div data-testid="gauge-selection">
                <button 
                    onClick={() => setIs25Gauge(!is25Gauge)}
                    data-testid="gauge-toggle"
                >
                    {is25Gauge ? '25 gauge' : 'Not 25 gauge'}
                </button>
                {!is25Gauge && (
                    <select
                        value={detailedGauge || ''}
                        onChange={e => setDetailedGauge(e.target.value)}
                        data-testid="detailed-gauge"
                    >
                        <option value="">Select gauge...</option>
                        <option value="20g">20 gauge</option>
                        <option value="23g">23 gauge</option>
                        <option value="27g">27 gauge</option>
                    </select>
                )}
            </div>
        );
    };
});

jest.mock('../TamponadeSelection', () => {
    return function MockTamponadeSelection({ useOil, setUseOil, useSF6, setUseSF6 }) {
        return (
            <div data-testid="tamponade-selection">
                <button 
                    onClick={() => setUseOil(!useOil)}
                    data-testid="oil-toggle"
                >
                    {useOil ? 'Oil' : 'Gas'}
                </button>
                {!useOil && (
                    <button 
                        onClick={() => setUseSF6(!useSF6)}
                        data-testid="sf6-toggle"
                    >
                        {useSF6 ? 'SF6' : 'C2F6'}
                    </button>
                )}
            </div>
        );
    };
});

describe('RiskInputForm - Base Functionality', () => {
    const mockProps = {
        age: '45',
        setAge: jest.fn(),
        pvrGrade: 'none',
        setPvrGrade: jest.fn(),
        vitrectomyGauge: '25g',
        setVitrectomyGauge: jest.fn(),
        position: 'left',
        onReset: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Age Input', () => {
        test('shows error message when age is empty', () => {
            render(<RiskInputForm {...mockProps} age="" position="left" />);
            expect(screen.getByText(/age is required/i)).toBeInTheDocument();
        });

        test('validates age range', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            const ageInput = screen.getByLabelText(/age \(years\)/i);

            fireEvent.change(ageInput, { target: { value: '17' } });
            expect(ageInput).toHaveAttribute('aria-invalid', 'true');

            fireEvent.change(ageInput, { target: { value: '50' } });
            expect(ageInput).toHaveAttribute('aria-invalid', 'false');

            fireEvent.change(ageInput, { target: { value: '101' } });
            expect(ageInput).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('PVR Grade Selection', () => {
        test('renders all PVR grade options', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            
            pvrOptions.forEach(option => {
                const radio = screen.getByRole('radio', { name: option.label });
                expect(radio).toBeInTheDocument();
            });
        });

        test('calls setPvrGrade when option selected', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            
            const pvrOption = screen.getByRole('radio', { name: pvrOptions[0].label });
            fireEvent.click(pvrOption);
            
            expect(mockProps.setPvrGrade).toHaveBeenCalledWith(pvrOptions[0].value);
        });
    });

    describe('Form Submission', () => {
        test('prevents default form submission', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);
            
            const form = screen.getByRole('form');
            const mockSubmit = jest.fn(e => e.preventDefault());
            form.onsubmit = mockSubmit;
            
            fireEvent.submit(form);
            
            expect(mockSubmit).toHaveBeenCalled();
            const submitEvent = mockSubmit.mock.calls[0][0];
            expect(submitEvent.defaultPrevented).toBe(true);
        });
    });
});
