import React from 'react';
import Toggle from './Toggle';
import { MODEL_TYPE, MODEL_DESCRIPTIONS, MODEL_EXPLANATIONS } from '../constants/modelTypes';

const ModelToggle = ({ modelType, onChange, isMobile = false }) => {
    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                {!isMobile && <h3 className="text-lg font-medium">Risk Model Selection</h3>}
                <Toggle
                    checked={modelType === MODEL_TYPE.FULL}
                    onChange={(checked) => onChange(checked ? MODEL_TYPE.FULL : MODEL_TYPE.SIGNIFICANT)}
                    labels={{
                        checked: 'Full Model',
                        unchecked: 'Significant Only'
                    }}
                />
            </div>
            
            <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">
                    {MODEL_DESCRIPTIONS[modelType]}
                </p>
                <p className="whitespace-pre-line">
                    {MODEL_EXPLANATIONS[modelType]}
                </p>
            </div>
        </div>
    );
};

export default ModelToggle;
