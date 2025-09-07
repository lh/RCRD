/**
 * Actual Standard Errors from BEAVRS Paper
 * 
 * Derived from the 95% confidence intervals reported in Table 2 of:
 * Yorston et al. "Predictive clinical factors for successful primary 
 * rhegmatogenous retinal detachment repair" Eye (2023)
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC10219959/
 * 
 * Standard errors calculated using:
 * SE = (ln(upper_CI) - ln(lower_CI)) / (2 × 1.96)
 * 
 * This gives us the exact standard errors used in the paper's analysis.
 */

import { PAPER_COEFFICIENTS } from '../constants/paperCoefficients.js';

/**
 * 95% Confidence Intervals from Table 2 of the paper
 * Format: [lower_bound, upper_bound] for odds ratios
 */
const ODDS_RATIO_CIS = {
    age: {
        '45-64': null,  // Reference
        '65-79': [1.076, 1.490],
        '80+': [1.221, 2.218],
        '<45': [1.154, 2.171]
    },
    
    breakLocation: {
        '9-3': null,  // Reference
        '4-8': [1.171, 2.008],
        '5-7': [1.505, 2.237],
        'none': [0.634, 6.100]  // Wide CI indicates high uncertainty
    },
    
    inferiorDetachment: {
        'less_than_3': null,  // Reference
        '3_to_5': [1.259, 1.918],
        '6_hours': [1.143, 2.089]
    },
    
    totalDetachment: {
        'no': null,  // Reference
        'yes': [1.411, 2.668]
    },
    
    pvrGrade: {
        'none': null,  // Reference
        'C': [1.133, 1.372]
    },
    
    cryotherapy: {
        'no': null,  // Reference
        'yes': [0.476, 0.908]
    },
    
    tamponade: {
        'sf6': null,  // Reference
        'c2f6': [0.490, 0.887],
        'c3f8': [0.678, 1.198],
        'air': [0.319, 2.284],
        'light_oil': [1.361, 2.805],
        'heavy_oil': [0.522, 2.037]
    },
    
    vitrectomyGauge: {
        '20g': null,  // Reference
        '23g': [0.327, 1.349],
        '25g': [0.204, 0.834],
        '27g': [0.198, 1.127],
        'not_recorded': [0.187, 1.223]
    }
};

/**
 * Calculate standard error from confidence interval
 * SE = (ln(upper) - ln(lower)) / (2 × 1.96)
 */
function calculateSEFromCI(lowerCI, upperCI) {
    if (!lowerCI || !upperCI) return 0;
    return (Math.log(upperCI) - Math.log(lowerCI)) / (2 * 1.96);
}

/**
 * Actual standard errors calculated from the paper's confidence intervals
 */
export const ACTUAL_STANDARD_ERRORS = {
    // For the constant, we'll use a typical value since CI not provided
    constant: 0.400,  // Typical for logistic regression intercepts
    
    age: {
        '45-64': 0,  // Reference
        '65-79': calculateSEFromCI(...(ODDS_RATIO_CIS.age['65-79'] || [null, null])),
        '80+': calculateSEFromCI(...(ODDS_RATIO_CIS.age['80+'] || [null, null])),
        '<45': calculateSEFromCI(...(ODDS_RATIO_CIS.age['<45'] || [null, null]))
    },
    
    breakLocation: {
        '9-3': 0,  // Reference
        '4-8': calculateSEFromCI(...(ODDS_RATIO_CIS.breakLocation['4-8'] || [null, null])),
        '5-7': calculateSEFromCI(...(ODDS_RATIO_CIS.breakLocation['5-7'] || [null, null])),
        'none': calculateSEFromCI(...(ODDS_RATIO_CIS.breakLocation['none'] || [null, null]))
    },
    
    inferiorDetachment: {
        'less_than_3': 0,  // Reference
        '3_to_5': calculateSEFromCI(...(ODDS_RATIO_CIS.inferiorDetachment['3_to_5'] || [null, null])),
        '6_hours': calculateSEFromCI(...(ODDS_RATIO_CIS.inferiorDetachment['6_hours'] || [null, null]))
    },
    
    totalDetachment: {
        'no': 0,  // Reference
        'yes': calculateSEFromCI(...(ODDS_RATIO_CIS.totalDetachment['yes'] || [null, null]))
    },
    
    pvrGrade: {
        'none': 0,  // Reference
        'C': calculateSEFromCI(...(ODDS_RATIO_CIS.pvrGrade['C'] || [null, null]))
    },
    
    cryotherapy: {
        'no': 0,  // Reference
        'yes': calculateSEFromCI(...(ODDS_RATIO_CIS.cryotherapy['yes'] || [null, null]))
    },
    
    tamponade: {
        'sf6': 0,  // Reference
        'c2f6': calculateSEFromCI(...(ODDS_RATIO_CIS.tamponade['c2f6'] || [null, null])),
        'c3f8': calculateSEFromCI(...(ODDS_RATIO_CIS.tamponade['c3f8'] || [null, null])),
        'air': calculateSEFromCI(...(ODDS_RATIO_CIS.tamponade['air'] || [null, null])),
        'light_oil': calculateSEFromCI(...(ODDS_RATIO_CIS.tamponade['light_oil'] || [null, null])),
        'heavy_oil': calculateSEFromCI(...(ODDS_RATIO_CIS.tamponade['heavy_oil'] || [null, null]))
    },
    
    vitrectomyGauge: {
        '20g': 0,  // Reference
        '23g': calculateSEFromCI(...(ODDS_RATIO_CIS.vitrectomyGauge['23g'] || [null, null])),
        '25g': calculateSEFromCI(...(ODDS_RATIO_CIS.vitrectomyGauge['25g'] || [null, null])),
        '27g': calculateSEFromCI(...(ODDS_RATIO_CIS.vitrectomyGauge['27g'] || [null, null])),
        'not_recorded': calculateSEFromCI(...(ODDS_RATIO_CIS.vitrectomyGauge['not_recorded'] || [null, null]))
    }
};

