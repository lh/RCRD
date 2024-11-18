/**
 * Utility functions for generating risk results text
 */

/**
 * Get explanation text for a calculation step
 * @param {string} step - The step name
 * @param {number} value - The coefficient value
 * @returns {string} The explanation text
 */
export function getStepExplanation(step, value) {
    switch (step) {
        case 'Vitrectomy gauge':
            // Only show 25g coefficient as it was the only one statistically significant (p=0.014)
            if (value === -0.885) return "25g vs 20g (reference): coefficient -0.885 (odds ratio 0.413, p=0.014)";
            return "20g or other: reference category (non-25g coefficients excluded as p>0.05)";
        case 'Age group':
            if (value === 0.236) return "65-79 years vs 45-64 years (reference): coefficient +0.236 (odds ratio 1.266, p=0.005)";
            if (value === 0.498) return "≥80 years vs 45-64 years (reference): coefficient +0.498 (odds ratio 1.645, p=0.001)";
            if (value === 0.459) return "<45 years vs 45-64 years (reference): coefficient +0.459 (odds ratio 1.582, p=0.004)";
            return "45-64 years: reference category";
        case 'Break location':
            if (value === 0.428) return "4 or 8 o'clock vs 9-3 o'clock (reference): coefficient +0.428 (odds ratio 1.534, p=0.002)";
            if (value === 0.607) return "5-7 o'clock vs 9-3 o'clock (reference): coefficient +0.607 (odds ratio 1.835, p<0.001)";
            if (value === 0.676) return "No break vs 9-3 o'clock (reference): coefficient +0.676 (odds ratio 1.966, p=0.242)";
            return "9-3 o'clock: reference category";
        case 'Inferior detachment':
            if (value === 0.441) return "3-5 hours vs <3h (reference): coefficient +0.441 (odds ratio 1.554, p<0.001)";
            if (value === 0.435) return "6+ hours vs <3h (reference): coefficient +0.435 (odds ratio 1.545, p=0.005)";
            return "<3 hours: reference category";
        case 'Total RD':
            if (value === 0.663) return "Total detachment vs not total (reference): coefficient +0.663 (odds ratio 1.941, p<0.001)";
            return "Not total: reference category";
        case 'PVR grade':
            if (value === 0.220) return "Grade C vs None/A/B (reference): coefficient +0.220 (odds ratio 1.246, p<0.001)";
            return "Grade None/A/B: reference category";
        case 'Constant':
            return "Base constant: coefficient -1.611 (p<0.001)";
        default:
            return "";
    }
}

/**
 * Format the probability formula text
 * @param {number} logit - The logit value
 * @returns {string} The formula text
 */
export function getProbabilityFormulaText(logit) {
    const sign = logit >= 0 ? "+" : "";
    return "1 / (1 + e" + sign + logit + ") × 100%";
}

/**
 * Format the probability result text
 * @param {number} probability - The probability value
 * @returns {string} The result text
 */
export function getProbabilityResultText(probability) {
    return Math.round(probability) + "%";
}

/**
 * Get the methodology note text
 * @returns {string} The methodology note text
 */
export function getMethodologyNote() {
    return "Following the BEAVRS study final model (only includes coefficients with p < 0.05)";
}

/**
 * Get the risk summary text
 * @param {number} probability - The probability value
 * @returns {string} The risk summary text
 */
export function getRiskSummaryText(probability) {
    return "Estimated Risk of Failure: " + Math.round(probability) + "%";
}

/**
 * Get the risk summary subtitle text
 * @returns {string} The risk summary subtitle text
 */
export function getRiskSummarySubtitle() {
    return "Based on BEAVRS study final model (only includes coefficients with p < 0.05)";
}
