/**
 * Risk calculation functions based on the BEAVRS database study
 */

import { PAPER_COEFFICIENTS } from '../constants/paperCoefficients.js';
import { ClockHourNotation } from '../components/clock/utils/clockHourNotation.js';
import { MODEL_TYPE } from '../constants/modelTypes.js';
import { isSignificant } from '../constants/paperCoefficients.js';

/**
 * Get age group category for risk calculation
 * @param {string} age - Patient age
 * @returns {string} Age group category
 */
export function getAgeGroup(age) {
    const ageNum = parseInt(age);
    if (ageNum < 45) return "<45";
    if (ageNum < 65) return "45-64";
    if (ageNum < 80) return "65-79";
    if (ageNum >= 80) return "80+";
    return "45-64"; // Default to reference category
}

/**
 * Get break location category for risk calculation
 * @param {number[]} selectedHours - Array of selected break hours
 * @returns {string} Break location category
 */
export function getBreakLocation(selectedHours) {
    if (!selectedHours || selectedHours.length === 0) return "none";

    // Check for breaks in 5-7 range (highest priority)
    if (selectedHours.some(h => h >= 5 && h <= 7)) return "5-7";

    // Check for breaks at 4 or 8
    if (selectedHours.some(h => h === 4 || h === 8)) return "4-8";

    // Default to 9-3 location
    return "9-3";
}

/**
 * Check if detachment is total (23 or more segments)
 * @param {Array<string|number>} segments - Array of segment IDs or numbers
 * @returns {string} "yes" if total detachment, "no" otherwise
 */
export function isTotalRD(segments) {
    if (!segments || segments.length === 0) return "no";
    // Consider it total detachment if 23 or more segments are marked
    return segments.length >= 23 ? "yes" : "no";
}

/**
 * Get inferior detachment category based on number of inferior hours affected
 * @param {Array<string|number>} segments - Array of segment IDs or numbers
 * @returns {string} Inferior detachment category
 */
export function getInferiorDetachment(segments) {
    if (!segments || segments.length === 0) return "less_than_3";

    // Convert segment IDs to numbers
    const segmentNums = segments.map(segment => {
        return typeof segment === 'string' ? 
            parseInt(segment.replace('segment', ''), 10) : segment;
    });

    // Count inferior hours (3-9)
    const inferiorHours = [3, 4, 5, 6, 7, 8, 9];
    const inferiorCount = inferiorHours.filter(hour => 
        ClockHourNotation.segmentsTouchHour(segmentNums, hour)
    ).length;

    if (inferiorCount >= 6) return "6_hours";
    if (inferiorCount >= 3) return "3_to_5";
    return "less_than_3";
}

/**
 * Get PVR grade category for risk calculation
 * @param {string} pvrGrade - PVR grade
 * @returns {string} PVR grade category
 */
export function getPVRGrade(pvrGrade) {
    return pvrGrade === 'C' ? 'C' : 'none';
}

/**
 * Validate calculation input parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with isValid and errors array
 */
