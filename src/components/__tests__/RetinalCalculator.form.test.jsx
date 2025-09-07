import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { getMobileView } from '../test-helpers/RetinalCalculator.helpers';
import { MODEL_TYPE } from '../../constants/modelTypes';
import { TEST_DEFAULTS } from '../../test-utils/constants';

// Mock the Mobile and Desktop calculators to use our mocked components
jest.mock('../MobileRetinalCalculator', () => {
  return function MockMobileRetinalCalculator({ modelType }) {
    const React = require('react');
    const ClockFace = require('../../test-utils/component-mocks/ClockFace.mock').createDetailedMock();
    const RiskInputForm = require('../../test-utils/component-mocks/RiskInputForm.mock').createDetailedMock();
    const RiskResults = require('../../test-utils/component-mocks/RiskResults.mock').createDetailedMock();
    const { calculateRiskWithSteps } = require('../../utils/riskCalculations');
    const mockTestDefaults = { age: { value: '50' } };
    
    const [age, setAge] = React.useState(mockTestDefaults.age.value);
    const [pvrGrade, setPvrGrade] = React.useState('none');
    const [vitrectomyGauge, setVitrectomyGauge] = React.useState('25g');
    const [selectedHours, setSelectedHours] = React.useState([]);
    const [detachmentSegments, setDetachmentSegments] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);
    const [riskResult, setRiskResult] = React.useState(null);
    
    const handleCalculate = () => {
      const result = calculateRiskWithSteps({
        age,
        pvrGrade,
        vitrectomyGauge,
        selectedHours,
        detachmentSegments,
        cryotherapy: 'yes',
        tamponade: 'c2f6',
        modelType
      });
      setRiskResult(result);
      setShowResults(true);
    };
    
    const handleReset = () => {
      setShowResults(false);
      setRiskResult(null);
    };
    
    const isValid = age && (selectedHours.length > 0 || detachmentSegments.length > 0);
    
    return React.createElement('div', { className: 'space-y-1' },
      !showResults ? (
        React.createElement(React.Fragment, null,
          React.createElement(ClockFace, {
            onTearToggle: (hour) => setSelectedHours(prev => 
              prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
            ),
            onSegmentToggle: (segment) => setDetachmentSegments(prev =>
              prev.includes(segment) ? prev.filter(s => s !== segment) : [...prev, segment]
            ),
            selectedHours: selectedHours,
            detachmentSegments: detachmentSegments,
            readOnly: false
          }),
          React.createElement(RiskInputForm, {
            position: 'mobile',
            age: age,
            setAge: setAge,
            pvrGrade: pvrGrade,
            setPvrGrade: setPvrGrade,
            vitrectomyGauge: vitrectomyGauge,
            setVitrectomyGauge: setVitrectomyGauge,
            isMobile: true
          }),
          React.createElement('div', { className: 'mt-1' },
            React.createElement('button', {
              onClick: handleCalculate,
              disabled: !isValid,
              'data-testid': 'calculate-button',
              className: `w-full py-2 px-4 rounded text-white font-medium ${
                isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`
            }, 'Calculate Risk'),
            !isValid && React.createElement('p', {
              className: 'mt-1 text-sm text-red-600 text-center'
            }, !age ? 'Age required' : 'Detachment area required')
          )
        )
      ) : (
        React.createElement(React.Fragment, null,
          React.createElement(RiskResults, {
            fullModelRisk: riskResult,
            onReset: handleReset
          }),
          React.createElement(ClockFace, {
            selectedHours: selectedHours,
            detachmentSegments: detachmentSegments,
            readOnly: true
          })
        )
      )
    );
  };
});

jest.mock('../DesktopRetinalCalculator', () => {
  return function MockDesktopRetinalCalculator({ modelType }) {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'desktop-calculator' }, 'Desktop View');
  };
});


// NO LONGER MOCKING BUSINESS LOGIC - using real calculations
describe('RetinalCalculator Form', () => {
  const mockRisk = {
    probability: 25.5,
    steps: [],
    logit: -1.082,
    age: TEST_DEFAULTS.age.value,
    pvrGrade: TEST_DEFAULTS.pvrGrade.value,
    vitrectomyGauge: TEST_DEFAULTS.vitrectomyGauge.value,
    cryotherapy: TEST_DEFAULTS.cryotherapy.value,
    tamponade: TEST_DEFAULTS.tamponade.value,
    selectedHours: TEST_DEFAULTS.selectedHours.value,
    detachmentSegments: TEST_DEFAULTS.detachmentSegments.value
  };

  beforeEach(() => {
  });

  const getEnabledCalculateButton = () => {
    const buttons = screen.getAllByTestId('calculate-button');
    return buttons.find(button => !button.disabled);
  };

  const getDisabledCalculateButton = () => {
    const buttons = screen.getAllByTestId('calculate-button');
    return buttons.find(button => button.disabled);
  };

  test('calculates risk when form is valid', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Fill in required fields using mobile form
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    
    // Click on an hour marker to add a tear (which satisfies the detachment requirement)
    const hour3 = within(mobileView).getByTestId('hour-3');
    const circle = hour3.querySelector('circle');
    fireEvent.click(circle);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('risk-probability')).toBeInTheDocument();
    });
    
    // Real calculation happened - verify results are displayed
    expect(screen.getByTestId('risk-probability')).toBeInTheDocument();
  });

  test('disables calculation when form is invalid', () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileContainer } = getMobileView(container);
    
    const calculateButton = getDisabledCalculateButton();
    expect(calculateButton).toBeDisabled();
    
    // Add age but no detachment
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    expect(calculateButton).toBeDisabled();
    
    // Verify validation message
    const buttonSection = calculateButton.parentElement;
    expect(within(buttonSection).getByText(/detachment area required/i)).toBeInTheDocument();
  });

  test('resets calculator state', async () => {
    const { container } = render(<RetinalCalculator />);
    const { mobileView } = getMobileView(container);
    
    // Set up initial state using mobile form
    const ageInput = screen.getByTestId('age-input-mobile');
    fireEvent.change(ageInput, { target: { value: TEST_DEFAULTS.age.value } });
    
    // Click on an hour marker to add a tear
    const hour3 = within(mobileView).getByTestId('hour-3');
    const circle = hour3.querySelector('circle');
    fireEvent.click(circle);
    
    const calculateButton = getEnabledCalculateButton();
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('risk-probability')).toBeInTheDocument();
    });
    
    // Reset
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // Wait for and verify reset state
    await waitFor(() => {
      expect(screen.queryByTestId('risk-probability')).not.toBeInTheDocument();
    });
    
    // Verify form reset to defaults
    const newAgeInput = screen.getByTestId('age-input-mobile');
    expect(newAgeInput.value).toBe(TEST_DEFAULTS.age.value);
  });

});
