/**
 * Derived Standard Errors from BEAVRS Paper
 * 
 * Since the paper doesn't directly provide standard errors, we derive them
 * from the coefficients and p-values using the relationship:
 * SE = |coefficient| / z-score
 * 
 * Where z-score is derived from the p-value:
 * - p < 0.001: z ≈ 3.291
 * - p = 0.006: z ≈ 2.75
 * - p = 0.011: z ≈ 2.54
 * - p = 0.014: z ≈ 2.46
 * - p < 0.05: z ≈ 1.96
 * - p < 0.10: z ≈ 1.645
 */

import { PAPER_COEFFICIENTS } from '../constants/paperCoefficients.js';

/**
 * Map p-values to z-scores (two-tailed test)
 */
const P_VALUE_TO_Z_SCORE = {
    0.001: 3.291,  // p < 0.001
    0.006: 2.75,   // p = 0.006
    0.011: 2.54,   // p = 0.011
    0.014: 2.46,   // p = 0.014
    0.05: 1.96,    // p < 0.05
    0.10: 1.645    // p < 0.10
};

/**
 * Documented p-values from the BEAVRS paper
 * Based on comments in paperCoefficients.js
 */
const COEFFICIENT_P_VALUES = {
    constant: 0.001,  // Intercept typically highly significant
    
    age: {
        '45-64': null,     // Reference category
        '65-79': 0.05,     // p < 0.05
        '80+': 0.05,       // p < 0.05
        '<45': 0.05        // p < 0.05
    },

    breakLocation: {
        '9-3': null,       // Reference
        '4-8': 0.05,       // p < 0.05
        '5-7': 0.05,       // p < 0.05
        'none': 0.05       // p < 0.05
    },

    inferiorDetachment: {
        'less_than_3': null,  // Reference
        '3_to_5': 0.05,       // p < 0.05
        '6_hours': 0.05       // p < 0.05
    },

    totalDetachment: {
        'no': null,        // Reference
        'yes': 0.001       // p < 0.001
    },

    pvrGrade: {
        'none': null,      // Reference
        'C': 0.001         // p < 0.001
    },

    cryotherapy: {
        'no': null,        // Reference
        'yes': 0.011       // p = 0.011
    },

    tamponade: {
        'sf6': null,       // Reference
        'c2f6': 0.006,     // p = 0.006
        'c3f8': 0.10,      // Not significant (p > 0.05)
        'air': 0.10,       // Not significant
        'light_oil': 0.001, // p < 0.001
        'heavy_oil': 0.10   // Not significant
    },

    vitrectomyGauge: {
        '20g': null,       // Reference
        '23g': 0.10,       // Not significant (p > 0.05)
        '25g': 0.014,      // p = 0.014
        '27g': 0.10,       // Not significant
        'not_recorded': 0.10
    }
};

/**
 * Calculate standard error from coefficient and p-value
 */
function calculateSE(coefficient, pValue) {
    if (pValue === null || coefficient === 0) {
        return 0; // Reference category
    }
    
    // Find the appropriate z-score
    let zScore;
    if (pValue <= 0.001) zScore = P_VALUE_TO_Z_SCORE[0.001];
    else if (pValue <= 0.006) zScore = P_VALUE_TO_Z_SCORE[0.006];
    else if (pValue <= 0.011) zScore = P_VALUE_TO_Z_SCORE[0.011];
    else if (pValue <= 0.014) zScore = P_VALUE_TO_Z_SCORE[0.014];
    else if (pValue <= 0.05) zScore = P_VALUE_TO_Z_SCORE[0.05];
    else zScore = P_VALUE_TO_Z_SCORE[0.10];
    
    // SE = |coefficient| / z-score
    return Math.abs(coefficient) / zScore;
}

/**
 * Derived standard errors based on coefficients and p-values
 */
