import React from 'react';

/**
 * GaugeSelection component for selecting vitrectomy gauge
 * Allows selection of all gauges from Table 2 of the paper
 */
const GaugeSelection = ({ 
    value,
    onChange,
    disabled = false,
    className = '',
    isMobile = false
}) => {
    const options = [
        { value: '20g', label: '20 gauge' },
        { value: '23g', label: '23 gauge' },
        { value: '25g', label: '25 gauge' },
        { value: '27g', label: '27 gauge' },
        { value: 'not_recorded', label: 'Not recorded' }
    ];

    return (
        <div className={`${isMobile ? 'space-y-1' : 'space-y-4'} ${className}`}>
            <div>
                <label 
                    className={`block text-sm font-medium text-gray-700 ${isMobile ? 'mb-0.5' : 'mb-1'}`}
                    id="gauge-group-label"
                >
                    Vitrectomy Gauge
                </label>
                <div 
                    className={`${isMobile ? 'space-y-0.5' : 'space-y-1'}`}
                    role="radiogroup"
                    aria-labelledby="gauge-group-label"
                    aria-required="true"
                >
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                            <input
                                id={`gauge-${option.value}`}
                                name="gauge"
                                type="radio"
                                value={option.value}
                                checked={value === option.value}
                                onChange={(e) => onChange(e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                disabled={disabled}
                            />
                            <label
                                htmlFor={`gauge-${option.value}`}
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

export default GaugeSelection;
