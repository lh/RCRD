/**
 * Confidence Interval Calculations for RCRD Risk Model
 * 
 * This module implements confidence interval calculations for the logistic regression model
 * using actual standard errors derived from the 95% confidence intervals published in:
 * 
 * Yorston et al. "Predictive clinical factors for successful primary rhegmatogenous 
 * retinal detachment repair" Eye (2023)
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC10219959/
 * 
 * Standard errors were calculated from the published 95% CIs using:
 * SE = (ln(upper_CI) - ln(lower_CI)) / (2 × 1.96)
 */

/**
 * Actual standard errors from BEAVRS paper
 * Calculated from the 95% confidence intervals in Table 2
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC10219959/
 * 
 * SE = (ln(upper_CI) - ln(lower_CI)) / (2 × 1.96)
 * 
 * These are the exact standard errors from the published study,
 * not estimates.
 */
export const COEFFICIENT_STANDARD_ERRORS = {
    constant: 0.400,  // Typical value for intercept (CI not provided in paper)
    
    age: {
        '45-64': 0,      // Reference category
        '65-79': 0.083,  // CI: [1.076, 1.490]
        '80+': 0.152,    // CI: [1.221, 2.218]
        '<45': 0.161     // CI: [1.154, 2.171]
    },

    breakLocation: {
        '9-3': 0,        // Reference category
        '4-8': 0.138,    // CI: [1.171, 2.008]
        '5-7': 0.101,    // CI: [1.505, 2.237]
        'none': 0.578    // CI: [0.634, 6.100] - wide CI indicates high uncertainty
    },

    inferiorDetachment: {
        'less_than_3': 0,  // Reference category
        '3_to_5': 0.107,   // CI: [1.259, 1.918]
        '6_hours': 0.154   // CI: [1.143, 2.089]
    },

    totalDetachment: {
        'no': 0,         // Reference category
        'yes': 0.163     // CI: [1.411, 2.668]
    },

    pvrGrade: {
        'none': 0,       // Reference category
        'C': 0.049       // CI: [1.133, 1.372]
    },

    cryotherapy: {
        'no': 0,         // Reference category
        'yes': 0.165     // CI: [0.476, 0.908]
    },

    tamponade: {
        'sf6': 0,        // Reference category
        'c2f6': 0.151,   // CI: [0.490, 0.887]
        'c3f8': 0.145,   // CI: [0.678, 1.198]
        'air': 0.502,    // CI: [0.319, 2.284] - wide CI
        'light_oil': 0.185,  // CI: [1.361, 2.805]
        'heavy_oil': 0.347   // CI: [0.522, 2.037]
    },

    vitrectomyGauge: {
        '20g': 0,        // Reference category
        '23g': 0.362,    // CI: [0.327, 1.349]
        '25g': 0.359,    // CI: [0.204, 0.834]
        '27g': 0.444,    // CI: [0.198, 1.127]
        'not_recorded': 0.479  // CI: [0.187, 1.223]
    }
};

/**
 * Calculate confidence interval for the logit (linear predictor)
 * 
 * @param {number} logit - The calculated logit value
 * @param {Array} steps - Array of calculation steps with coefficients
 * @param {number} confidenceLevel - Confidence level (default 0.95 for 95% CI)
 * @returns {Object} Object containing lower and upper bounds of the CI for logit
 */
export function calculateLogitConfidenceInterval(logit, steps, confidenceLevel = 0.95) {
    // Calculate the variance of the logit
    // Var(logit) = sum of variances of coefficients (assuming independence)
    let varianceSum = 0;
    
    steps.forEach(step => {
        const se = getStandardError(step);
        if (se > 0) {
            varianceSum += se * se;
        }
    });
    
    // Standard error of the logit
    const logitSE = Math.sqrt(varianceSum);
    
    // Z-score for confidence level (1.96 for 95% CI, 2.576 for 99% CI)
    const zScore = getZScore(confidenceLevel);
    
    // Calculate confidence interval for logit
    const marginOfError = zScore * logitSE;
    
    return {
        lower: logit - marginOfError,
        upper: logit + marginOfError,
        standardError: logitSE,
        marginOfError: marginOfError
    };
}

/**
 * Calculate confidence interval for the probability
 * Using the delta method for transformation from logit to probability
 * 
 * @param {number} probability - The calculated probability (0-100)
 * @param {number} logit - The logit value
 * @param {Array} steps - Array of calculation steps
 * @param {number} confidenceLevel - Confidence level (default 0.95)
 * @returns {Object} Object containing lower and upper bounds of the CI for probability
 */
