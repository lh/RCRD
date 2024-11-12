import React from 'react';
import { render, screen } from '@testing-library/react';
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

describe('RetinalCalculator Rendering', () => {
  test('renders initial state correctly', () => {
    render(<RetinalCalculator />);
    
    expect(screen.getByText(/retinal detachment risk calculator/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('clock-face')).toHaveLength(2); // Mobile and desktop views
    expect(screen.getByText(/calculate risk/i)).toBeInTheDocument();
    expect(screen.getByText(/age and detachment area required/i)).toBeInTheDocument();
  });

  test('displays different layouts for mobile and desktop', () => {
    const { container } = render(<RetinalCalculator />);
    
    // Mobile layout
    expect(container.querySelector('.md\\:hidden')).toBeInTheDocument();
    
    // Desktop layout
    expect(container.querySelector('.hidden.md\\:flex')).toBeInTheDocument();
  });
});
