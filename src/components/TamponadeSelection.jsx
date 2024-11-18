import React from 'react';

/**
 * TamponadeSelection component for selecting tamponade type
 * Shows all options from Table 2 of the paper
 */
const TamponadeSelection = ({ 
    value, 
    onChange,
    disabled = false,
    className = '',
    isMobile = false
}) => {
    const options = [
        { value: 'sf6', label: 'SF6 gas' },
        { value: 'c2f6', label: 'C2F6 gas' },
        { value: 'c3f8', label: 'C3F8 gas' },
        { value: 'air', label: 'Air' },
        { value: 'light_oil', label: 'Light silicone oil' },
        { value: 'heavy_oil', label: 'Heavy silicone oil' }
    ];

    return (
        <div className={`${isMobile ? 'space-y-1' : 'space-y-4'} ${className}`}>
            <div>
                <label 
                    className={`block text-sm font-medium text-gray-700 ${isMobile ? 'mb-0.5' : 'mb-1'}`}
                    id="tamponade-group-label"
                >
                    Tamponade
                </label>
                <div 
                    className={`${isMobile ? 'space-y-0.5' : 'space-y-1'}`}
                    role="radiogroup"
                    aria-labelledby="tamponade-group-label"
                    aria-required="true"
                >
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                            <input
                                id={`tamponade-${option.value}`}
                                name="tamponade"
                                type="radio"
                                value={option.value}
                                checked={value === option.value}
                                onChange={(e) => onChange(e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                disabled={disabled}
                            />
                            <label
                                htmlFor={`tamponade-${option.value}`}
                                className="ml-2 block text-sm text-gray-700"
                            >
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TamponadeSelection;
