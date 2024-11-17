import { useState } from 'react';
import { calculateRiskWithSteps } from '../../../utils/riskCalculations.js';
import { MODEL_TYPE } from '../../../constants/modelTypes.js';

export const useRetinalCalculator = () => {
    // State management with new defaults
    const [age, setAge] = useState('50');  // Default age 50
    const [pvrGrade, setPvrGrade] = useState('none');
    const [vitrectomyGauge, setVitrectomyGauge] = useState('25g');
    const [selectedHours, setSelectedHours] = useState([]);
    const [detachmentSegments, setDetachmentSegments] = useState([]);
    const [hoveredHour, setHoveredHour] = useState(null);
    const [showMath, setShowMath] = useState(false);
    const [calculatedRisks, setCalculatedRisks] = useState(null);
    const [cryotherapy, setCryotherapy] = useState('yes');  // Default to cryotherapy used
    const [tamponade, setTamponade] = useState('c2f6');  // Default to C2F6 gas

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

        const inputs = {
            age,
            pvrGrade,
            vitrectomyGauge,
            selectedHours,
            detachmentSegments,
            cryotherapy,
            tamponade
        };

        // Calculate both model results
        const fullRisk = calculateRiskWithSteps({
            ...inputs,
            modelType: MODEL_TYPE.FULL
        });

        const significantRisk = calculateRiskWithSteps({
            ...inputs,
            modelType: MODEL_TYPE.SIGNIFICANT
        });

        setCalculatedRisks({
            full: fullRisk,
            significant: significantRisk
        });
    };

    const handleReset = () => {
        setAge('50');  // Reset to default age 50
        setPvrGrade('none');
        setVitrectomyGauge('25g');
        setSelectedHours([]);
        setDetachmentSegments([]);
        setCryotherapy('yes');  // Reset to default cryotherapy used
        setTamponade('c2f6');  // Reset to default C2F6 gas
        setCalculatedRisks(null);
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
        calculatedRisks,
        isCalculateDisabled,
        cryotherapy,
        tamponade,

        // Setters
        setAge,
        setPvrGrade,
        setVitrectomyGauge,
        setDetachmentSegments,
        setShowMath,
        setCryotherapy,
        setTamponade,

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
