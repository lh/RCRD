import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
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
          onClick={() => onSegmentToggle(25)} 
          data-testid="segment-toggle"
          disabled={readOnly}
        >
          Toggle Segment
        </button>
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
        <select
          value={pvrGrade}
          onChange={(e) => setPvrGrade(e.target.value)}
          data-testid={`pvr-grade-${position || 'mobile'}`}
        >
          <option value="none">No PVR</option>
          <option value="b">B</option>
        </select>
        <select
          value={vitrectomyGauge}
          onChange={(e) => setVitrectomyGauge(e.target.value)}
          data-testid={`gauge-${position || 'mobile'}`}
        >
          <option value="23g">23g</option>
          <option value="25g">25g</option>
        </select>
      </div>
    );
  };
});

jest.mock('../../utils/riskCalculations');
jest.mock('../clock/utils/formatDetachmentHours');

describe('RetinalCalculator Form Validation', () => {
  const mockRisk = {
    probability: 25.5,
    steps: [],
    logit: -1.082
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

  test('shows correct validation messages', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    // Initially shows detachment required (age defaults to 50)
    let buttonSection = getDisabledCalculateButton().parentElement;
    let validationMessage = within(buttonSection).getByText(/detachment area required/i);
    expect(validationMessage).toBeInTheDocument();
    
    // Clear age to see both required message
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '' } });
    
    // Now shows both required
    buttonSection = getDisabledCalculateButton().parentElement;
    validationMessage = within(buttonSection).getByText(/age and detachment area required/i);
    expect(validationMessage).toBeInTheDocument();
    
    // Add detachment but keep age empty
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Now shows only age required
    buttonSection = getDisabledCalculateButton().parentElement;
    validationMessage = within(buttonSection).getByText(/age required/i);
    expect(validationMessage).toBeInTheDocument();
    
    // Remove detachment and add age
    fireEvent.click(segmentButton); // Remove detachment
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    // Now shows only detachment required
    buttonSection = getDisabledCalculateButton().parentElement;
    validationMessage = within(buttonSection).getByText(/detachment area required/i);
    expect(validationMessage).toBeInTheDocument();
    
    // Add detachment back
    fireEvent.click(segmentButton);
    
    // Calculate button should now be enabled
    const calculateButton = getEnabledCalculateButton();
    expect(calculateButton).not.toBeDisabled();
  });

  test('handles PVR grade changes', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    const pvrSelect = screen.getByTestId('pvr-grade-mobile');
    fireEvent.change(pvrSelect, { target: { value: 'b' } });
    
    // Fill required fields and calculate
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith(
      expect.objectContaining({ pvrGrade: 'b' })
    );
  });

  test('handles vitrectomy gauge changes', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    const gaugeSelect = screen.getByTestId('gauge-mobile');
    fireEvent.change(gaugeSelect, { target: { value: '23g' } });
    
    // Fill required fields and calculate
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith(
      expect.objectContaining({ vitrectomyGauge: '23g' })
    );
  });


  test('enables calculation when all required fields are filled', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    const calculateButton = getDisabledCalculateButton();
    expect(calculateButton).toBeDisabled();
    
    // Fill all required fields
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    expect(calculateButton).toBeDisabled();
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const enabledButton = getEnabledCalculateButton();
    expect(enabledButton).not.toBeDisabled();
  });
});
