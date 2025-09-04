import React, { useState } from 'react';
import { MODEL_TYPE } from '../constants/modelTypes.js';
import ModelToggle from './ModelToggle';

const RiskResults = ({ fullModelRisk, significantModelRisk, isMobile = false }) => {
    const [modelType, setModelType] = useState(MODEL_TYPE.FULL);
    const [showDetails, setShowDetails] = useState(false);

    // Handle missing or malformed risk data gracefully
    const createDefaultRisk = () => ({
        probability: 0,
        steps: [],
        logit: 0
    });

    // Validate and sanitize risk data
    const sanitizeRisk = (risk) => {
        if (!risk) return createDefaultRisk();
        
        return {
            probability: (typeof risk.probability === 'number' && !isNaN(risk.probability)) 
                ? risk.probability 
                : 0,
            steps: Array.isArray(risk.steps) ? risk.steps : [],
            logit: (typeof risk.logit === 'number' && !isNaN(risk.logit)) 
                ? risk.logit 
                : 0
        };
    };

    const sanitizedFullRisk = sanitizeRisk(fullModelRisk);
    const sanitizedSignificantRisk = sanitizeRisk(significantModelRisk);

    // Get the appropriate risk data based on selected model
    const risk = modelType === MODEL_TYPE.FULL ? sanitizedFullRisk : sanitizedSignificantRisk;

    const formatStep = (step) => {
        // Handle malformed step objects
        if (!step || typeof step !== 'object') return null;
        
        const stepName = step.step || 'Unknown Step';
        const stepId = stepName.toLowerCase().replace(/\s+/g, '-');
        
        const stepValue = typeof step.value === 'number' && !isNaN(step.value) ? step.value : 0;
        
        if (step.excluded) {
            return (
                <div key={stepName} 
                     className="mb-2"
                     data-testid={`step-${stepId}`}
                     data-excluded="true"
                     data-p-value=">=0.05">
                    <div className="flex justify-between text-gray-500">
                        <span>{stepName}:</span>
                        <span>0.000</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        (Original value: {stepValue.toFixed(3)}, excluded due to p ≥ 0.05)
                    </p>
                    <p className="text-xs text-gray-400">
                        Category: {step.category || 'Unknown'}
                    </p>
                </div>
            );
        }

        return (
            <div key={stepName} 
                 className="mb-2"
                 data-testid={`step-${stepId}`}
                 data-coefficient={stepValue}
                 data-category={step.category}>
                <div className="flex justify-between">
                    <span>{stepName}:</span>
                    <span>{stepValue.toFixed(3)}</span>
                </div>
                {step.detail && (
                    <p className="text-sm text-gray-600">{step.detail}</p>
                )}
                <p className="text-xs text-gray-400">
                    Category: {step.category}
                </p>
            </div>
        );
    };

    // Determine risk category for medical validation
    const riskCategory = risk.probability < 10 ? 'low-risk' : 
                        risk.probability < 25 ? 'moderate-risk' : 'high-risk';
    
    // Ensure probability is within valid range (0-100)
    const validProbability = Math.max(0, Math.min(100, risk.probability || 0));
    
    return (
        <div className="bg-white p-6 rounded-lg shadow" data-testid="risk-results">
            <h3 className="text-xl font-bold mb-4">Risk Calculation Results</h3>
            
            {/* Model toggle with explanations */}
            <ModelToggle 
                modelType={modelType}
                onChange={setModelType}
                isMobile={isMobile}
            />

            {/* Risk probability with medical validation attributes */}
            <div className="mb-6" 
                 data-testid="risk-probability"
                 data-model-type={modelType}
                 data-risk-category={riskCategory}
                 aria-label={`Risk percentage: ${validProbability.toFixed(1)}%`}>
                <div className="text-3xl font-bold mb-2"
                     data-testid="risk-probability-value">
                    {validProbability.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                    Probability of requiring additional surgery within 6 months
                </p>
            </div>

            {/* Show/Hide Details Button */}
            <div className="mb-4">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                    {showDetails ? 'Hide Calculation Details' : 'Show Calculation Details'}
                </button>
            </div>

            {/* Calculation details (collapsible) */}
            {showDetails && (
                <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Calculation Details</h4>
                    <div className="md:grid md:grid-cols-2 md:gap-8">
                        {/* Left column: Calculation steps */}
                        <div className="font-mono text-sm">
                            <h5 className="font-medium mb-3 text-gray-700">Steps</h5>
                            {risk.steps.map(formatStep).filter(Boolean)}
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-medium">
                                    <span>Logit:</span>
                                    <span>{risk.logit.toFixed(3)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right column: Logit transformation */}
                        <div className="mt-6 md:mt-0">
                            <h5 className="font-medium mb-3 text-gray-700">Logit Transformation</h5>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <p className="text-sm text-gray-600">The probability is calculated from the logit using:</p>
                                <div className="text-center py-2">
                                    <p className="font-medium text-lg">p = 1 / (1 + e<sup>-logit</sup>)</p>
                                </div>
                                <p className="text-sm text-gray-600">Where:</p>
                                <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-gray-600">
                                    <li>p is the probability ({(risk.probability/100).toFixed(3)})</li>
                                    <li>e is Euler's number (≈ 2.71828)</li>
                                    <li>logit is the sum of coefficients ({risk.logit.toFixed(3)})</li>
                                </ul>
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 font-medium text-center">
                                        {`1 / (1 + ${Math.exp(-risk.logit).toFixed(3)}) = ${(risk.probability/100).toFixed(3)}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskResults;
