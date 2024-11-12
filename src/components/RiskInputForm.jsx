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

    const isAgeValid = (value) => {
        console.log('isAgeValid called with:', value, 'type:', typeof value);
        if (!value && value !== 0) {
            console.log('-> value is empty');
            return false;
        }
        const numValue = parseInt(value, 10);
        console.log('-> parsed value:', numValue);
        const isValid = !isNaN(numValue) && numValue >= 18 && numValue <= 100;
        console.log('-> isValid:', isValid);
        return isValid;
    };

    const handleAgeChange = (e) => {
        const newValue = e.target.value;
        console.log('handleAgeChange:', newValue);
        console.log('-> before setAge, current age:', age);
        setAge(newValue);
        console.log('-> after setAge');
    };

    const renderAgeInput = () => {
        console.log('renderAgeInput, age:', age);
        const valid = isAgeValid(age);
        console.log('-> valid:', valid);
        
        return (
            <div className="space-y-2">
                <label 
                    htmlFor={`age-input${isMobile ? '-mobile' : ''}`}
                    className="block text-sm font-medium text-gray-700"
                    data-testid="age-label"
                >
                    Age (years)
                </label>
                <input
                    id={`age-input${isMobile ? '-mobile' : ''}`}
                    type="number"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${!valid ? 'bg-red-50 border-red-300' : 'border-gray-300'}`}
                    value={age || ''}
                    onChange={handleAgeChange}
                    min="18"
                    max="100"
                    placeholder="Enter age"
                    required
                    data-testid="age-input"
                    role="spinbutton"
                    aria-required="true"
                    aria-valuemin="18"
                    aria-valuemax="100"
                    aria-invalid={!valid}
                />
                {!age && (
                    <p className="text-sm text-red-600">Age is required</p>
                )}
            </div>
        );
    };

    const renderPVRGrade = () => (
        <div className="space-y-2">
            <div role="radiogroup" aria-required="true" aria-label="PVR Grade">
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
        </div>
    );

    const renderVitrectomyGauge = () => (
        <div className="space-y-2">
            <div role="radiogroup" aria-required="true" aria-label="Vitrectomy Gauge">
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
