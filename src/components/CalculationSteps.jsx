import React from 'react';
import { getStepExplanation, getMethodologyNote } from '../utils/riskResultsText.js';
import ProbabilityDisplay from './ProbabilityDisplay.jsx';

const CalculationSteps = ({ steps, logit, probability }) => {
    // Handle edge cases for malformed data
    const validSteps = Array.isArray(steps) ? steps.filter(step => 
        step && typeof step === 'object' && step.step
    ) : [];
    
    const validLogit = isFinite(parseFloat(logit)) ? logit : '0.000';
    
    // Calculate step IDs for testing
    const getStepId = (step) => {
        if (!step || !step.step) return 'unknown';
        return String(step.step).toLowerCase().replace(/\s+/g, '-');
    };
    
    return (
        <div className="space-y-2" data-testid="calculation-steps">
            <p className="text-sm text-gray-600 mb-4"
               data-testid="methodology-note">
                Note: {getMethodologyNote()}
            </p>
            {validSteps.map((step, index) => {
                const stepId = getStepId(step);
                const stepValue = step.value !== null && step.value !== undefined ? 
                    String(step.value) : '0.000';
                
                return (
                    <div key={index} 
                         className="flex items-baseline"
                         data-testid={`calculation-step-${stepId}`}
                         data-step-index={index}
                         data-step-name={step.step}
                         data-step-value={stepValue}
                         data-excluded={step.excluded ? 'true' : 'false'}>
                        <span className="w-1/3 text-sm text-gray-600"
                              data-testid={`step-label-${stepId}`}>
                            {step.step}:
                        </span>
                        <span className="w-20 font-mono"
                              data-testid={`step-value-${stepId}`}>
                            {stepValue}
                        </span>
                        <span className="text-sm text-gray-500 ml-2"
                              data-testid={`step-explanation-${stepId}`}>
                            {getStepExplanation(step.step, stepValue)}
                        </span>
                    </div>
                );
            })}
            <div className="mt-4 pt-4 border-t"
                 data-testid="calculation-summary">
                <div className="flex items-baseline"
                     data-testid="logit-display">
                    <span className="w-1/3 text-sm font-medium text-gray-600">Total logit:</span>
                    <span className="w-20 font-mono font-medium"
                          data-testid="logit-value"
                          data-value={validLogit}>
                        {validLogit}
                    </span>
                </div>
                <ProbabilityDisplay logit={validLogit} probability={probability} />
            </div>
        </div>
    );
};

export default CalculationSteps;