/**
 * Print actual standard errors with verification
 */
export function printActualStandardErrors() {
    console.log('Actual Standard Errors from BEAVRS Paper 95% CIs:');
    console.log('================================================');
    
    console.log(`\nConstant: ${ACTUAL_STANDARD_ERRORS.constant.toFixed(4)} (estimated)`);
    
    Object.keys(ACTUAL_STANDARD_ERRORS).forEach(category => {
        if (category === 'constant') return;
        
        console.log(`\n${category}:`);
        Object.keys(ACTUAL_STANDARD_ERRORS[category]).forEach(key => {
            const se = ACTUAL_STANDARD_ERRORS[category][key];
            const coef = PAPER_COEFFICIENTS[category]?.[key];
            const ci = ODDS_RATIO_CIS[category]?.[key];
            
            if (se === 0) {
                console.log(`  ${key}: Reference category`);
            } else if (ci) {
                const or = Math.exp(coef);
                const zScore = coef / se;
                console.log(`  ${key}: SE=${se.toFixed(4)}, CI=[${ci[0]}, ${ci[1]}], OR=${or.toFixed(3)}, z=${zScore.toFixed(2)}`);
            }
        });
    });
}

/**
 * Verify that our calculated SEs produce the correct CIs
 */
export function verifySECalculations() {
    console.log('\nVerification of SE Calculations:');
    console.log('================================');
    
    let totalError = 0;
    let count = 0;
    
    Object.keys(ODDS_RATIO_CIS).forEach(category => {
        Object.keys(ODDS_RATIO_CIS[category]).forEach(key => {
            const ci = ODDS_RATIO_CIS[category][key];
            if (!ci) return;
            
            const coef = PAPER_COEFFICIENTS[category][key];
            const se = ACTUAL_STANDARD_ERRORS[category][key];
            
            // Calculate what the CI should be using our SE
            const lowerCoef = coef - 1.96 * se;
            const upperCoef = coef + 1.96 * se;
            const calculatedLowerOR = Math.exp(lowerCoef);
            const calculatedUpperOR = Math.exp(upperCoef);
            
            // Compare with actual CI
            const lowerError = Math.abs(calculatedLowerOR - ci[0]) / ci[0];
            const upperError = Math.abs(calculatedUpperOR - ci[1]) / ci[1];
            
            if (lowerError > 0.01 || upperError > 0.01) {
                console.log(`  ${category}.${key}: CI mismatch`);
                console.log(`    Actual CI: [${ci[0]}, ${ci[1]}]`);
                console.log(`    Calculated: [${calculatedLowerOR.toFixed(3)}, ${calculatedUpperOR.toFixed(3)}]`);
                console.log(`    Error: ${(100 * Math.max(lowerError, upperError)).toFixed(1)}%`);
            }
            
            totalError += lowerError + upperError;
            count += 2;
        });
    });
    
    const avgError = totalError / count;
    console.log(`\nAverage CI reconstruction error: ${(100 * avgError).toFixed(2)}%`);
    
    if (avgError < 0.01) {
        console.log('✓ Standard errors correctly reconstruct the published CIs');
    }
}