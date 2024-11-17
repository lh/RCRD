import React from 'react';

/**
 * CryotherapySelection component for selecting cryotherapy status
 * Shows options from Table 2 of the paper
 */
const CryotherapySelection = ({ 
    value, 
    onChange,
    disabled = false,
    className = ''
}) => {
    const options = [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' }
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    id="cryotherapy-group-label"
                >
                    Cryotherapy
                </label>
                <div 
                    className="space-y-2"
                    role="radiogroup"
                    aria-labelledby="cryotherapy-group-label"
                    aria-required="true"
                >
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                            <input
                                id={`cryo-${option.value}`}
                                name="cryotherapy"
                                type="radio"
                                value={option.value}
                                checked={value === option.value}
                                onChange={(e) => onChange(e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                disabled={disabled}
                            />
                            <label
                                htmlFor={`cryo-${option.value}`}
                                className="ml-3 block text-sm text-gray-700"
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

export default CryotherapySelection;
