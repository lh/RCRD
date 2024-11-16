import { useState } from 'react';
import { calculateRiskWithSteps } from '../../../utils/riskCalculations.js';

export const useRetinalCalculator = () => {
    // State management with defaults
    const [age, setAge] = useState('');
    const [pvrGrade, setPvrGrade] = useState('none');
    const [vitrectomyGauge, setVitrectomyGauge] = useState('25g');
    const [selectedHours, setSelectedHours] = useState([]);
    const [detachmentSegments, setDetachmentSegments] = useState([]);
    const [hoveredHour, setHoveredHour] = useState(null);
    const [showMath, setShowMath] = useState(false);
    const [calculatedRisk, setCalculatedRisk] = useState(null);

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
        setPvrGrade('none');
        setVitrectomyGauge('25g');
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

    const formatPVRGrade = (grade) => {
        return grade === 'none' ? 'A' : grade.toUpperCase();
    };

    return {
        // State
        age,
        pvrGrade,
        vitrectomyGauge,
        selectedHours,
        detachmentSegments,
        hoveredHour,
        showMath,
        calculatedRisk,
        isCalculateDisabled,

        // Setters
        setAge,
        setPvrGrade,
        setVitrectomyGauge,
        setDetachmentSegments,
        setShowMath,

        // Handlers
        handleHoverChange,
        handleTearToggle,
        handleSegmentToggle,
        handleCalculate,
        handleReset,

        // Formatters
        formatHoursList,
        formatPVRGrade
    };
};
