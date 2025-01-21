import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DesktopRetinalCalculator from '../DesktopRetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { MODEL_TYPE } from '../../constants/modelTypes';
import * as useRetinalCalculatorModule from '../clock/hooks/useRetinalCalculator';

// Mock the custom hook
jest.mock('../clock/hooks/useRetinalCalculator', () => ({
  useRetinalCalculator: jest.fn()
}));

// Mock child components minimally
jest.mock('../clock/ClockFace', () => {
  const MockClockFace = (props) => (
    <div data-testid="clock-face">
      <button 
        onClick={() => {
          props.onSegmentToggle(25);
          props.setDetachmentSegments?.([25]);
        }}
        data-testid="segment-toggle"
        disabled={props.readOnly}
      >
        Toggle Segment
      </button>
    </div>
  );
  return { __esModule: true, default: MockClockFace };
});

jest.mock('../RiskInputForm', () => {
  const MockRiskInputForm = (props) => (
    <div data-testid={`risk-form-${props.position}`}>
      {props.age !== undefined && (
        <input 
          type="number"
          value={props.age}
          onChange={(e) => props.setAge?.(e.target.value)}
          data-testid={`age-input-${props.position}`}
        />
      )}
      {props.pvrGrade !== undefined && (
        <select
          value={props.pvrGrade}
          onChange={(e) => props.setPvrGrade?.(e.target.value)}
          data-testid={`pvr-grade-${props.position}`}
        >
          <option value="none">No PVR</option>
          <option value="b">B</option>
        </select>
      )}
      {props.cryotherapy !== undefined && (
        <select
          value={props.cryotherapy}
          onChange={(e) => props.setCryotherapy?.(e.target.value)}
          data-testid={`cryotherapy-${props.position}`}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      )}
    </div>
  );
  return { __esModule: true, default: MockRiskInputForm };
});

jest.mock('../RiskResults', () => {
  const MockRiskResults = (props) => (
    <div data-testid="risk-results">
      <div className="text-3xl font-bold mb-2">
        {props.fullModelRisk.probability}%
      </div>
      <button onClick={props.onReset} data-testid="reset-button">
        Reset Calculator
      </button>
    </div>
  );
  return { __esModule: true, default: MockRiskResults };
});

describe('DesktopRetinalCalculator', () => {
  const mockCalculator = {
    age: '50',
    setAge: jest.fn(),
    pvrGrade: 'none',
    setPvrGrade: jest.fn(),
    vitrectomyGauge: '25g',
    setVitrectomyGauge: jest.fn(),
    cryotherapy: 'yes',
    setCryotherapy: jest.fn(),
    tamponade: 'c2f6',
    setTamponade: jest.fn(),
    selectedHours: [],
    detachmentSegments: [],
    hoveredHour: null,
    handleHoverChange: jest.fn(),
    handleTearToggle: jest.fn(),
    handleSegmentToggle: jest.fn(),
    setDetachmentSegments: jest.fn(),
    handleCalculate: jest.fn(),
    handleReset: jest.fn(),
    isCalculateDisabled: false,
    calculatedRisks: null,
    showMath: false,
    setShowMath: jest.fn(),
    formatPVRGrade: (grade) => grade.toUpperCase(),
    formatTamponade: (t) => t,
    formatHoursList: () => 'None'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRetinalCalculatorModule.useRetinalCalculator.mockReturnValue(mockCalculator);
  });

  test('renders left and right forms with correct fields', () => {
    render(<DesktopRetinalCalculator />);
    
    // Left form should have age and PVR grade
    const leftForm = screen.getByTestId('risk-form-left');
    expect(within(leftForm).getByTestId('age-input-left')).toBeInTheDocument();
    expect(within(leftForm).getByTestId('pvr-grade-left')).toBeInTheDocument();
    
    // Right form should have cryotherapy
    const rightForm = screen.getByTestId('risk-form-right');
    expect(within(rightForm).getByTestId('cryotherapy-right')).toBeInTheDocument();
  });

  test('updates state through hook setters', () => {
    render(<DesktopRetinalCalculator />);
    
    // Test age input
    const ageInput = screen.getByTestId('age-input-left');
    fireEvent.change(ageInput, { target: { value: '65' } });
    expect(mockCalculator.setAge).toHaveBeenCalledWith('65');
    
    // Test PVR grade select
    const pvrSelect = screen.getByTestId('pvr-grade-left');
    fireEvent.change(pvrSelect, { target: { value: 'b' } });
    expect(mockCalculator.setPvrGrade).toHaveBeenCalledWith('b');
    
    // Test cryotherapy select
    const cryoSelect = screen.getByTestId('cryotherapy-right');
    fireEvent.change(cryoSelect, { target: { value: 'no' } });
    expect(mockCalculator.setCryotherapy).toHaveBeenCalledWith('no');
  });

  test('handles calculation flow', () => {
    // Start with no results
    const { rerender } = render(<DesktopRetinalCalculator />);
    
    // Fill form
    const ageInput = screen.getByTestId('age-input-left');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = screen.getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Calculate
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    expect(mockCalculator.handleCalculate).toHaveBeenCalled();
    
    // Update mock to show results
    const calculatorWithResults = {
      ...mockCalculator,
      calculatedRisks: {
        full: { probability: 25.5 },
        significant: { probability: 30.0 }
      }
    };
    useRetinalCalculatorModule.useRetinalCalculator.mockReturnValue(calculatorWithResults);
    
    // Re-render with results
    rerender(<DesktopRetinalCalculator />);
    
    // Verify results are displayed
    expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    expect(screen.getByText('25.5%')).toBeInTheDocument();
    
    // Test reset
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    expect(mockCalculator.handleReset).toHaveBeenCalled();
  });

  test('displays validation messages', () => {
    // Setup calculator with validation state
    const calculatorWithValidation = {
      ...mockCalculator,
      isCalculateDisabled: true,
      age: '',
      detachmentSegments: []
    };
    useRetinalCalculatorModule.useRetinalCalculator.mockReturnValue(calculatorWithValidation);
    
    render(<DesktopRetinalCalculator />);
    
    // Verify calculate button is disabled
    const calculateButton = screen.getByTestId('calculate-button');
    expect(calculateButton).toBeDisabled();
    
    // Verify validation messages
    expect(screen.getByText(/age and detachment area required/i)).toBeInTheDocument();
    
    // Add age but keep detachment empty
    const ageInput = screen.getByTestId('age-input-left');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    // Update calculator state to reflect age change
    const calculatorWithAge = {
      ...calculatorWithValidation,
      age: '65'
    };
    useRetinalCalculatorModule.useRetinalCalculator.mockReturnValue(calculatorWithAge);
    
    // Verify updated validation message
    expect(screen.getByText(/detachment area required/i)).toBeInTheDocument();
  });
});
