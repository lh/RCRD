import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import MobileRetinalCalculator from '../MobileRetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';

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
    return (
      <div data-testid="clock-face">
        <button 
          onClick={() => onSegmentToggle(25)} 
          data-testid="segment-toggle"
          disabled={readOnly}
        >
          Toggle Segment
        </button>
        <button
          onClick={() => onTouchDeviceChange(true)}
          data-testid="touch-device-toggle"
        >
          Toggle Touch Device
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
    isMobile 
  }) {
    return (
      <div data-testid="risk-form-mobile">
        <input 
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          data-testid="age-input-mobile"
        />
        <select
          value={pvrGrade}
          onChange={(e) => setPvrGrade(e.target.value)}
          data-testid="pvr-grade-mobile"
        >
          <option value="none">No PVR</option>
          <option value="b">B</option>
        </select>
        <select
          value={vitrectomyGauge}
          onChange={(e) => setVitrectomyGauge(e.target.value)}
          data-testid="gauge-mobile"
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

describe('MobileRetinalCalculator', () => {
  const mockRisk = {
    probability: '25.5',
    steps: [],
    logit: '-1.082'
  };

  beforeEach(() => {
    calculateRiskWithSteps.mockReset();
    calculateRiskWithSteps.mockReturnValue(mockRisk);
  });

  test('handles touch device detection', () => {
    render(<MobileRetinalCalculator />);
    
    const touchDeviceToggle = screen.getByTestId('touch-device-toggle');
    fireEvent.click(touchDeviceToggle);
    
    const touchIndicator = screen.getByTestId('touch-indicator');
    expect(touchIndicator).toHaveStyle({ backgroundColor: 'green' });
  });

  test('handles form interactions and calculation', () => {
    render(<MobileRetinalCalculator />);
    
    // Set form values
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const pvrSelect = screen.getByTestId('pvr-grade-mobile');
    fireEvent.change(pvrSelect, { target: { value: 'b' } });
    
    // Interact with clock face
    const segmentButton = screen.getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Calculate risk
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith(
      expect.objectContaining({
        age: '65',
        pvrGrade: 'b'
      })
    );
  });

  test('displays calculation results with mobile layout', async () => {
    render(<MobileRetinalCalculator />);
    
    // Fill form and calculate
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const segmentButton = screen.getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // Verify results layout
    const inputSummaryHeading = screen.getByRole('heading', { name: /input summary/i });
    expect(inputSummaryHeading).toBeInTheDocument();
    
    // Verify risk display
    const riskHeading = screen.getByText(/estimated risk of failure/i);
    expect(riskHeading).toBeInTheDocument();
    expect(riskHeading.textContent).toMatch(/25\.5%/);
    
    // Verify clock face is present
    const clockFace = screen.getByTestId('clock-face');
    expect(clockFace).toBeInTheDocument();
    
    // Verify input summary sections
    const summarySection = screen.getByRole('heading', { name: /input summary/i }).parentElement;
    expect(summarySection).toHaveTextContent(/age:/i);
    expect(summarySection).toHaveTextContent(/pvr grade:/i);
    expect(summarySection).toHaveTextContent(/vitrectomy gauge:/i);
    
    // Verify reset functionality
    const resetButton = screen.getByRole('button', { name: /reset calculator/i });
    expect(resetButton).toBeInTheDocument();
    
    fireEvent.click(resetButton);
    
    // Wait for the age input to be cleared
    await waitFor(() => {
      const updatedAgeInput = screen.getByTestId('age-input-mobile');
      expect(updatedAgeInput.value).toBe('');
    });
  });

  test('shows validation messages', () => {
    render(<MobileRetinalCalculator />);
    
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // Check for initial validation message in the button section
    const buttonSection = screen.getByTestId('calculate-button').parentElement;
    const initialValidationMessage = within(buttonSection).getByText(/age and detachment area required/i);
    expect(initialValidationMessage).toBeInTheDocument();
    
    // Update age and check for updated validation message
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    const updatedValidationMessage = within(buttonSection).getByText(/detachment area required/i);
    expect(updatedValidationMessage).toBeInTheDocument();
  });
});
