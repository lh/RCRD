import React from 'react';
import { pvrOptions } from '../constants/riskCalculatorConstants.js';
import GaugeSelection from './GaugeSelection.jsx';
import TamponadeSelection from './TamponadeSelection.jsx';
import CryotherapySelection from './CryotherapySelection.jsx';

const RiskInputForm = ({ 
    position,
    age,
    setAge,
    pvrGrade,
    setPvrGrade,
    vitrectomyGauge,
    setVitrectomyGauge,
    cryotherapy,
    setCryotherapy,
    tamponade,
    setTamponade,
    isMobile = false,
    onReset = null,
    disabled = false
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        return false;
    };

    const isAgeValid = (value) => {
        if (!value && value !== 0) {
            return false;
        }
        const numValue = parseInt(value, 10);
        const isValid = !isNaN(numValue) && numValue >= 18 && numValue <= 100;
        return isValid;
    };

    const handleAgeChange = (e) => {
        const newValue = e.target.value;
        setAge(newValue);
    };

    const renderAgeInput = () => (
        <div>
            <label 
                htmlFor="age-input"
                className="block text-sm font-medium text-gray-700"
            >
                Age (years)
            </label>
            <input
                id="age-input"
                type="number"
                className={`w-full ${isMobile ? 'p-1' : 'p-2'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${!isAgeValid(age) ? 'bg-red-50 border-red-300' : 'border-gray-300'}`}
                value={age}
                onChange={handleAgeChange}
                min="18"
                max="100"
                placeholder="Enter age"
                required
                role="spinbutton"
                aria-label="Age (years)"
                aria-required="true"
                aria-valuemin="18"
                aria-valuemax="100"
                aria-invalid={!isAgeValid(age)}
                disabled={disabled}
            />
            {!isAgeValid(age) && (
                <p className="mt-1 text-sm text-red-600">
                    Age must be between 18 and 100
                </p>
            )}
        </div>
    );

    const renderPVRGrade = () => (
        <div className={isMobile ? 'mt-2' : 'mt-4'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                PVR Grade
            </label>
            <div className="space-y-1" role="radiogroup" aria-required="true">
                {pvrOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                        <input
                            type="radio"
                            id={`pvr-${option.value}`}
                            name="pvr-grade"
                            value={option.value}
                            checked={pvrGrade === option.value}
                            onChange={(e) => setPvrGrade(e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={disabled}
                        />
                        <label
                            htmlFor={`pvr-${option.value}`}
                            className="ml-2 block text-sm text-gray-700"
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
            <form onSubmit={handleSubmit} onReset={onReset} className="space-y-1">
                <div className="space-y-1">
                    {renderAgeInput()}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="col-span-1">
                        <GaugeSelection
                            value={vitrectomyGauge}
                            onChange={setVitrectomyGauge}
                            disabled={disabled}
                            isMobile={isMobile}
                        />
                    </div>
                    <div className="col-span-1">
                        <TamponadeSelection
                            value={tamponade}
                            onChange={setTamponade}
                            disabled={disabled}
                            isMobile={isMobile}
                        />
                    </div>
                    <div className="col-span-1">
                        {renderPVRGrade()}
                    </div>
                    <div className="col-span-1">
                        <CryotherapySelection
                            value={cryotherapy}
                            onChange={setCryotherapy}
                            disabled={disabled}
                            isMobile={isMobile}
                        />
                    </div>
                </div>
            </form>
        );
    }

    // Desktop layout - split between left and right panels
    if (position === "left") {
        return (
            <div className="space-y-4">
                {renderAgeInput()}
                {renderPVRGrade()}
                <div className="mt-4">
                    <GaugeSelection
                        value={vitrectomyGauge}
                        onChange={setVitrectomyGauge}
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    if (position === "right") {
        return (
            <div className="space-y-4">
                <CryotherapySelection
                    value={cryotherapy}
                    onChange={setCryotherapy}
                    disabled={disabled}
                />
                <div className="mt-4">
                    <TamponadeSelection
                        value={tamponade}
                        onChange={setTamponade}
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default RiskInputForm;
