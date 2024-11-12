import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
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

describe('RetinalCalculator Desktop Layout', () => {
  const mockRisk = {
    probability: '25.5',
    steps: [],
    logit: '-1.082'
  };

  beforeEach(() => {
    calculateRiskWithSteps.mockReset();
    calculateRiskWithSteps.mockReturnValue(mockRisk);
  });

  // Helper function to get desktop view elements
  const getDesktopElements = () => {
    const desktopView = screen.getAllByTestId('clock-face')
      .find(face => face.classList.contains('desktop-view'));
    
    if (!desktopView) {
      throw new Error('Desktop view not found');
    }

    return {
      clockFace: desktopView,
      segmentButton: within(desktopView).getByTestId('segment-toggle')
    };
  };

  test('syncs form values between left and right panels', () => {
    render(<RetinalCalculator />);
    
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

  test('handles interactions in desktop form', () => {
    render(<RetinalCalculator />);
    
    // Set form values
    const leftAgeInput = screen.getByTestId('age-input-left');
    fireEvent.change(leftAgeInput, { target: { value: '65' } });
    
    const rightPvrSelect = screen.getByTestId('pvr-grade-right');
    fireEvent.change(rightPvrSelect, { target: { value: 'b' } });
    
    // Get desktop elements and interact with them
    const { segmentButton } = getDesktopElements();
    fireEvent.click(segmentButton);
    
    const calculateButton = screen.getByText(/calculate risk/i);
    fireEvent.click(calculateButton);
    
    expect(calculateRiskWithSteps).toHaveBeenCalledWith(
      expect.objectContaining({
        age: '65',
        pvrGrade: 'b'
      })
    );
  });

  test('maintains desktop layout after calculation', () => {
    render(<RetinalCalculator />);
    
    // Fill form and calculate
    const leftAgeInput = screen.getByTestId('age-input-left');
    fireEvent.change(leftAgeInput, { target: { value: '65' } });
    
    const { segmentButton } = getDesktopElements();
    fireEvent.click(segmentButton);
    
    const calculateButton = screen.getByText(/calculate risk/i);
    fireEvent.click(calculateButton);
    
    // Verify results layout
    const inputSummaryHeading = screen.getByRole('heading', { name: /input summary/i });
    const resultsGrid = inputSummaryHeading.parentElement.querySelector('.grid');
    expect(resultsGrid).toBeInTheDocument();
    expect(resultsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-6');
    
    // Verify risk display
    const riskHeading = screen.getByText(/estimated risk of failure/i);
    expect(riskHeading).toBeInTheDocument();
    expect(riskHeading.textContent).toMatch(/25\.5%/);
    
    // Verify clock face is still present
    const { clockFace } = getDesktopElements();
    expect(clockFace).toBeInTheDocument();
    expect(clockFace).toHaveClass('desktop-view');
    
    // Verify input summary sections
    const summarySection = screen.getByRole('heading', { name: /input summary/i }).parentElement;
    expect(summarySection).toHaveTextContent(/age:/i);
    expect(summarySection).toHaveTextContent(/pvr grade:/i);
    expect(summarySection).toHaveTextContent(/vitrectomy gauge:/i);
    
    // Verify reset button
    const resetButton = screen.getByRole('button', { name: /reset calculator/i });
    expect(resetButton).toBeInTheDocument();
  });
});
