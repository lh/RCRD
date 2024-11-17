import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RiskInputForm from '../RiskInputForm';
import { pvrOptions } from '../../constants/riskCalculatorConstants';

// Mock child components with accessibility attributes
jest.mock('../GaugeSelection', () => {
    return function MockGaugeSelection({ is25Gauge, setIs25Gauge, detailedGauge, setDetailedGauge }) {
        return (
            <div 
                data-testid="gauge-selection"
                role="group"
                aria-labelledby="gauge-heading"
            >
                <h3 id="gauge-heading" className="sr-only">Gauge Selection</h3>
                <button 
                    onClick={() => setIs25Gauge(!is25Gauge)}
                    data-testid="gauge-toggle"
                    aria-pressed={is25Gauge}
                >
                    {is25Gauge ? '25 gauge' : 'Not 25 gauge'}
                </button>
                {!is25Gauge && (
                    <select
                        value={detailedGauge || ''}
                        onChange={e => setDetailedGauge(e.target.value)}
                        data-testid="detailed-gauge"
                        aria-label="Detailed gauge selection"
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
            <div 
                data-testid="tamponade-selection"
                role="group"
                aria-labelledby="tamponade-heading"
            >
                <h3 id="tamponade-heading" className="sr-only">Tamponade Selection</h3>
                <button 
                    onClick={() => setUseOil(!useOil)}
                    data-testid="oil-toggle"
                    aria-pressed={useOil}
                >
                    {useOil ? 'Oil' : 'Gas'}
                </button>
                {!useOil && (
                    <button 
                        onClick={() => setUseSF6(!useSF6)}
                        data-testid="sf6-toggle"
                        aria-pressed={useSF6}
                    >
                        {useSF6 ? 'SF6' : 'C2F6'}
                    </button>
                )}
            </div>
        );
    };
});

describe('RiskInputForm - Accessibility', () => {
    const mockProps = {
        age: '45',
        setAge: jest.fn(),
        pvrGrade: 'none',
        setPvrGrade: jest.fn(),
        vitrectomyGauge: '25g',
        setVitrectomyGauge: jest.fn(),
        position: 'left'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ARIA Attributes', () => {
        test('age input has proper ARIA attributes', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('role', 'spinbutton');
            expect(ageInput).toHaveAttribute('aria-required', 'true');
            expect(ageInput).toHaveAttribute('aria-valuemin', '18');
            expect(ageInput).toHaveAttribute('aria-valuemax', '100');
        });

        test('PVR grade radio group has proper ARIA attributes', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            
            const radioGroup = screen.getByRole('radiogroup', { name: /pvr grade/i });
            expect(radioGroup).toHaveAttribute('aria-required', 'true');
        });

        test('sets aria-invalid on age input when invalid', () => {
            render(<RiskInputForm {...mockProps} age="" position="left" />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-invalid', 'true');
            
            userEvent.type(ageInput, '45');
            expect(ageInput).toHaveAttribute('aria-invalid', 'false');
        });
    });

    describe('Keyboard Navigation', () => {
        test('supports keyboard navigation through PVR options', () => {
            render(<RiskInputForm {...mockProps} position="left" />);
            
            const firstOption = screen.getByRole('radio', { name: pvrOptions[0].label });
            firstOption.focus();
            expect(document.activeElement).toBe(firstOption);

            userEvent.tab();
            const secondOption = screen.getByRole('radio', { name: pvrOptions[1].label });
            expect(document.activeElement).toBe(secondOption);
        });

        test('maintains tab order in mobile layout', () => {
            render(<RiskInputForm {...mockProps} isMobile={true} />);
            
            const elements = [
                screen.getByLabelText(/age/i),
                screen.getByRole('radio', { name: pvrOptions[0].label }),
                screen.getByTestId('gauge-toggle'),
                screen.getByTestId('oil-toggle')
            ];

            elements.forEach((element, index) => {
                element.focus();
                expect(document.activeElement).toBe(element);
                if (index < elements.length - 1) {
                    userEvent.tab();
                }
            });
        });
    });

    describe('Focus Management', () => {
        test('maintains focus when switching between gauge options', () => {
            render(<RiskInputForm {...mockProps} position="right" />);
            
            const gaugeToggle = screen.getByTestId('gauge-toggle');
            gaugeToggle.focus();
            fireEvent.click(gaugeToggle);
            expect(document.activeElement).toBe(gaugeToggle);
        });

        test('moves focus to SF6 toggle when oil is deselected', () => {
            render(<RiskInputForm {...mockProps} position="right" />);
            
            const oilToggle = screen.getByTestId('oil-toggle');
            oilToggle.focus();
            fireEvent.click(oilToggle);
            fireEvent.click(oilToggle);

            const sf6Toggle = screen.getByTestId('sf6-toggle');
            expect(document.activeElement).toBe(sf6Toggle);
        });
    });

    describe('Screen Reader Text', () => {
        test('provides error messages for screen readers', () => {
            render(<RiskInputForm {...mockProps} age="" position="left" />);
            
            const errorMessage = screen.getByText(/age is required/i);
            expect(errorMessage).toHaveClass('text-red-600');
        });

        test('includes visually hidden labels', () => {
            render(<RiskInputForm {...mockProps} position="right" />);
            
            expect(screen.getByText('Gauge Selection')).toHaveClass('sr-only');
            expect(screen.getByText('Tamponade Selection')).toHaveClass('sr-only');
        });
    });

    describe('Form Validation', () => {
        test('announces validation errors to screen readers', () => {
            render(<RiskInputForm {...mockProps} age="15" position="left" />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-invalid', 'true');
            expect(ageInput).toHaveAttribute('aria-errormessage');
        });

        test('provides clear feedback for required fields', () => {
            render(<RiskInputForm {...mockProps} age="" position="left" />);
            
            const ageInput = screen.getByLabelText(/age \(years\)/i);
            expect(ageInput).toHaveAttribute('aria-required', 'true');
            expect(screen.getByText(/age is required/i)).toBeInTheDocument();
        });
    });
});
