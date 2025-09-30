import React from 'react';

/**
 * Component to display confidence intervals for risk calculations
 * This is a demo component showing how to integrate CI display
 */
const ConfidenceIntervalDisplay = ({ confidenceIntervals, probability }) => {
    if (!confidenceIntervals) {
        return null;
    }

    const { formatted, probability: probCI } = confidenceIntervals;

    return (
        <div className="confidence-intervals bg-blue-50 p-4 rounded-lg mt-4">
            <h4 className="font-medium text-gray-700 mb-3">Statistical Confidence</h4>
            
            {/* Main display with formatted CI */}
            <div className="text-lg font-semibold text-blue-900 mb-3">
                {formatted.probability95}
            </div>
            
            {/* Visual range indicator */}
            <div className="ci-visual mb-3">
                <div className="relative h-8 bg-gray-200 rounded">
                    <div 
                        className="absolute h-full bg-blue-400 rounded opacity-50"
                        style={{
                            left: `${probCI.lower}%`,
                            width: `${probCI.upper - probCI.lower}%`,
                            maxWidth: `${100 - probCI.lower}%`
                        }}
                    />
                    <div 
                        className="absolute h-full w-1 bg-blue-900"
                        style={{ left: `${probability}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>
            
            {/* Additional details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-600">Range: </span>
                    <span className="font-medium">{formatted.probabilityRange}</span>
                </div>
                <div>
                    <span className="text-gray-600">Margin: </span>
                    <span className="font-medium">{formatted.marginOfError}</span>
                </div>
            </div>
            
            {/* Explanation */}
            <p className="text-xs text-gray-500 mt-3">
                95% confidence interval: We are 95% confident that the true risk 
                of requiring additional surgery lies within this range.
            </p>
        </div>
    );
};

export default ConfidenceIntervalDisplay;