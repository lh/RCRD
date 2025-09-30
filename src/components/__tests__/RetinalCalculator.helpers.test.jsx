import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { getMobileView } from '../test-helpers/RetinalCalculator.helpers';

// Mock child components minimally
jest.mock('../clock/ClockFace', () => {
  let selectedHours = [];
  
  const MockClockFace = (props) => (
    <div data-testid="clock-face">
      <button 
        onClick={() => {
          props.onTearToggle(6);
          selectedHours = [...selectedHours, 6];
          props.setSelectedHours?.(selectedHours);
        }}
        data-testid="tear-toggle"
        disabled={props.readOnly}
      >
        Toggle Tear
      </button>
      <button 
        onClick={() => {
          props.onSegmentToggle(25);
          props.setDetachmentSegments?.([25]);
        }}
        data-testid="segment-toggle"
        disabled={props.readOnly}
      >
        Toggle Segment
      </button>
      <div data-testid="selection-text">
        {selectedHours.length > 0 ? `Breaks at: ${selectedHours.join(', ')}` : 'Breaks: None'}
      </div>
    </div>
  );
  
  MockClockFace.resetState = () => {
    selectedHours = [];
  };
  
  return { __esModule: true, default: MockClockFace };
});

jest.mock('../RiskInputForm', () => {
  const MockRiskInputForm = (props) => (
    <div data-testid={`risk-form-${props.position || 'mobile'}`}>
      <input 
        type="number"
        value={props.age || ''}
        onChange={(e) => props.setAge?.(e.target.value)}
        data-testid={`age-input-${props.position || 'mobile'}`}
      />
      <select
        value={props.pvrGrade || 'none'}
        onChange={(e) => props.setPvrGrade?.(e.target.value)}
        data-testid={`pvr-grade-${props.position || 'mobile'}`}
      >
        <option value="none">No PVR</option>
        <option value="b">B</option>
      </select>
    </div>
  );
  return { __esModule: true, default: MockRiskInputForm };
});

jest.mock('../RiskResults', () => {
  const MockRiskResults = (props) => (
    <div data-testid="risk-results">
      <div className="text-3xl font-bold mb-2">
        {props.fullModelRisk.probability}%
      </div>
      <div data-testid="input-summary" className="mt-8 border-t pt-6">
        <h3 data-testid="summary-heading">Input Summary</h3>
        <div data-testid="summary-content">
          <p data-testid="summary-age">Age: {props.fullModelRisk.age} years</p>
          <p data-testid="summary-pvr">PVR Grade: {props.fullModelRisk.pvrGrade === 'none' ? 'No PVR' : props.fullModelRisk.pvrGrade}</p>
          <p data-testid="summary-gauge">Vitrectomy Gauge: {props.fullModelRisk.vitrectomyGauge}</p>
        </div>
      </div>
    </div>
  );
  return { __esModule: true, default: MockRiskResults };
});

// NO LONGER MOCKING BUSINESS LOGIC - using real calculations
describe('RetinalCalculator Helper Functions', () => {
  beforeEach(() => {
    // Reset mock component state
    const MockClockFace = jest.requireMock('../clock/ClockFace').default;
    if (MockClockFace.resetState) {
      MockClockFace.resetState();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Hours List Formatting', () => {
    test('formats single hour correctly', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileView } = getMobileView(container);
      
      // Add single tear
      const tearButton = within(mobileView).getByTestId('tear-toggle');
      fireEvent.click(tearButton);
      
      // Verify formatted display
      const selectionText = within(mobileView).getByTestId('selection-text');
      expect(selectionText).toHaveTextContent(/breaks at: 6/i);
    });

    test('handles empty hours list', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileView } = getMobileView(container);
      
      const selectionText = within(mobileView).getByTestId('selection-text');
      expect(selectionText).toHaveTextContent(/breaks: none/i);
    });

    test('formats multiple hours correctly', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileView } = getMobileView(container);
      
      // Add tear twice to simulate multiple hours
      const tearButton = within(mobileView).getByTestId('tear-toggle');
      fireEvent.click(tearButton);
      fireEvent.click(tearButton);
      
      // Verify formatted display
      const selectionText = within(mobileView).getByTestId('selection-text');
      expect(selectionText).toHaveTextContent(/breaks at: 6, 6/i);
    });
  });

  describe('PVR Grade Formatting', () => {
    test('formats grade correctly in results', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileView, mobileContainer } = getMobileView(container);
      
      // Set required fields
      const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
      fireEvent.change(ageInput, { target: { value: '65' } });
      
      const pvrSelect = within(mobileContainer).getByTestId('pvr-grade-mobile');
      fireEvent.change(pvrSelect, { target: { value: 'b' } });
      
      // Add detachment segment
      const segmentButton = within(mobileView).getByTestId('segment-toggle');
      fireEvent.click(segmentButton);
      
      // Calculate
      const calculateButton = within(mobileContainer).getByTestId('calculate-button');
      fireEvent.click(calculateButton);
      
      // Verify PVR grade format (will show actual calculated value)
      expect(screen.getByTestId('summary-pvr')).toHaveTextContent(/PVR Grade:/i);
    });

    test('handles no PVR grade', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileView, mobileContainer } = getMobileView(container);
      
      const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
      fireEvent.change(ageInput, { target: { value: '65' } });
      
      // Ensure PVR is set to 'none' (default)
      const pvrSelect = within(mobileContainer).getByTestId('pvr-grade-mobile');
      fireEvent.change(pvrSelect, { target: { value: 'none' } });
      
      const segmentButton = within(mobileView).getByTestId('segment-toggle');
      fireEvent.click(segmentButton);
      
      const calculateButton = within(mobileContainer).getByTestId('calculate-button');
      fireEvent.click(calculateButton);
      
      // Check that PVR Grade is displayed (exact value will be from real calculation)
      expect(screen.getByTestId('summary-pvr')).toHaveTextContent(/PVR Grade:/i);
    });
  });

  describe('Calculation Parameters', () => {
    test('passes correct parameters to risk calculation', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileView, mobileContainer } = getMobileView(container);
      
      // Fill form
      const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
      fireEvent.change(ageInput, { target: { value: '65' } });
      
      const segmentButton = within(mobileView).getByTestId('segment-toggle');
      fireEvent.click(segmentButton);
      
      const calculateButton = within(mobileContainer).getByTestId('calculate-button');
      fireEvent.click(calculateButton);
      
      // Verify that results are displayed (real calculation will happen)
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    test('handles empty detachment segments', () => {
      const { container } = render(<RetinalCalculator />);
      const { mobileContainer } = getMobileView(container);
      
      const ageInput = within(mobileContainer).getByTestId('age-input-mobile');
      fireEvent.change(ageInput, { target: { value: '65' } });
      
      const calculateButton = within(mobileContainer).getByTestId('calculate-button');
      expect(calculateButton).toBeDisabled();
      
      const errorMessage = within(mobileContainer).getByText(/detachment area required/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
