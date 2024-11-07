import React from 'react';
import { pvrOptions, gaugeOptions } from '../constants/riskCalculatorConstants.js';

const RiskInputForm = ({ 
    position,
    age,
    setAge,
    pvrGrade,
    setPvrGrade,
    vitrectomyGauge,
    setVitrectomyGauge,
    isMobile = false
}) => {
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission
    };

    const renderAgeInput = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Age (years)
            </label>
            <input
                type="number"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${!age ? 'bg-red-50 border-red-300' : 'border-gray-300'}`}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                max="120"
                placeholder="Enter age"
                required
            />
            {!age && (
                <p className="text-sm text-red-600">Age is required</p>
            )}
        </div>
    );

    const renderPVRGrade = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">PVR Grade</label>
            <div className="space-y-2">
                {pvrOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id={`pvr-${option.value}${isMobile ? '-mobile' : ''}`}
                            name={`pvr${isMobile ? '-mobile' : ''}`}
                            value={option.value}
                            checked={pvrGrade === option.value}
                            onChange={(e) => setPvrGrade(e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label 
                            htmlFor={`pvr-${option.value}${isMobile ? '-mobile' : ''}`} 
                            className="text-sm text-gray-700"
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderVitrectomyGauge = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Vitrectomy Gauge</label>
            <div className="space-y-2">
                {gaugeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id={`gauge-${option.value}${isMobile ? '-mobile' : ''}`}
                            name={`gauge${isMobile ? '-mobile' : ''}`}
                            value={option.value}
                            checked={vitrectomyGauge === option.value}
                            onChange={(e) => setVitrectomyGauge(e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label 
                            htmlFor={`gauge-${option.value}${isMobile ? '-mobile' : ''}`}
                            className="text-sm text-gray-700"
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {renderAgeInput()}
                    {renderPVRGrade()}
                </div>
                <div className="space-y-4">
                    {renderVitrectomyGauge()}
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-4">
            {position === "left" && (
                <>
                    {renderAgeInput()}
                    {renderPVRGrade()}
                </>
            )}
            {position === "right" && renderVitrectomyGauge()}
        </div>
    );
};

export default RiskInputForm;
