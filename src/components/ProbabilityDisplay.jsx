import React from 'react';
import { getProbabilityFormulaText, getProbabilityResultText } from '../utils/riskResultsText.js';

const ProbabilityDisplay = ({ logit, probability }) => (
    <div>
        <div className="mt-2 text-sm text-gray-600">
            Probability = {getProbabilityFormulaText(logit)}
        </div>
        <div className="mt-1 text-sm font-medium text-gray-900">
            = {getProbabilityResultText(probability)}
        </div>
    </div>
);

export default ProbabilityDisplay;
