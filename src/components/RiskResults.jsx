import React, { useState } from 'react';
import { MODEL_TYPE } from '../constants/modelTypes.js';
import ModelToggle from './ModelToggle';

const RiskResults = ({ fullModelRisk, significantModelRisk }) => {
    const [modelType, setModelType] = useState(MODEL_TYPE.FULL);
    const [showDetails, setShowDetails] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

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
                    {showDebug && step.debug && (
                        <p className="text-xs text-blue-500">
                            Debug: {step.debug}
                        </p>
                    )}
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
                {showDebug && step.debug && (
                    <p className="text-xs text-blue-500">
                        Debug: {step.debug}
                    </p>
                )}
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
                <>
                    {/* Debug toggle */}
                    <div className="mb-4">
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                        </button>
                    </div>

                    {/* Calculation steps */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Calculation Details</h4>
                        <div className="font-mono text-sm">
                            {risk.steps.map(formatStep)}
                            
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-medium">
                                    <span>Logit:</span>
                                    <span>{risk.logit.toFixed(3)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RiskResults;
