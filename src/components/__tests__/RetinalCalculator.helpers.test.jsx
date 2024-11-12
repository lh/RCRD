import React from 'react';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { getMobileView } from '../test-helpers/RetinalCalculator.helpers';
import * as riskCalculations from '../../utils/riskCalculations';
import * as formatDetachmentHours from '../clock/utils/formatDetachmentHours';

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

describe('RetinalCalculator Helper Functions', () => {
  const mockRiskResult = {
    probability: 25,
    steps: [],
    logit: 0,
    age: 65,
    pvrGrade: 'A',
    vitrectomyGauge: '25g'
  };

  beforeEach(() => {
    // Set up mocks
    jest.spyOn(riskCalculations, 'calculateRiskWithSteps').mockReturnValue(mockRiskResult);
    jest.spyOn(formatDetachmentHours, 'formatDetachmentHours').mockReturnValue('1-3 o\'clock');
  });

  afterEach(() => {
    // Clean up mocks
    jest.restoreAllMocks();
  });

  test('formats hours list correctly', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    // Add multiple tears
    const tearButton = within(mobileView).getByTestId('tear-toggle');
    fireEvent.click(tearButton); // Adds hour 6
    
    // Find the selection div within the mobile container
    const mobileSelection = within(mobileContainer).getByText(/current selection:/i).closest('div');
    expect(within(mobileSelection).getByText(/Breaks at: 6/i)).toBeInTheDocument();
  });

  test('formats PVR grade display correctly', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer, mobileView } = getMobileView(container);
    
    // Set age
    const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: '65' } });
    
    // Add detachment segment
    const segmentButton = within(mobileView).getByTestId('segment-toggle');
    fireEvent.click(segmentButton);
    
    // Verify detachment segment was added
    const detachmentText = within(mobileContainer).getByText(/Detachment segments: 1/);
    expect(detachmentText).toBeInTheDocument();
    
    // Calculate risk
    const calculateButton = screen.getByText('Calculate Risk');
    expect(calculateButton).not.toBeDisabled();
    expect(calculateButton).toHaveClass('bg-blue-600');
    
    // Click the button and wait for state update
    await act(async () => {
      fireEvent.click(calculateButton);
      // Verify calculateRiskWithSteps was called with correct args
      expect(riskCalculations.calculateRiskWithSteps).toHaveBeenCalledWith({
        age: '65',
        pvrGrade: 'none',
        vitrectomyGauge: '25g',
        selectedHours: [],
        detachmentSegments: [25]
      });
    });
    
    // Wait for and verify PVR grade format in summary
    const riskResults = await screen.findByTestId('risk-results');
    const pvrGradeText = within(riskResults).getByTestId('pvr-grade');
    expect(pvrGradeText).toHaveTextContent('PVR Grade: A');
  });
});
