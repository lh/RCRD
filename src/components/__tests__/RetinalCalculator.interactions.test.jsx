import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { getMobileView } from '../test-helpers/RetinalCalculator.helpers';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { TEST_DEFAULTS } from '../../test-utils/constants';

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
    cryotherapy,
    setCryotherapy,
    tamponade,
    setTamponade,
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
          data-testid={`pvr-grade-input-${position || 'mobile'}`}
        >
          <option value="none">None</option>
        </select>
        <select
          value={vitrectomyGauge}
          onChange={(e) => setVitrectomyGauge(e.target.value)}
          data-testid={`gauge-input-${position || 'mobile'}`}
        >
          <option value="25g">25g</option>
        </select>
        <select
          value={cryotherapy}
          onChange={(e) => setCryotherapy(e.target.value)}
          data-testid={`cryo-input-${position || 'mobile'}`}
        >
          <option value="no">No</option>
        </select>
        <select
          value={tamponade}
          onChange={(e) => setTamponade(e.target.value)}
          data-testid={`tamponade-input-${position || 'mobile'}`}
        >
          <option value="sf6">SF6</option>
        </select>
      </div>
    );
  };
});

jest.mock('../RiskResults', () => {
  return function MockRiskResults({ fullModelRisk, significantModelRisk, onReset }) {
    const risk = fullModelRisk || significantModelRisk;
    return (
      <div data-testid="risk-results">
        <div className="space-y-1">
          <p className="text-sm" data-testid="breaks-text">
            <span className="font-medium">Breaks:</span> {risk?.selectedHours?.join(', ')} o'clock
          </p>
          <p className="text-sm" data-testid="segments-text">
            <span className="font-medium">Detachment Segments:</span> {risk?.detachmentSegments?.length || 0}
          </p>
        </div>
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

describe('RetinalCalculator Interactions', () => {
  beforeEach(() => {
    calculateRiskWithSteps.mockReturnValue({
      probability: 75,
      steps: [],
      logit: 1.5,
      age: TEST_DEFAULTS.age.value,
      pvrGrade: TEST_DEFAULTS.pvrGrade.value,
      vitrectomyGauge: TEST_DEFAULTS.vitrectomyGauge.value,
      cryotherapy: TEST_DEFAULTS.cryotherapy.value,
      tamponade: TEST_DEFAULTS.tamponade.value,
      selectedHours: [6], // Test expects this specific value
      detachmentSegments: [25] // Test expects this specific value
    });
  });

  test('handles tear selection', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    // Set age and add detachment area
    const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    
    // Add tear and segment
    const tearButton = within(mobileView).getByTestId('tear-toggle');
    fireEvent.click(tearButton);
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Click calculate
    const calculateButton = within(mobileContainer).getByTestId('calculate-button');
    expect(calculateButton).not.toBeDisabled();
    fireEvent.click(calculateButton);
    
    // Verify tear is shown in summary
    const breakText = within(mobileContainer).getByTestId('breaks-text');
    expect(breakText.textContent).toContain('6');
  });

  test('handles detachment segment selection', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    // Set age and add detachment area
    const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    
    // Add segment
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Click calculate
    const calculateButton = within(mobileContainer).getByTestId('calculate-button');
    expect(calculateButton).not.toBeDisabled();
    fireEvent.click(calculateButton);
    
    // Verify segment count is shown
    const detachmentText = within(mobileContainer).getByTestId('segments-text');
    expect(detachmentText.textContent).toContain('1');
  });

  test('handles touch device changes', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    const touchDeviceButton = within(mobileView).getByTestId('touch-device-change');
    fireEvent.click(touchDeviceButton);
    
    // Verify mobile view is active
    expect(mobileView).toHaveClass('mobile-view');
  });
});
