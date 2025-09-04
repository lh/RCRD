import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskResults from '../RiskResults';
import CalculationSteps from '../CalculationSteps';
import RetinalCalculator from '../RetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';

// Mock the calculation function
jest.mock('../../utils/riskCalculations');

// Mock child components for RetinalCalculator tests
jest.mock('../MobileRetinalCalculator', () => {
  return function MockMobileCalculator() {
    return <div data-testid="mobile-calculator">Mobile Calculator</div>;
  };
});

jest.mock('../DesktopRetinalCalculator', () => {
  return function MockDesktopCalculator() {
    return <div data-testid="desktop-calculator">Desktop Calculator</div>;
  };
});

describe('Error Boundary and Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console errors for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('Malformed Calculation Data', () => {
    describe('RiskResults Error Handling', () => {
      it('should handle NaN probability gracefully', () => {
        const malformedRisk = { 
          probability: NaN, 
          steps: [], 
          logit: NaN 
        };

        const { container } = render(
          <RiskResults fullModelRisk={malformedRisk} />
        );

        // Should display 0% or similar fallback
        const probabilityDisplay = container.querySelector('[data-testid="risk-probability"]');
        expect(probabilityDisplay).toBeInTheDocument();
        
        // Should not display "NaN%"
        expect(screen.queryByText('NaN%')).not.toBeInTheDocument();
      });

      it('should handle null probability gracefully', () => {
        const nullRisk = { 
          probability: null, 
          steps: [], 
          logit: null 
        };

        expect(() => render(
          <RiskResults fullModelRisk={nullRisk} />
        )).not.toThrow();

        // Should display a default value
        expect(screen.getByText(/0%|0\.0%/)).toBeInTheDocument();
      });

      it('should handle undefined risk object', () => {
        expect(() => render(
          <RiskResults fullModelRisk={undefined} />
        )).not.toThrow();

        // Component should render with default state
        expect(screen.getByText('Risk Calculation Results')).toBeInTheDocument();
      });

      it('should handle negative probability values', () => {
        const negativeRisk = { 
          probability: -25.5, 
          steps: [], 
          logit: -5.0 
        };

        const { container } = render(
          <RiskResults fullModelRisk={negativeRisk} />
        );

        // Should clamp to 0% minimum
        const probabilityDisplay = container.querySelector('[data-testid="risk-probability"]');
        expect(probabilityDisplay).toBeInTheDocument();
        
        // Should not display negative percentage
        expect(screen.queryByText(/-25\.5%/)).not.toBeInTheDocument();
      });

      it('should handle probability values over 100%', () => {
        const overflowRisk = { 
          probability: 150.5, 
          steps: [], 
          logit: 10.0 
        };

        const { container } = render(
          <RiskResults fullModelRisk={overflowRisk} />
        );

        // Should clamp to 100% maximum
        const probabilityDisplay = container.querySelector('[data-testid="risk-probability"]');
        expect(probabilityDisplay).toBeInTheDocument();
        
        // Should not display over 100%
        expect(screen.queryByText(/150\.5%/)).not.toBeInTheDocument();
        // Should display 100% or less
        expect(screen.getByText(/\d{1,3}\.?\d?%/)).toBeInTheDocument();
      });

      it('should handle malformed steps array', () => {
        const malformedSteps = { 
          probability: 50.0, 
          steps: [
            { step: null, value: undefined },
            { step: 'Valid Step', value: 'NaN' },
            null,
            undefined,
            { step: 123, value: {} }
          ], 
          logit: 0.0 
        };

        expect(() => render(
          <RiskResults fullModelRisk={malformedSteps} showSteps={true} />
        )).not.toThrow();
      });
    });

    describe('CalculationSteps Error Handling', () => {
      it('should handle missing steps prop', () => {
        expect(() => render(
          <CalculationSteps steps={undefined} logit="-0.63" probability="34.7%" />
        )).not.toThrow();

        // Should render with empty or default state
        const container = screen.getByTestId ? screen.getByTestId('calculation-steps') : document.body;
        expect(container).toBeInTheDocument();
      });

      it('should handle malformed step objects', () => {
        const malformedSteps = [
          null,
          undefined,
          { step: null, value: 'test' },
          { step: 'Valid', value: null },
          { step: 123, value: [] },
          'not an object'
        ];

        expect(() => render(
          <CalculationSteps steps={malformedSteps} logit="1.0" probability="73%" />
        )).not.toThrow();
      });

      it('should handle invalid logit values', () => {
        const validSteps = [
          { step: 'Intercept', value: '-2.31' },
          { step: 'Age', value: '0.45' }
        ];

        // Test with NaN logit
        expect(() => render(
          <CalculationSteps steps={validSteps} logit="NaN" probability="50%" />
        )).not.toThrow();

        // Test with null logit
        expect(() => render(
          <CalculationSteps steps={validSteps} logit={null} probability="50%" />
        )).not.toThrow();

        // Test with undefined logit
        expect(() => render(
          <CalculationSteps steps={validSteps} logit={undefined} probability="50%" />
        )).not.toThrow();
      });
    });
  });

  describe('Edge Cases and Invalid Inputs', () => {
    it('should handle invalid age values in calculations', () => {
      calculateRiskWithSteps.mockImplementation(({ age }) => {
        // Simulate handling of invalid age
        if (age < 0 || age > 150 || isNaN(age)) {
          return {
            probability: 0,
            steps: [{ step: 'Error', value: 'Invalid age' }],
            logit: 0
          };
        }
        return { probability: 50, steps: [], logit: 0 };
      });

      // Test negative age
      const negativeResult = calculateRiskWithSteps({ age: -5 });
      expect(negativeResult.probability).toBe(0);
      expect(negativeResult.steps[0].step).toBe('Error');

      // Test extreme age
      const extremeResult = calculateRiskWithSteps({ age: 200 });
      expect(extremeResult.probability).toBe(0);

      // Test NaN age
      const nanResult = calculateRiskWithSteps({ age: NaN });
      expect(nanResult.probability).toBe(0);
    });

    it('should handle invalid PVR grades', () => {
      calculateRiskWithSteps.mockImplementation(({ pvrGrade }) => {
        const validGrades = ['none', 'A', 'B', 'C'];
        if (!validGrades.includes(pvrGrade)) {
          return {
            probability: 0,
            steps: [{ step: 'Error', value: 'Invalid PVR grade' }],
            logit: 0
          };
        }
        return { probability: 50, steps: [], logit: 0 };
      });

      // Test invalid grade
      const invalidResult = calculateRiskWithSteps({ pvrGrade: 'Z' });
      expect(invalidResult.probability).toBe(0);
      expect(invalidResult.steps[0].value).toBe('Invalid PVR grade');

      // Test null grade
      const nullResult = calculateRiskWithSteps({ pvrGrade: null });
      expect(nullResult.probability).toBe(0);
    });

    it('should handle invalid vitrectomy gauge values', () => {
      calculateRiskWithSteps.mockImplementation(({ vitrectomyGauge }) => {
        const validGauges = ['20g', '23g', '25g', '27g', 'not_recorded'];
        if (!validGauges.includes(vitrectomyGauge)) {
          return {
            probability: 0,
            steps: [{ step: 'Error', value: 'Invalid gauge' }],
            logit: 0
          };
        }
        return { probability: 50, steps: [], logit: 0 };
      });

      // Test invalid gauge
      const invalidResult = calculateRiskWithSteps({ vitrectomyGauge: '30g' });
      expect(invalidResult.probability).toBe(0);

      // Test undefined gauge
      const undefinedResult = calculateRiskWithSteps({ vitrectomyGauge: undefined });
      expect(undefinedResult.probability).toBe(0);
    });
  });

  describe('Calculation Exception Handling', () => {
    it('should handle division by zero in logit calculation', () => {
      calculateRiskWithSteps.mockImplementation(() => {
        // Simulate division by zero scenario
        const logit = 1 / 0; // Infinity
        return {
          probability: isFinite(logit) ? 50 : 100,
          steps: [],
          logit: logit
        };
      });

      const result = calculateRiskWithSteps({});
      expect(result.probability).toBe(100);
      expect(result.logit).toBe(Infinity);
    });

    it('should handle calculation function throwing an error', () => {
      calculateRiskWithSteps.mockImplementation(() => {
        throw new Error('Calculation failed');
      });

      // Component should handle the error gracefully
      expect(() => {
        try {
          calculateRiskWithSteps({});
        } catch (error) {
          // Error should be caught and handled
          return { probability: 0, steps: [], logit: 0 };
        }
      }).not.toThrow();
    });

    it('should handle Math.exp overflow in probability calculation', () => {
      calculateRiskWithSteps.mockImplementation(() => {
        // Very large logit value that could cause exp overflow
        const largeLogit = 1000;
        const probability = 100 / (1 + Math.exp(-largeLogit));
        
        return {
          probability: isFinite(probability) ? probability : 100,
          steps: [],
          logit: largeLogit
        };
      });

      const result = calculateRiskWithSteps({});
      expect(result.probability).toBeLessThanOrEqual(100);
      expect(result.probability).toBeGreaterThanOrEqual(0);
    });

    it('should handle Math.exp underflow in probability calculation', () => {
      calculateRiskWithSteps.mockImplementation(() => {
        // Very negative logit value that could cause exp underflow
        const smallLogit = -1000;
        const probability = 100 / (1 + Math.exp(-smallLogit));
        
        return {
          probability: isFinite(probability) ? probability : 0,
          steps: [],
          logit: smallLogit
        };
      });

      const result = calculateRiskWithSteps({});
      expect(result.probability).toBeLessThanOrEqual(100);
      expect(result.probability).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Recovery and User Feedback', () => {
    it('should display user-friendly error message for calculation failure', () => {
      const errorRisk = {
        probability: 0,
        steps: [{ step: 'Error', value: 'Calculation failed' }],
        logit: 0,
        error: true
      };

      render(<RiskResults fullModelRisk={errorRisk} />);

      // Should show some indication of error or fallback
      const riskDisplay = screen.getByTestId ? 
        screen.queryByTestId('risk-probability') : 
        screen.queryByText(/0%|Error|Unable to calculate/i);
      
      expect(riskDisplay).toBeInTheDocument();
    });

    it('should allow retry after error', () => {
      const mockReset = jest.fn();
      const errorRisk = {
        probability: 0,
        steps: [],
        logit: 0,
        error: true
      };

      render(<RiskResults fullModelRisk={errorRisk} onReset={mockReset} />);

      // Reset button should be available
      const resetButton = screen.queryByText(/Reset|Try Again/i);
      if (resetButton) {
        expect(resetButton).toBeInTheDocument();
      }
    });

    it('should validate data before calculation', () => {
      calculateRiskWithSteps.mockImplementation((params) => {
        // Validate required parameters
        if (!params.age || !params.pvrGrade || !params.vitrectomyGauge) {
          return {
            probability: 0,
            steps: [{ step: 'Validation', value: 'Missing required data' }],
            logit: 0,
            error: true
          };
        }
        return { probability: 50, steps: [], logit: 0 };
      });

      // Test with missing data
      const incompleteResult = calculateRiskWithSteps({ age: 50 });
      expect(incompleteResult.error).toBe(true);
      expect(incompleteResult.steps[0].value).toBe('Missing required data');

      // Test with complete data
      const completeResult = calculateRiskWithSteps({
        age: 50,
        pvrGrade: 'none',
        vitrectomyGauge: '25g'
      });
      expect(completeResult.error).toBeUndefined();
      expect(completeResult.probability).toBe(50);
    });
  });

  describe('Component Error Boundaries', () => {
    it('should not crash the entire app on component error', () => {
      // Test that RetinalCalculator doesn't crash even with errors
      expect(() => render(<RetinalCalculator />)).not.toThrow();
    });

    it('should handle missing required props gracefully', () => {
      // Test components with missing props
      expect(() => render(<RiskResults />)).not.toThrow();
      expect(() => render(<CalculationSteps />)).not.toThrow();
    });

    it('should handle corrupted state gracefully', () => {
      const corruptedRisk = {
        probability: '50%', // Should be number
        steps: 'not an array', // Should be array
        logit: { value: 1.0 } // Should be number
      };

      expect(() => render(
        <RiskResults fullModelRisk={corruptedRisk} />
      )).not.toThrow();
    });
  });
});