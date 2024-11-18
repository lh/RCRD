import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import DesktopRetinalCalculator from '../DesktopRetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';

// Mock child components
jest.mock('../clock/ClockFace', () => {
  return function MockClockFace({ 
    onTearToggle, 
    onSegmentToggle, 
    onHoverChange,
    readOnly,
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
    position
  }) {
    return (
      <div data-testid={`risk-form-${position}`}>
        <input 
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          data-testid={`age-input-${position}`}
        />
        <select
          value={pvrGrade}
          onChange={(e) => setPvrGrade(e.target.value)}
          data-testid={`pvr-grade-${position}`}
        >
          <option value="none">No PVR</option>
          <option value="b">B</option>
        </select>
        <select
          value={vitrectomyGauge}
          onChange={(e) => setVitrectomyGauge(e.target.value)}
          data-testid={`gauge-${position}`}
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

describe('DesktopRetinalCalculator', () => {
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

  test('syncs form values between left and right panels', () => {
    render(<DesktopRetinalCalculator />);
    
    // Set value in left panel
    const leftAgeInput = screen.getByTestId('age-input-left');
    fireEvent.change(leftAgeInput, { target: { value: '65' } });
    
    // Verify right panel is synced
    const rightAgeInput = screen.getByTestId('age-input-right');
    expect(rightAgeInput.value).toBe('65');
    
    // Set value in right panel
    const rightPvrSelect = screen.getByTestId('pvr-grade-right');
    fireEvent.change(rightPvrSelect, { target: { value: 'b' } });
    
    // Verify left panel is synced
    const leftPvrSelect = screen.getByTestId('pvr-grade-left');
    expect(leftPvrSelect.value).toBe('b');
  });

  test('handles form interactions and calculation', () => {
    render(<DesktopRetinalCalculator />);
    
    // Set form values
    const leftAgeInput = screen.getByTestId('age-input-left');
    fireEvent.change(leftAgeInput, { target: { value: '65' } });
    
    const rightPvrSelect = screen.getByTestId('pvr-grade-right');
    fireEvent.change(rightPvrSelect, { target: { value: 'b' } });
    
    // Interact with clock face
    const segmentButton = screen.getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Calculate risk
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith(
      expect.objectContaining({
        age: '65',
        pvrGrade: 'b'
      })
    );
  });

  test('displays calculation results with correct layout', async () => {
    render(<DesktopRetinalCalculator />);
    
    // Fill form and calculate
    const leftAgeInput = screen.getByTestId('age-input-left');
    fireEvent.change(leftAgeInput, { target: { value: '65' } });
    
    const segmentButton = screen.getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /input summary/i })).toBeInTheDocument();
    });
    
    // Verify results layout
    const inputSummaryHeading = screen.getByRole('heading', { name: /input summary/i });
    const resultsGrid = inputSummaryHeading.parentElement.querySelector('.grid');
    expect(resultsGrid).toBeInTheDocument();
    expect(resultsGrid).toHaveClass('grid-cols-2', 'gap-6');
    
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
    
    // Wait for the form to reset
    await waitFor(() => {
      const updatedLeftAgeInput = screen.getByTestId('age-input-left');
      expect(updatedLeftAgeInput.value).toBe('');
    });
  });
});
