import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { getMobileView } from '../test-helpers/RetinalCalculator.helpers';
import { MODEL_TYPE } from '../../constants/modelTypes';
import { TEST_DEFAULTS } from '../../test-utils/constants';

// Mock child components
jest.mock('../clock/ClockFace', () => ({
  __esModule: true,
  default: function MockClockFace({ 
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
  }
}));

jest.mock('../RiskInputForm', () => ({
  __esModule: true,
  default: function MockRiskInputForm({ 
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
        <select
          value={cryotherapy}
          onChange={(e) => setCryotherapy(e.target.value)}
          data-testid={`cryo-${position || 'mobile'}`}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
        <select
          value={tamponade}
          onChange={(e) => setTamponade(e.target.value)}
          data-testid={`tamponade-${position || 'mobile'}`}
        >
          <option value="sf6">SF6</option>
          <option value="c2f6">C2F6</option>
        </select>
      </div>
    );
  }
}));

jest.mock('../RiskResults', () => ({
  __esModule: true,
  default: function MockRiskResults({ 
    fullModelRisk, 
    significantModelRisk, 
    onReset, 
    showMath, 
    setShowMath 
  }) {
    const risk = showMath ? significantModelRisk : fullModelRisk;
    return (
      <div data-testid="risk-results">
        <div className="text-3xl font-bold mb-2">
          {risk?.probability}%
        </div>
        <p className="text-sm text-gray-600">
          Probability of requiring additional surgery within 6 months
        </p>
        <button 
          onClick={() => setShowMath(!showMath)}
          data-testid="show-math-toggle"
        >
          {showMath ? 'Hide Math' : 'Show Math'}
        </button>
        {showMath && <div data-testid="math-details">Math Details</div>}
        <div data-testid="input-summary" className="mt-8 border-t pt-6">
          <h3 data-testid="summary-heading">Input Summary</h3>
          <div data-testid="summary-content">
            <p data-testid="summary-age">{risk?.age} years</p>
            <p data-testid="summary-pvr">{risk?.pvrGrade?.toUpperCase()}</p>
            <p data-testid="summary-gauge">{risk?.vitrectomyGauge}</p>
          </div>
        </div>
        {onReset && (
          <button onClick={onReset} data-testid="reset-button">
            Reset Calculator
          </button>
        )}
      </div>
    );
  }
}));

jest.mock('../../utils/riskCalculations');
jest.mock('../clock/utils/formatDetachmentHours');

describe('RetinalCalculator Form', () => {
  const mockRisk = {
    probability: 25.5,
    steps: [],
    logit: -1.082,
    age: TEST_DEFAULTS.age.value,
    pvrGrade: TEST_DEFAULTS.pvrGrade.value,
    vitrectomyGauge: TEST_DEFAULTS.vitrectomyGauge.value,
    cryotherapy: TEST_DEFAULTS.cryotherapy.value,
    tamponade: TEST_DEFAULTS.tamponade.value,
    selectedHours: TEST_DEFAULTS.selectedHours.value,
    detachmentSegments: TEST_DEFAULTS.detachmentSegments.value
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
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    });
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith({
      age: TEST_DEFAULTS.age.value,
      pvrGrade: 'none',
      vitrectomyGauge: '25g',
      selectedHours: [],
      detachmentSegments: [25],
      cryotherapy: 'yes',
      tamponade: 'c2f6',
      modelType: MODEL_TYPE.FULL
    });
  });

  test('disables calculation when form is invalid', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer } = getMobileView(container);
    
    const calculateButton = getDisabledCalculateButton();
    expect(calculateButton).toBeDisabled();
    
    // Add age but no detachment
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    expect(calculateButton).toBeDisabled();
    
    // Verify validation message
    const buttonSection = calculateButton.parentElement;
    expect(within(buttonSection).getByText(/detachment area required/i)).toBeInTheDocument();
  });

  test('resets calculator state', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Set up initial state using mobile form
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    
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
    
    // Verify form reset to defaults
    const newAgeInput = screen.getByTestId('age-input-mobile');
    expect(newAgeInput.value).toBe(TEST_DEFAULTS.age.value);
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
