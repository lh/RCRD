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

describe('RetinalCalculator Rendering', () => {
  const getDisabledCalculateButton = () => {
    const buttons = screen.getAllByTestId('calculate-button');
    return buttons.find(button => button.disabled);
  };

  test('renders initial state correctly', () => {
    render(<RetinalCalculator />);
    
    // Check header
    expect(screen.getByText(/Risk Calculator Retinal Detachment \(RCRD\)/i)).toBeInTheDocument();
    
    // Check clock face
    expect(screen.getAllByTestId('clock-face')).toHaveLength(2); // Mobile and desktop views
    
    // Check calculate button and validation message
    const calculateButton = getDisabledCalculateButton();
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).toBeDisabled();
    
    const buttonSection = calculateButton.parentElement;
    const validationMessage = within(buttonSection).getByText(/Detachment area required/i);
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