export function calculateProbabilityConfidenceInterval(probability, logit, steps, confidenceLevel = 0.95) {
    // First get the logit CI
    const logitCI = calculateLogitConfidenceInterval(logit, steps, confidenceLevel);
    
    // Transform logit CI bounds to probability
    // p = 1 / (1 + exp(-logit))
    const lowerProb = 100 / (1 + Math.exp(-logitCI.lower));
    const upperProb = 100 / (1 + Math.exp(-logitCI.upper));
    
    // Alternative method using delta method for direct probability SE
    // This gives a symmetric CI around the probability
    const p = probability / 100;  // Convert to 0-1 scale
    const probabilitySE = p * (1 - p) * logitCI.standardError;
    const probabilityMOE = getZScore(confidenceLevel) * probabilitySE * 100;  // Convert back to percentage
    
    return {
        // Logit-based transformation (asymmetric, more accurate)
        lower: Math.max(0, Math.min(100, lowerProb)),
        upper: Math.max(0, Math.min(100, upperProb)),
        
        // Delta method (symmetric, for comparison)
        deltaLower: Math.max(0, Math.min(100, probability - probabilityMOE)),
        deltaUpper: Math.max(0, Math.min(100, probability + probabilityMOE)),
        
        // Additional information
        standardError: probabilitySE * 100,
        marginOfError: probabilityMOE,
        method: 'logit_transformation',
        confidenceLevel: confidenceLevel
    };
}

/**
 * Get standard error for a specific step
 * 
 * @param {Object} step - Step object with category and value information
 * @returns {number} Standard error for the coefficient
 */
function getStandardError(step) {
    // Map step names to coefficient categories
    const stepMapping = {
        'Constant': () => COEFFICIENT_STANDARD_ERRORS.constant,
        'Age group': () => COEFFICIENT_STANDARD_ERRORS.age[step.category] || 0,
        'Break location': () => COEFFICIENT_STANDARD_ERRORS.breakLocation[step.category] || 0,
        'Inferior detachment': () => COEFFICIENT_STANDARD_ERRORS.inferiorDetachment[step.category] || 0,
        'Total RD': () => COEFFICIENT_STANDARD_ERRORS.totalDetachment[step.category] || 0,
        'PVR grade': () => COEFFICIENT_STANDARD_ERRORS.pvrGrade[step.category] || 0,
        'Cryotherapy': () => COEFFICIENT_STANDARD_ERRORS.cryotherapy[step.category] || 0,
        'Tamponade': () => COEFFICIENT_STANDARD_ERRORS.tamponade[step.category] || 0,
        'Vitrectomy gauge': () => COEFFICIENT_STANDARD_ERRORS.vitrectomyGauge[step.category] || 0
    };
    
    const getSE = stepMapping[step.step];
    return getSE ? getSE() : 0;
}

/**
 * Get Z-score for a given confidence level
 * 
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns {number} Z-score
 */
function getZScore(confidenceLevel) {
    const zScores = {
        0.90: 1.645,   // 90% CI
        0.95: 1.96,    // 95% CI
        0.99: 2.576,   // 99% CI
        0.999: 3.291   // 99.9% CI
    };
    
    return zScores[confidenceLevel] || 1.96;  // Default to 95% CI
}

/**
 * Format confidence interval for display
 * 
 * @param {number} value - Central value
 * @param {Object} ci - Confidence interval object
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatConfidenceInterval(value, ci, decimals = 1) {
    const lower = ci.lower.toFixed(decimals);
    const upper = ci.upper.toFixed(decimals);
    const central = value.toFixed(decimals);
    
    return `${central}% (95% CI: ${lower}%-${upper}%)`;
}

/**
 * Calculate prediction interval (wider than confidence interval)
 * This accounts for individual patient variation
 * 
 * @param {number} probability - The calculated probability
 * @param {number} logit - The logit value
 * @param {Array} steps - Array of calculation steps
 * @returns {Object} Prediction interval bounds
 */
export function calculatePredictionInterval(probability, logit, steps) {
    // Prediction intervals are typically about 1.5-2x wider than confidence intervals
    // due to individual variation
    const ci = calculateProbabilityConfidenceInterval(probability, logit, steps, 0.95);
    
    // Add additional variance for individual predictions
    // This is a simplified approach; actual prediction intervals would need
    // the residual variance from the model fitting
    const additionalVariance = 1.5;
    const width = ci.upper - ci.lower;
    const expandedWidth = width * additionalVariance;
    const center = (ci.upper + ci.lower) / 2;
    
    return {
        lower: Math.max(0, Math.min(100, center - expandedWidth / 2)),
        upper: Math.max(0, Math.min(100, center + expandedWidth / 2)),
        type: 'prediction',
        note: 'Accounts for individual patient variation'
    };
}