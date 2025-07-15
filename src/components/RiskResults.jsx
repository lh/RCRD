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
                            {risk.steps.map(formatStep)}
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
