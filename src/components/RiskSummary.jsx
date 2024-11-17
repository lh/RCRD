import React from 'react';
import { Printer } from 'lucide-react';
import { getRiskSummaryText, getRiskSummarySubtitle } from '../utils/riskResultsText.js';

const RiskSummary = ({ probability, onPrint }) => {
    const summaryText = getRiskSummaryText(probability);
    const subtitleText = getRiskSummarySubtitle();

    return (
        <div className="p-4 bg-gray-50 rounded-lg risk-results">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-lg font-semibold">{summaryText}</p>
                    <p className="text-sm text-gray-600 mt-1">{subtitleText}</p>
                </div>
                <button
                    onClick={onPrint}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 no-print"
                    title="Print or save as PDF"
                >
                    <Printer size={16} />
                    <span>Print/Save</span>
                </button>
            </div>
        </div>
    );
};

export default RiskSummary;
