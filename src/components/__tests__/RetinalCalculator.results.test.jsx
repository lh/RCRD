import React from 'react';
import { render, screen, within, fireEvent, waitFor, cleanup } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import { getMobileView, getResultsSection, fillForm } from '../test-helpers/RetinalCalculator.helpers';

// Increase test timeout
jest.setTimeout(10000);

// Mock child components
jest.mock('../clock/ClockFace', () => ({
  __esModule: true,
  default: function MockClockFace({ onSegmentToggle, setDetachmentSegments }) {
    return (
      <div data-testid="clock-face">
        <button 
          onClick={() => {
            onSegmentToggle(25);
            setDetachmentSegments?.([25]);
          }}
          data-testid="segment-toggle"
        >
          Toggle Segment
        </button>
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
    position
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
  }
}));

jest.mock('../RiskResults', () => ({
  __esModule: true,
  default: function MockRiskResults({ risk, onReset, showMath, setShowMath }) {
    return (
      <div data-testid="risk-results">
        Risk: {risk.probability}%
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
            <p data-testid="summary-age">Age: {risk.age} years</p>
            <p data-testid="summary-pvr">PVR Grade: {risk.pvrGrade}</p>
            <p data-testid="summary-gauge">Vitrectomy Gauge: {risk.vitrectomyGauge}</p>
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

describe('RetinalCalculator Results Display', () => {
  beforeEach(() => {
    calculateRiskWithSteps.mockReset();
    calculateRiskWithSteps.mockImplementation(() => ({
      probability: '25.5',
      steps: [],
      logit: '-1.082',
      age: '65',
      pvrGrade: 'B',
      vitrectomyGauge: '23g'
    }));
  });

  afterEach(cleanup);

  const waitForCalculateButton = async () => {
    return await waitFor(() => {
      const buttons = screen.getAllByTestId('calculate-button');
      // Find the enabled button
      const enabledButton = buttons.find(button => !button.disabled);
      expect(enabledButton).toBeTruthy();
      return enabledButton;
    }, { timeout: 2000 });
  };

  const waitForResults = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    }, { timeout: 2000 });
  };

  test('toggles math details visibility', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Fill form and calculate
    fillForm({ screen, fireEvent, within, mobileView });
    const calculateButton = await waitForCalculateButton();
    fireEvent.click(calculateButton);
    await waitForResults();
    
    // Toggle math details
    const toggleButton = screen.getByTestId('show-math-toggle');
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('math-details')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('math-details')).not.toBeInTheDocument();
  });

  test('displays complete input summary', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Fill form and calculate
    fillForm({ 
      screen, 
      fireEvent,
      within, 
      mobileView, 
      data: { age: '65', pvrGrade: 'b', vitrectomyGauge: '23g' }
    });
    const calculateButton = await waitForCalculateButton();
    fireEvent.click(calculateButton);
    await waitForResults();
    
    // Verify summary content
    const summary = screen.getByTestId('input-summary');
    expect(within(summary).getByTestId('summary-age')).toHaveTextContent('65 years');
    expect(within(summary).getByTestId('summary-pvr')).toHaveTextContent('B');
    expect(within(summary).getByTestId('summary-gauge')).toHaveTextContent('23g');
  });

  test('maintains input values in summary after reset and recalculate', async () => {
    // Initial calculation
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    fillForm({ screen, fireEvent, within, mobileView });
    let calculateButton = await waitForCalculateButton();
    fireEvent.click(calculateButton);
    await waitForResults();
    
    // Reset
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // Wait for form to reset and get new clock face
    await waitFor(() => {
      expect(screen.queryByTestId('risk-results')).not.toBeInTheDocument();
    });
    
    // Update mock for second calculation
    calculateRiskWithSteps.mockImplementation(() => ({
      probability: '25.5',
      steps: [],
      logit: '-1.082',
      age: '65',
      pvrGrade: 'NONE',
      vitrectomyGauge: '25g'
    }));
    
    const clockFace = screen.getAllByTestId('clock-face')[0];
    fillForm({ 
      screen, 
      fireEvent, 
      within, 
      mobileView: clockFace,
      data: { age: '65', pvrGrade: 'none', vitrectomyGauge: '25g' }
    });
    
    // Get new calculate button and click
    calculateButton = await waitForCalculateButton();
    fireEvent.click(calculateButton);
    
    // Wait for and verify summary content
    await waitForResults();
    const summary = screen.getByTestId('input-summary');
    expect(within(summary).getByTestId('summary-age')).toHaveTextContent('65 years');
    expect(within(summary).getByTestId('summary-pvr')).toHaveTextContent('NONE');
    expect(within(summary).getByTestId('summary-gauge')).toHaveTextContent('25g');
  });
});
