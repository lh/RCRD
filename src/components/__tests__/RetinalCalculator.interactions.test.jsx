import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
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

describe('RetinalCalculator Interactions', () => {
  test('handles tear selection', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    const tearButton = within(mobileView).getByTestId('tear-toggle');
    fireEvent.click(tearButton);
    
    // Find text within the mobile selection area
    const mobileSelection = within(mobileContainer).getByText(/current selection:/i).closest('div');
    expect(within(mobileSelection).getByText(/breaks at: 6/i)).toBeInTheDocument();
  });

  test('handles detachment segment selection', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Find text within the mobile selection area
    const mobileSelection = within(mobileContainer).getByText(/current selection:/i).closest('div');
    expect(within(mobileSelection).getByText(/detachment segments: 1/i)).toBeInTheDocument();
  });

  test('handles touch device changes', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    const touchDeviceButton = within(mobileView).getByTestId('touch-device-change');
    fireEvent.click(touchDeviceButton);
    
    // Verify touch device indicator is present
    const touchIndicator = document.querySelector('[style*="background-color: green"]');
    expect(touchIndicator).toBeInTheDocument();
  });
});
