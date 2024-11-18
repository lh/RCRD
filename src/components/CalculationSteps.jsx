import React from 'react';
import { getStepExplanation, getMethodologyNote } from '../utils/riskResultsText.js';
import ProbabilityDisplay from './ProbabilityDisplay.jsx';

const CalculationSteps = ({ steps, logit, probability }) => (
    <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-4">
            Note: {getMethodologyNote()}
        </p>
        {steps.map((step, index) => (
            <div key={index} className="flex items-baseline">
                <span className="w-1/3 text-sm text-gray-600">{step.step}:</span>
                <span className="w-20 font-mono">{step.value}</span>
                <span className="text-sm text-gray-500 ml-2">
                    {getStepExplanation(step.step, step.value)}
                </span>
            </div>
        ))}
        <div className="mt-4 pt-4 border-t">
            <div className="flex items-baseline">
                <span className="w-1/3 text-sm font-medium text-gray-600">Total logit:</span>
                <span className="w-20 font-mono font-medium">{logit}</span>
            </div>
            <ProbabilityDisplay logit={logit} probability={probability} />
        </div>
    </div>
);

export default CalculationSteps;
