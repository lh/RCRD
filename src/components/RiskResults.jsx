import React, { useState } from 'react';
import { MODEL_TYPE } from '../constants/modelTypes.js';
import ModelToggle from './ModelToggle';

const RiskResults = ({ fullModelRisk, significantModelRisk, isMobile = false }) => {
    const [modelType, setModelType] = useState(MODEL_TYPE.FULL);
    const [showDetails, setShowDetails] = useState(false);

    if (!fullModelRisk || !significantModelRisk) return null;

    // Get the appropriate risk data based on selected model
    const risk = modelType === MODEL_TYPE.FULL ? fullModelRisk : significantModelRisk;

    const formatStep = (step) => {
        if (step.excluded) {
            return (
                <div key={step.step} className="mb-2">
                    <div className="flex justify-between text-gray-500">
                        <span>{step.step}:</span>
                        <span>0.000</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        (Original value: {step.value.toFixed(3)}, excluded due to p ≥ 0.05)
                    </p>
                    <p className="text-xs text-gray-400">
                        Category: {step.category}
                    </p>
                </div>
            );
        }

        return (
            <div key={step.step} className="mb-2">
                <div className="flex justify-between">
                    <span>{step.step}:</span>
                    <span>{step.value.toFixed(3)}</span>
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

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Risk Calculation Results</h3>
            
            {/* Model toggle with explanations */}
            <ModelToggle 
                modelType={modelType}
                onChange={setModelType}
                isMobile={isMobile}
            />

            {/* Risk probability */}
            <div className="mb-6">
                <div className="text-3xl font-bold mb-2">
                    {risk.probability.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                    Probability of requiring additional surgery within 6 weeks
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
                    <h4 className="font-medium mb-2">Calculation Details</h4>
                    <div className="font-mono text-sm">
                        {risk.steps.map(formatStep)}
                        
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-medium">
                                <span>Logit:</span>
                                <span>{risk.logit.toFixed(3)}</span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <p>The probability is calculated from the logit using:</p>
                                <p className="font-medium">p = 1 / (1 + e<sup>-logit</sup>)</p>
                                <p>Where:</p>
                                <ul className="list-disc list-inside pl-2 space-y-1">
                                    <li>p is the probability ({(risk.probability/100).toFixed(3)})</li>
                                    <li>e is Euler's number (≈ 2.71828)</li>
                                    <li>logit is the sum of coefficients ({risk.logit.toFixed(3)})</li>
                                </ul>
                                <p className="mt-4">
                                    {`1 / (1 + ${Math.exp(-risk.logit).toFixed(3)}) = ${(risk.probability/100).toFixed(3)}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskResults;
