import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';

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
        <div>Risk: {risk.probability}%</div>
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Input Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm" data-testid="pvr-grade">
                <span className="font-medium">PVR Grade:</span> {risk.pvrGrade}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
});

describe('RetinalCalculator Rendering', () => {
  const getDisabledCalculateButton = () => {
    const buttons = screen.getAllByTestId('calculate-button');
    return buttons.find(button => button.disabled);
  };

  test('renders initial state correctly', () => {
    render(<RetinalCalculator />);
    
    // Check header
    expect(screen.getByText(/retinal detachment risk calculator/i)).toBeInTheDocument();
    
    // Check clock face
    expect(screen.getAllByTestId('clock-face')).toHaveLength(2); // Mobile and desktop views
    
    // Check calculate button and validation message
    const calculateButton = getDisabledCalculateButton();
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).toBeDisabled();
    
    const buttonSection = calculateButton.parentElement;
    const validationMessage = within(buttonSection).getByText(/age and detachment area required/i);
    expect(validationMessage).toBeInTheDocument();
  });

  test('displays different layouts for mobile and desktop', () => {
    render(<RetinalCalculator />);
    
    // Mobile layout
    const mobileSection = screen.getByTestId('risk-form-mobile');
    expect(mobileSection).toBeInTheDocument();
    const mobileContainer = mobileSection.closest('.md\\:hidden');
    expect(mobileContainer).toBeInTheDocument();
    
    // Desktop layout
    const desktopSection = screen.getByTestId('risk-form-left');
    expect(desktopSection).toBeInTheDocument();
    const desktopContainer = desktopSection.closest('.hidden.md\\:block');
    expect(desktopContainer).toBeInTheDocument();
  });
});