export const DERIVED_STANDARD_ERRORS = {
    constant: calculateSE(PAPER_COEFFICIENTS.constant, COEFFICIENT_P_VALUES.constant),
    
    age: {
        '45-64': 0,  // Reference
        '65-79': calculateSE(PAPER_COEFFICIENTS.age['65-79'], COEFFICIENT_P_VALUES.age['65-79']),
        '80+': calculateSE(PAPER_COEFFICIENTS.age['80+'], COEFFICIENT_P_VALUES.age['80+']),
        '<45': calculateSE(PAPER_COEFFICIENTS.age['<45'], COEFFICIENT_P_VALUES.age['<45'])
    },

    breakLocation: {
        '9-3': 0,  // Reference
        '4-8': calculateSE(PAPER_COEFFICIENTS.breakLocation['4-8'], COEFFICIENT_P_VALUES.breakLocation['4-8']),
        '5-7': calculateSE(PAPER_COEFFICIENTS.breakLocation['5-7'], COEFFICIENT_P_VALUES.breakLocation['5-7']),
        'none': calculateSE(PAPER_COEFFICIENTS.breakLocation['none'], COEFFICIENT_P_VALUES.breakLocation['none'])
    },

    inferiorDetachment: {
        'less_than_3': 0,  // Reference
        '3_to_5': calculateSE(PAPER_COEFFICIENTS.inferiorDetachment['3_to_5'], COEFFICIENT_P_VALUES.inferiorDetachment['3_to_5']),
        '6_hours': calculateSE(PAPER_COEFFICIENTS.inferiorDetachment['6_hours'], COEFFICIENT_P_VALUES.inferiorDetachment['6_hours'])
    },

    totalDetachment: {
        'no': 0,  // Reference
        'yes': calculateSE(PAPER_COEFFICIENTS.totalDetachment['yes'], COEFFICIENT_P_VALUES.totalDetachment['yes'])
    },

    pvrGrade: {
        'none': 0,  // Reference
        'C': calculateSE(PAPER_COEFFICIENTS.pvrGrade['C'], COEFFICIENT_P_VALUES.pvrGrade['C'])
    },

    cryotherapy: {
        'no': 0,  // Reference
        'yes': calculateSE(PAPER_COEFFICIENTS.cryotherapy['yes'], COEFFICIENT_P_VALUES.cryotherapy['yes'])
    },

    tamponade: {
        'sf6': 0,  // Reference
        'c2f6': calculateSE(PAPER_COEFFICIENTS.tamponade['c2f6'], COEFFICIENT_P_VALUES.tamponade['c2f6']),
        'c3f8': calculateSE(PAPER_COEFFICIENTS.tamponade['c3f8'], COEFFICIENT_P_VALUES.tamponade['c3f8']),
        'air': calculateSE(PAPER_COEFFICIENTS.tamponade['air'], COEFFICIENT_P_VALUES.tamponade['air']),
        'light_oil': calculateSE(PAPER_COEFFICIENTS.tamponade['light_oil'], COEFFICIENT_P_VALUES.tamponade['light_oil']),
        'heavy_oil': calculateSE(PAPER_COEFFICIENTS.tamponade['heavy_oil'], COEFFICIENT_P_VALUES.tamponade['heavy_oil'])
    },

    vitrectomyGauge: {
        '20g': 0,  // Reference
        '23g': calculateSE(PAPER_COEFFICIENTS.vitrectomyGauge['23g'], COEFFICIENT_P_VALUES.vitrectomyGauge['23g']),
        '25g': calculateSE(PAPER_COEFFICIENTS.vitrectomyGauge['25g'], COEFFICIENT_P_VALUES.vitrectomyGauge['25g']),
        '27g': calculateSE(PAPER_COEFFICIENTS.vitrectomyGauge['27g'], COEFFICIENT_P_VALUES.vitrectomyGauge['27g']),
        'not_recorded': calculateSE(PAPER_COEFFICIENTS.vitrectomyGauge['not_recorded'], COEFFICIENT_P_VALUES.vitrectomyGauge['not_recorded'])
    }
};

/**
 * Print derived standard errors for verification
 */
export function printDerivedStandardErrors() {
    console.log('Derived Standard Errors from p-values:');
    console.log('=====================================');
    
    console.log(`Constant: ${DERIVED_STANDARD_ERRORS.constant.toFixed(4)}`);
    
    Object.keys(DERIVED_STANDARD_ERRORS).forEach(category => {
        if (category === 'constant') return;
        
        console.log(`\n${category}:`);
        Object.keys(DERIVED_STANDARD_ERRORS[category]).forEach(key => {
            const coef = PAPER_COEFFICIENTS[category][key];
            const se = DERIVED_STANDARD_ERRORS[category][key];
            const pVal = COEFFICIENT_P_VALUES[category][key];
            
            if (se === 0) {
                console.log(`  ${key}: Reference category`);
            } else {
                const zScore = coef / se;
                console.log(`  ${key}: Coef=${coef}, SE=${se.toFixed(4)}, z=${zScore.toFixed(2)}, p=${pVal}`);
            }
        });
    });
}

/**
 * Compare derived SEs with our estimated ones
 */
export function compareWithEstimatedSEs() {
    // Import estimated SEs for comparison
    const { COEFFICIENT_STANDARD_ERRORS } = require('./confidenceIntervals.js');
    
    console.log('\nComparison: Derived vs Estimated SEs');
    console.log('====================================');
    
    const comparisons = [];
    
    Object.keys(DERIVED_STANDARD_ERRORS).forEach(category => {
        if (category === 'constant') {
            comparisons.push({
                category: 'constant',
                derived: DERIVED_STANDARD_ERRORS.constant,
                estimated: COEFFICIENT_STANDARD_ERRORS.constant,
                diff: Math.abs(DERIVED_STANDARD_ERRORS.constant - COEFFICIENT_STANDARD_ERRORS.constant)
            });
            return;
        }
        
        Object.keys(DERIVED_STANDARD_ERRORS[category]).forEach(key => {
            const derived = DERIVED_STANDARD_ERRORS[category][key];
            const estimated = COEFFICIENT_STANDARD_ERRORS[category]?.[key] || 0;
            
            if (derived > 0) {
                comparisons.push({
                    category: `${category}.${key}`,
                    derived,
                    estimated,
                    diff: Math.abs(derived - estimated)
                });
            }
        });
    });
    
    // Sort by difference
    comparisons.sort((a, b) => b.diff - a.diff);
    
    console.log('Largest differences:');
    comparisons.slice(0, 10).forEach(({ category, derived, estimated, diff }) => {
        console.log(`  ${category}: Derived=${derived.toFixed(4)}, Estimated=${estimated.toFixed(4)}, Diff=${diff.toFixed(4)}`);
    });
    
    const avgDiff = comparisons.reduce((sum, c) => sum + c.diff, 0) / comparisons.length;
    console.log(`\nAverage difference: ${avgDiff.toFixed(4)}`);
}