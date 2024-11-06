import React, { useState } from 'react';
import ClockFace from './clock/ClockFace';
import RiskInputForm from './RiskInputForm';
import RiskResults from './RiskResults';
import { calculateRiskWithSteps } from '../utils/riskCalculations';
import { formatDetachmentHours } from './clock/utils/formatDetachmentHours';


const RetinalCalculator = () => {
    // State management with defaults
    const [age, setAge] = useState('');
    const [pvrGrade, setPvrGrade] = useState('none');  // default to "No PVR"
    const [vitrectomyGauge, setVitrectomyGauge] = useState('25g');  // default to "25 gauge"
    const [selectedHours, setSelectedHours] = useState([]);
    const [detachmentSegments, setDetachmentSegments] = useState([]);
    const [hoveredHour, setHoveredHour] = useState(null);
    const [showMath, setShowMath] = useState(false);
    const [calculatedRisk, setCalculatedRisk] = useState(null);

    // Common props for RiskInputForm
    const formProps = {
        age,
        setAge,
        pvrGrade,
        setPvrGrade,
        vitrectomyGauge,
        setVitrectomyGauge
    };

    const handleHoverChange = (hour) => {
        setHoveredHour(hour);
    };

    const handleTearToggle = (hour) => {
        const newSelection = selectedHours.includes(hour)
            ? selectedHours.filter(h => h !== hour)
            : [...selectedHours, hour];
        setSelectedHours(newSelection);
    };

    const handleSegmentToggle = (segment) => {
        const newDetachment = detachmentSegments.includes(segment)
            ? detachmentSegments.filter(s => s !== segment)
            : [...detachmentSegments, segment];
        setDetachmentSegments(newDetachment);
    };

    const handleCalculate = () => {
        if (!age || detachmentSegments.length === 0) return;
        
        const risk = calculateRiskWithSteps({
            age,
            pvrGrade,
            vitrectomyGauge,
            selectedHours,
            detachmentSegments
        });
        setCalculatedRisk(risk);
    };

    const handleReset = () => {
        setAge('');
        setPvrGrade('none'); // Reset to "No PVR"
        setVitrectomyGauge('25g'); // Reset to "25 gauge"
        setSelectedHours([]);
        setDetachmentSegments([]);
        setCalculatedRisk(null);
        setShowMath(false);
    };

    const isCalculateDisabled = !age || detachmentSegments.length === 0;

    const formatHoursList = (hours) => {
        if (hours.length === 0) return 'None';
        return hours.sort((a, b) => a - b).join(', ') + " o'clock";
    };

    // Helper function to convert segment to clock hour
    const segmentToHour = (segment) => {
        const hour = Math.floor(segment / 5) % 12;
        return hour === 0 ? 12 : hour;
    };


 


    // Helper to format PVR grade display
    const formatPVRGrade = (grade) => {
        return grade === 'none' ? 'A' : grade.toUpperCase();
    };

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">Retinal Detachment Risk Calculator</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Based on the UK BEAVRS database study of retinal detachment outcomes
                    </p>

                    <div className="space-y-6">
                        {/* Input Form */}
                        {!calculatedRisk && (
                            <>
                                {/* Mobile Layout */}
                                <div className="md:hidden space-y-4">
                                    <RiskInputForm
                                        {...formProps}
                                        isMobile={true}
                                    />
                                    <ClockFace
                                        selectedHours={selectedHours}
                                        detachmentSegments={detachmentSegments}
                                        hoveredHour={hoveredHour}
                                        onHoverChange={handleHoverChange}
                                        onTearToggle={handleTearToggle}
                                        onSegmentToggle={handleSegmentToggle}
                                    />
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-700">Current Selection:</h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedHours.length > 0 ? `Breaks at: ${selectedHours.join(', ')}` : 'No breaks marked'}
                                        </p>
                                        <p className={`text-sm ${detachmentSegments.length === 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                            {detachmentSegments.length > 0 
                                                ? `Detachment segments: ${detachmentSegments.length}` 
                                                : 'Detachment area required'}
                                        </p>
                                    </div>
                                </div>

                                {/* Desktop/Landscape Layout */}
                                <div className="hidden md:flex gap-4">
                                    <div className="w-1/4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <RiskInputForm
                                                {...formProps}
                                                position="left"
                                            />
                                            <div className="mt-4">
                                                <h3 className="text-sm font-medium text-gray-700">Current Selection:</h3>
                                                <p className="text-sm text-gray-600">
                                                    {selectedHours.length > 0 ? `Breaks at: ${selectedHours.join(', ')}` : 'No breaks marked'}
                                                </p>
                                                <p className={`text-sm ${detachmentSegments.length === 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                    {detachmentSegments.length > 0 
                                                        ? `Detachment segments: ${detachmentSegments.length}` 
                                                        : 'Detachment area required'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-2/4">
                                        <ClockFace
                                            selectedHours={selectedHours}
                                            detachmentSegments={detachmentSegments}
                                            hoveredHour={hoveredHour}
                                            onHoverChange={handleHoverChange}
                                            onTearToggle={handleTearToggle}
                                            onSegmentToggle={handleSegmentToggle}
                                        />
                                    </div>
                                    <div className="w-1/4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <RiskInputForm
                                                {...formProps}
                                                position="right"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Calculate Button */}
                                <div className="mt-4">
                                    <button
                                        onClick={handleCalculate}
                                        disabled={isCalculateDisabled}
                                        className={`w-full py-2 px-4 rounded-md text-white font-medium
                                            ${isCalculateDisabled
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        Calculate Risk
                                    </button>
                                    {isCalculateDisabled && (
                                        <p className="mt-2 text-sm text-red-600 text-center">
                                            {!age && !detachmentSegments.length && "Age and detachment area required"}
                                            {!age && detachmentSegments.length > 0 && "Age required"}
                                            {age && !detachmentSegments.length && "Detachment area required"}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Results with Summary */}
                        {calculatedRisk && (
                            <div className="space-y-6">
                                <RiskResults
                                    risk={calculatedRisk}
                                    showMath={showMath}
                                    setShowMath={setShowMath}
                                    onReset={handleReset}
                                />
                                
                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Input Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-sm"><span className="font-medium">Age:</span> {age} years</p>
                                            <p className="text-sm"><span className="font-medium">PVR Grade:</span> {formatPVRGrade(pvrGrade)}</p>
                                            <p className="text-sm"><span className="font-medium">Vitrectomy Gauge:</span> {vitrectomyGauge}</p>
                                            <p className="text-sm"><span className="font-medium">Breaks:</span> {formatHoursList(selectedHours)}</p>
                                            <p className="text-sm"><span className="font-medium">Detachment:</span> {formatDetachmentHours(detachmentSegments)}</p>
                                            <div className="pt-4">
                                                <button
                                                    onClick={handleReset}
                                                    className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md"
                                                >
                                                    Reset Calculator
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-full max-w-xs mx-auto">
                                            <ClockFace
                                                selectedHours={selectedHours}
                                                detachmentSegments={detachmentSegments}
                                                hoveredHour={hoveredHour}
                                                onHoverChange={() => {}}
                                                onTearToggle={() => {}}
                                                onSegmentToggle={() => {}}
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetinalCalculator;