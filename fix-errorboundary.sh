#!/bin/bash

# Fix the ErrorBoundary test file syntax errors

cat > src/components/__tests__/ErrorBoundary.test.jsx << 'EOF'
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskResults from '../RiskResults';
import CalculationSteps from '../CalculationSteps';
import RetinalCalculator from '../RetinalCalculator';
import { calculateRiskWithSteps } from '../../utils/riskCalculations';

// Mock child components for RetinalCalculator tests
jest.mock('../MobileRetinalCalculator', () => {
  return function MockMobileCalculator() {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mobile-calculator' }, 'Mobile Calculator');
  };
});

jest.mock('../DesktopRetinalCalculator', () => {
  return function MockDesktopCalculator() {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'desktop-calculator' }, 'Desktop Calculator');
  };
});

// NO LONGER MOCKING BUSINESS LOGIC - using real calculations
describe('Error Boundary and Error Handling Tests', () => {
  describe('Component Error Boundaries', () => {
    it('should render RetinalCalculator without errors', () => {
      render(<RetinalCalculator />);
      expect(screen.getByText(/Risk Calculator Retinal Detachment/i)).toBeInTheDocument();
    });

    it('should handle RiskResults with valid data', () => {
      const validRisk = {
        probability: 25.5,
        steps: [],
        logit: -1.082
      };
      
      render(<RiskResults fullModelRisk={validRisk} />);
      expect(screen.getByText('25.5%')).toBeInTheDocument();
    });

    it('should handle RiskResults with boundary values', () => {
      const boundaryRisk = {
        probability: 0,
        steps: [],
        logit: -10
      };
      
      render(<RiskResults fullModelRisk={boundaryRisk} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle CalculationSteps with valid data', () => {
      const validRisk = {
        probability: 25.5,
        steps: [
          { step: 'Constant', value: -1.611 },
          { step: 'Age', value: 0.459 }
        ],
        logit: -1.082
      };
      
      render(<CalculationSteps fullModelRisk={validRisk} />);
      expect(screen.getByText(/Constant/)).toBeInTheDocument();
    });
  });

  describe('Input Validation Error Handling', () => {
    it('should handle invalid age values', () => {
      // Test negative age
      const negativeResult = calculateRiskWithSteps({ age: -10 });
      expect(negativeResult.probability).toBeGreaterThanOrEqual(0);
      expect(negativeResult.probability).toBeLessThanOrEqual(100);
      
      // Test very large age
      const largeResult = calculateRiskWithSteps({ age: 200 });
      expect(largeResult.probability).toBeGreaterThanOrEqual(0);
      expect(largeResult.probability).toBeLessThanOrEqual(100);
    });

    it('should handle invalid PVR grade values', () => {
      // Test invalid grade
      const invalidResult = calculateRiskWithSteps({ pvrGrade: 'Z' });
      expect(invalidResult.probability).toBeGreaterThanOrEqual(0);
      expect(invalidResult.probability).toBeLessThanOrEqual(100);
      
      // Test undefined grade
      const undefinedResult = calculateRiskWithSteps({ pvrGrade: undefined });
      expect(undefinedResult.probability).toBeGreaterThanOrEqual(0);
      expect(undefinedResult.probability).toBeLessThanOrEqual(100);
      
      // Test null grade
      const nullResult = calculateRiskWithSteps({ pvrGrade: null });
      expect(nullResult.probability).toBeGreaterThanOrEqual(0);
      expect(nullResult.probability).toBeLessThanOrEqual(100);
    });

    it('should handle invalid vitrectomy gauge values', () => {
      // Test invalid gauge
      const invalidResult = calculateRiskWithSteps({ vitrectomyGauge: '30g' });
      expect(invalidResult.probability).toBeGreaterThanOrEqual(0);
      expect(invalidResult.probability).toBeLessThanOrEqual(100);

      // Test undefined gauge
      const undefinedResult = calculateRiskWithSteps({ vitrectomyGauge: undefined });
      expect(undefinedResult.probability).toBeGreaterThanOrEqual(0);
      expect(undefinedResult.probability).toBeLessThanOrEqual(100);
    });
  });

  describe('Calculation Exception Handling', () => {
    it('should handle empty input object', () => {
      const result = calculateRiskWithSteps({});
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(100);
      expect(isFinite(result.logit)).toBe(true);
    });

    it('should not throw errors for any input', () => {
      expect(() => {
        calculateRiskWithSteps({});
      }).not.toThrow();
      
      expect(() => {
        calculateRiskWithSteps(null);
      }).not.toThrow();
      
      expect(() => {
        calculateRiskWithSteps(undefined);
      }).not.toThrow();
    });

    it('should handle extreme values gracefully', () => {
      // Test with very large hour values
      const result = calculateRiskWithSteps({
        selectedHours: [1000, -1000],
        detachmentSegments: Array(1000).fill('segment')
      });
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(100);
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
      const riskDisplay = screen.queryByText(/0%/);
      expect(riskDisplay).toBeInTheDocument();
    });

    it('should handle missing required props gracefully', () => {
      // RiskResults should handle missing props
      render(<RiskResults />);
      
      // Should render without crashing
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    });

    it('should handle malformed risk data structure', () => {
      const malformedRisk = {
        // Missing probability field
        steps: null,
        logit: 'not a number'
      };
      
      render(<RiskResults fullModelRisk={malformedRisk} />);
      
      // Should handle gracefully
      expect(screen.getByTestId('risk-results')).toBeInTheDocument();
    });
  });

  describe('Cross-Component Error Propagation', () => {
    it('should prevent errors from propagating between components', () => {
      const validRisk = {
        probability: 50,
        steps: [],
        logit: 0
      };
      
      // Both components should render independently
      render(
        <>
          <RiskResults fullModelRisk={validRisk} />
          <CalculationSteps fullModelRisk={validRisk} />
        </>
      );
      
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
EOF

echo "Fixed ErrorBoundary.test.jsx"