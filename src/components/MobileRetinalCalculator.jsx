import React, { useState } from 'react';
import ClockFace from './clock/ClockFace.jsx';
import RiskInputForm from './RiskInputForm.jsx';
import RiskResults from './RiskResults.jsx';
import { useRetinalCalculator } from './clock/hooks/useRetinalCalculator.js';
import { formatDetachmentHours } from './clock/utils/formatDetachmentHours.js';

const MobileRetinalCalculator = () => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const calculator = useRetinalCalculator();

    const formProps = {
        age: calculator.age,
        setAge: calculator.setAge,
        pvrGrade: calculator.pvrGrade,
        setPvrGrade: calculator.setPvrGrade,
        vitrectomyGauge: calculator.vitrectomyGauge,
        setVitrectomyGauge: calculator.setVitrectomyGauge,
        cryotherapy: calculator.cryotherapy,
        setCryotherapy: calculator.setCryotherapy,
        tamponade: calculator.tamponade,
        setTamponade: calculator.setTamponade
    };

    return (
        <div className="space-y-1">
            {!calculator.calculatedRisks && (
                <>
                    <RiskInputForm
                        {...formProps}
                        isMobile={true}
                    />
                    <ClockFace
                        selectedHours={calculator.selectedHours}
                        detachmentSegments={calculator.detachmentSegments}
                        hoveredHour={calculator.hoveredHour}
                        onHoverChange={calculator.handleHoverChange}
                        onTearToggle={calculator.handleTearToggle}
                        onSegmentToggle={calculator.handleSegmentToggle}
                        setDetachmentSegments={calculator.setDetachmentSegments}
                        onTouchDeviceChange={setIsTouchDevice}
                        readOnly={false}
                        isMobile={true}
                    />

                    {/* Calculate Button */}
                    <div className="mt-1">
                        <button
                            data-testid="calculate-button"
                            onClick={calculator.handleCalculate}
                            disabled={calculator.isCalculateDisabled}
                            className={`w-full py-2 px-4 rounded text-white font-medium
                                ${calculator.isCalculateDisabled
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Calculate Risk
                        </button>
                        {calculator.isCalculateDisabled && (
                            <p className="mt-1 text-sm text-red-600 text-center">
                                {!calculator.age && !calculator.detachmentSegments.length && "Age and detachment area required"}
                                {!calculator.age && calculator.detachmentSegments.length > 0 && "Age required"}
                                {calculator.age && !calculator.detachmentSegments.length && "Detachment area required"}
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* Results with Summary */}
            {calculator.calculatedRisks && (
                <div className="space-y-2">
                    <RiskResults
                        fullModelRisk={calculator.calculatedRisks.full}
                        significantModelRisk={calculator.calculatedRisks.significant}
                        showMath={calculator.showMath}
                        setShowMath={calculator.setShowMath}
                        onReset={calculator.handleReset}
                        isMobile={true}
                    />

                    <div className="mt-2 border-t pt-2">
                        <h3 className="text-lg font-semibold mb-1">Input Summary</h3>
                        <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Age:</span> {calculator.age} years</p>
                            <p className="text-sm"><span className="font-medium">PVR Grade:</span> {calculator.formatPVRGrade(calculator.pvrGrade)}</p>
                            <p className="text-sm"><span className="font-medium">Vitrectomy Gauge:</span> {calculator.vitrectomyGauge}</p>
                            <p className="text-sm"><span className="font-medium">Cryotherapy:</span> {calculator.cryotherapy}</p>
                            <p className="text-sm"><span className="font-medium">Tamponade:</span> {calculator.formatTamponade(calculator.tamponade)}</p>
                            <p className="text-sm"><span className="font-medium">Breaks:</span> {calculator.formatHoursList(calculator.selectedHours)}</p>
                            <div className="pt-1">
                                <button
                                    onClick={calculator.handleReset}
                                    className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded"
                                >
                                    Reset Calculator
                                </button>
                            </div>
                        </div>
                        <div className="w-full max-w-xs mx-auto mt-1">
                            <ClockFace
                                selectedHours={calculator.selectedHours}
                                detachmentSegments={calculator.detachmentSegments}
                                hoveredHour={calculator.hoveredHour}
                                onHoverChange={() => { }}
                                onTearToggle={() => { }}
                                onSegmentToggle={() => { }}
                                readOnly={true}
                                isMobile={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileRetinalCalculator;
