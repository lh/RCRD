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
    return (
        <div className={`${isMobile ? 'space-y-1' : 'space-y-4'} ${className}`}>
            <div>
                <label 
                    htmlFor="gauge-select"
                    className="block text-sm font-medium text-gray-700"
                >
                    Vitrectomy Gauge
                </label>
                <select 
                    id="gauge-select"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isMobile ? 'mt-0.5' : 'mt-1'}`}
                    disabled={disabled}
                    aria-required="true"
                >
                    <option value="">Select gauge...</option>
                    <option value="20g">20 gauge</option>
                    <option value="23g">23 gauge</option>
                    <option value="25g">25 gauge</option>
                    <option value="27g">27 gauge</option>
                    <option value="not_recorded">Not recorded</option>
                </select>
            </div>
        </div>
    );
};

export default GaugeSelection;