export function validateCalculationInputs(params) {
    const errors = [];
    const { age, pvrGrade, vitrectomyGauge, selectedHours, detachmentSegments, cryotherapy, tamponade } = params;

    // Validate age
    if (age === undefined || age === null || age === '') {
        errors.push('Age is required');
    } else {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
            errors.push('Age must be a number between 0 and 120');
        }
    }

    // Validate PVR grade
    const validPvrGrades = ['none', 'C', 'D'];
    if (pvrGrade && !validPvrGrades.includes(pvrGrade)) {
        errors.push(`PVR grade must be one of: ${validPvrGrades.join(', ')}`);
    }

    // Validate vitrectomy gauge
    const validGauges = ['20g', '23g', '25g', '27g'];
    if (vitrectomyGauge && !validGauges.includes(vitrectomyGauge)) {
        errors.push(`Vitrectomy gauge must be one of: ${validGauges.join(', ')}`);
    }

    // Validate selectedHours
    if (selectedHours && !Array.isArray(selectedHours)) {
        errors.push('Selected hours must be an array');
    } else if (selectedHours) {
        const invalidHours = selectedHours.filter(h => h < 1 || h > 12 || !Number.isInteger(h));
        if (invalidHours.length > 0) {
            errors.push('All selected hours must be integers between 1 and 12');
        }
    }

    // Validate detachmentSegments
    if (detachmentSegments && !Array.isArray(detachmentSegments)) {
        errors.push('Detachment segments must be an array');
    }

    // Validate cryotherapy
    const validCryotherapy = ['yes', 'no'];
    if (cryotherapy && !validCryotherapy.includes(cryotherapy)) {
        errors.push(`Cryotherapy must be one of: ${validCryotherapy.join(', ')}`);
    }

    // Validate tamponade
    const validTamponade = ['none', 'air', 'sf6', 'c2f6', 'c3f8', 'light_oil', 'heavy_oil'];
    if (tamponade && !validTamponade.includes(tamponade)) {
        errors.push(`Tamponade must be one of: ${validTamponade.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Calculate risk with detailed steps
 * @param {Object} params - Risk calculation parameters
 * @returns {Object} Risk calculation results with steps or error
 */
export function calculateRiskWithSteps({
    age,
    pvrGrade,
    vitrectomyGauge,
    selectedHours = [],
    detachmentSegments = [],
    cryotherapy = 'no',
    tamponade = 'sf6',
    modelType = MODEL_TYPE.FULL
}) {
    try {
        // Validate inputs
        const validation = validateCalculationInputs({
            age, pvrGrade, vitrectomyGauge, selectedHours,
            detachmentSegments, cryotherapy, tamponade
        });

        if (!validation.isValid) {
            return {
                error: true,
                message: 'Invalid input parameters',
                errors: validation.errors,
                probability: null,
                steps: [],
                logit: null
            };
        }

        const steps = [];
    let logit = PAPER_COEFFICIENTS.constant;
    steps.push({ step: 'Constant', value: PAPER_COEFFICIENTS.constant });

    // Helper function to add coefficient if it should be included
    const addCoefficient = (category, value, label) => {
        const coeff = PAPER_COEFFICIENTS[category][value] || 0;
        const isSignificantCoeff = isSignificant(category, value);

        if (modelType === MODEL_TYPE.SIGNIFICANT && !isSignificantCoeff) {
            steps.push({ 
                step: label, 
                value: coeff, 
                category: value,
                excluded: true,
                debug: `Category: ${category}, Value: ${value}, Significant: ${isSignificantCoeff}`
            });
            return 0;
        } else {
            steps.push({ 
                step: label, 
                value: coeff, 
                category: value,
                debug: `Category: ${category}, Value: ${value}, Significant: ${isSignificantCoeff}`
            });
            return coeff;
        }
    };

    // Age group
    const ageGroup = getAgeGroup(age);
    logit += addCoefficient('age', ageGroup, 'Age group');

    // Break location
    const breakLocation = getBreakLocation(selectedHours);
    logit += addCoefficient('breakLocation', breakLocation, 'Break location');

    // Inferior detachment
    const inferiorDetachment = getInferiorDetachment(detachmentSegments);
    logit += addCoefficient('inferiorDetachment', inferiorDetachment, 'Inferior detachment');

    // Total RD
    const isTotal = isTotalRD(detachmentSegments);
    logit += addCoefficient('totalDetachment', isTotal, 'Total RD');

    // PVR grade
    const pvrCategory = getPVRGrade(pvrGrade);
    logit += addCoefficient('pvrGrade', pvrCategory, 'PVR grade');

    // Vitrectomy gauge
    logit += addCoefficient('vitrectomyGauge', vitrectomyGauge, 'Vitrectomy gauge');

    // Cryotherapy
    logit += addCoefficient('cryotherapy', cryotherapy, 'Cryotherapy');

    // Tamponade
    logit += addCoefficient('tamponade', tamponade, 'Tamponade');

    // Calculate probability
    const probability = 100 / (1 + Math.exp(-logit));

    // Validate the result
    if (isNaN(probability) || !isFinite(probability)) {
        throw new Error('Calculation resulted in invalid probability value');
    }

    return {
        probability,
        steps,
        logit,
        age: ageGroup,
        pvrGrade: pvrCategory,
        vitrectomyGauge,
        cryotherapy,
        tamponade,
        error: false
    };
    } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Risk calculation error:', error);
        }

        return {
            error: true,
            message: error.message || 'An unexpected error occurred during calculation',
            probability: null,
            steps: [],
            logit: null
        };
    }
}
