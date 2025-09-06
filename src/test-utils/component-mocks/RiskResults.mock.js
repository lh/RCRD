import React from 'react';
import { 
  propConfigs, 
  testIdPatterns,
  ariaLabels,
  standardizePropHandling 
} from './mock-behaviors';

/**
 * Mock for RiskResults component
 * Provides both minimal and detailed versions for different testing needs
 * Both versions now use shared behaviors for consistency
 */

// Minimal mock for unit tests
export const createMinimalMock = () => {
  return jest.fn((props) => {
    const standardProps = standardizePropHandling(props);
    const { 
      fullModelRisk,
      significantModelRisk,
      onReset,
      onPrint,
      isMobile
    } = standardProps;
    
    const risk = fullModelRisk || significantModelRisk || { probability: 0 };
    const formattedProbability = propConfigs.RiskResults.formatProbability(risk.probability);
    const riskCategory = propConfigs.RiskResults.getRiskCategory(risk.probability);
    
    return (
      <div 
        data-testid={testIdPatterns.riskProbability}
        data-mobile={isMobile}
        data-risk-category={riskCategory}
        data-model-type={fullModelRisk ? 'full' : 'significant'}
        aria-label={ariaLabels.riskPercentage(formattedProbability)}
      >
        <div data-testid="risk-probability-value">
          {formattedProbability}
        </div>
      {onReset && (
        <button 
          onClick={onReset} 
          data-testid="reset-button"
        >
          Reset Calculator
        </button>
      )}
      {onPrint && (
        <button 
          onClick={onPrint} 
          data-testid="print-button"
        >
          Print Results
        </button>
      )}
    </div>
  );
  });
};

// Detailed mock for integration tests
export const createDetailedMock = () => {
  return jest.fn((props) => {
    const standardProps = standardizePropHandling(props, {
      showSteps: false
    });
    
    const { 
      fullModelRisk,
      significantModelRisk,
      onReset,
      onPrint,
      isMobile,
      showSteps
    } = standardProps;
    
    const risk = fullModelRisk || significantModelRisk || { probability: 0, steps: [] };
    const formattedProbability = propConfigs.RiskResults.formatProbability(risk.probability);
    const riskCategory = propConfigs.RiskResults.getRiskCategory(risk.probability);
    const categoryLabel = riskCategory === 'low-risk' ? 'Low Risk' :
                         riskCategory === 'moderate-risk' ? 'Moderate Risk' : 'High Risk';
    
    return (
      <div 
        data-testid={testIdPatterns.riskProbability}
        className={`risk-results ${isMobile ? 'mobile' : 'desktop'}`}
        data-risk-category={riskCategory}
        data-model-type={fullModelRisk ? 'full' : 'significant'}
        aria-label={ariaLabels.riskPercentage(formattedProbability)}
      >
        {/* Risk Display */}
        <div className="risk-display">
          <h2 className="text-xl font-semibold mb-2">
            Risk of Primary Failure
          </h2>
          <div 
            className="text-3xl font-bold mb-2"
            data-testid="risk-probability-value"
          >
            {formattedProbability}
          </div>
          
          {/* Risk Category */}
          <div 
            className={`risk-category ${riskCategory}`}
            data-testid={testIdPatterns.riskCategory}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Calculation Steps */}
        {showSteps && risk.steps && risk.steps.length > 0 && (
          <div 
            className="calculation-steps mt-4"
            data-testid="calculation-steps"
          >
            <h3 className="text-lg font-medium mb-2">Calculation Details</h3>
            <ul className="space-y-1">
              {risk.steps.map((step, index) => (
                <li 
                  key={index}
                  data-testid={`step-${index}`}
                  className="text-sm"
                >
                  <span className="font-medium">{step.factor}:</span> {step.value}
                </li>
              ))}
            </ul>
            <div className="mt-2 text-sm font-medium">
              Total Logit: {risk.logit?.toFixed(3)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons mt-4 space-x-2">
          {onReset && (
            <button 
              onClick={onReset}
              data-testid="reset-button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Reset Calculator
            </button>
          )}
          {onPrint && (
            <button 
              onClick={onPrint}
              data-testid="print-button"
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
            >
              Print Results
            </button>
          )}
        </div>

        {/* Model Type Indicator */}
        {significantModelRisk && (
          <div 
            className="model-type mt-2 text-xs text-gray-600"
            data-testid="model-type"
          >
            Using Significant Model (p &lt; 0.05)
          </div>
        )}
      </div>
    );
  });
};

// Default export for jest.mock()
const MockRiskResults = createMinimalMock();
export default MockRiskResults;