import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { getMobileView } from '../test-helpers/RetinalCalculator.helpers';

// Mock child components
jest.mock('../clock/ClockFace', () => {
  return function MockClockFace({ 
    onTearToggle, 
    onSegmentToggle, 
    onHoverChange,
    readOnly,
    onTouchDeviceChange,
    setDetachmentSegments 
  }) {
    const viewClass = onTouchDeviceChange ? 'mobile-view' : 'desktop-view';
    return (
      <div data-testid="clock-face" className={viewClass}>
        <button 
          onClick={() => onTearToggle(6)} 
          data-testid="tear-toggle"
          disabled={readOnly}
        >
          Toggle Tear
        </button>
        <button 
          onClick={() => onSegmentToggle(25)} 
          data-testid="segment-toggle"
          disabled={readOnly}
        >
          Toggle Segment
        </button>
        <button 
          onClick={() => onHoverChange(6)}
          data-testid="hover-change"
          disabled={readOnly}
        >
          Hover Hour
        </button>
        {onTouchDeviceChange && (
          <button 
            onClick={() => onTouchDeviceChange(true)}
            data-testid="touch-device-change"
          >
            Set Touch Device
          </button>
        )}
      </div>
    );
  };
});

jest.mock('../RiskInputForm', () => {
  return function MockRiskInputForm({ 
    age,
    setAge, 
    pvrGrade,
    setPvrGrade, 
    vitrectomyGauge,
    setVitrectomyGauge,
    position,
    isMobile 
  }) {
    return (
      <div data-testid={`risk-form-${position || 'mobile'}`}>
        <input 
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          data-testid={`age-input-${position || 'mobile'}`}
        />
      </div>
    );
  };
});

jest.mock('../RiskResults', () => {
  return function MockRiskResults({ risk, onReset }) {
    return (
      <div data-testid="risk-results">
        Risk: {risk.probability}%
        {onReset && (
          <button onClick={onReset} data-testid="reset-button">
            Reset Calculator
          </button>
        )}
      </div>
    );
  };
});

jest.mock('../../utils/riskCalculations');
jest.mock('../clock/utils/formatDetachmentHours');

describe('RetinalCalculator Form', () => {
  const mockRisk = {
    probability: '25.5',
    steps: [],
    logit: '-1.082'
  };

  beforeEach(() => {
    calculateRiskWithSteps.mockReset();
    calculateRiskWithSteps.mockReturnValue(mockRisk);
  });

  const getEnabledCalculateButton = () => {
    const buttons = screen.getAllByTestId('calculate-button');
    return buttons.find(button => !button.disabled);
  };

  const getDisabledCalculateButton = () => {
    const buttons = screen.getAllByTestId('calculate-button');
    return buttons.find(button => button.disabled);
  };

  test('calculates risk when form is valid', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Fill in required fields using mobile form
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    });
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith({
      age: '65',
      pvrGrade: 'none',
      vitrectomyGauge: '25g',
      selectedHours: [],
      detachmentSegments: [25]
    });
  });

  test('disables calculation when form is invalid', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer } = getMobileView(container);
    
    const calculateButton = getDisabledCalculateButton();
    expect(calculateButton).toBeDisabled();
    
    // Add age but no detachment
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    expect(calculateButton).toBeDisabled();
    
    // Find text within the mobile selection area
    const mobileSelection = within(mobileContainer).getByText(/current selection:/i).closest('div');
    expect(within(mobileSelection).getByText(/detachment area required/i)).toBeInTheDocument();
  });

  test('resets calculator state', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Set up initial state using mobile form
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    });
    
    // Reset
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // Wait for and verify reset state
    await waitFor(() => {
      expect(screen.queryByTestId('risk-results')).not.toBeInTheDocument();
    });
    
    const buttonSection = getDisabledCalculateButton().parentElement;
    const validationMessage = within(buttonSection).getByText(/age and detachment area required/i);
    expect(validationMessage).toBeInTheDocument();
    
    // Verify form reset
    const newAgeInput = screen.getByTestId('age-input-mobile');
    expect(newAgeInput.value).toBe('');
  });

  test('displays read-only clock face in results view', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Set up and calculate using mobile form
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    // Wait for results and find the read-only clock face
    await waitFor(() => {
      const resultsSection = screen.getByTestId('risk-results').parentElement;
      const readOnlyClockFace = within(resultsSection).getByTestId('clock-face');
      
      // Check each button type individually
      const tearButton = within(readOnlyClockFace).getByTestId('tear-toggle');
      const segmentButton = within(readOnlyClockFace).getByTestId('segment-toggle');
      const hoverButton = within(readOnlyClockFace).getByTestId('hover-change');
      
      expect(tearButton).toBeDisabled();
      expect(segmentButton).toBeDisabled();
      expect(hoverButton).toBeDisabled();
    });
  });
});
