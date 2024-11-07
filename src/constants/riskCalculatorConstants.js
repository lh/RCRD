/**
 * Risk calculation coefficients based on the BEAVRS database study
 * @type {Object}
 */
export const coefficients = {
    constant: -1.611,

    age_group: {
        "45_to_64": 0.0,    // Reference category
        "65_to_79": 0.236,
        "80_plus": 0.498,
        "under_45": 0.459
    },

    break_location: {
        "9_to_3": 0.0,      // Reference category
        "4_or_8": 0.428,
        "5_to_7": 0.607,
        "no_break": 0.676
    },

    inferior_detachment: {
        "less_than_3": 0.0,  // Reference category
        "3_to_5": 0.441,
        "6_hours": 0.435
    },

    total_rd: {
        "no": 0.0,          // Reference category
        "yes": 0.663
    },

    pvr_grade: {
        "none_A_B": 0.0,    // Reference category
        "C": 0.220
    },

    gauge: {              
        "20g": 0.0,         // Reference category
        "23g": -0.408,
        "25g": -0.885,
        "27g": -0.703,
        "not_recorded": -0.738
    }
};

/**
 * PVR grade options for the risk calculator form
 * @type {Array<{value: string, label: string}>}
 */
export const pvrOptions = [
    { value: 'none', label: 'No PVR' },
    { value: 'A', label: 'Grade A' },
    { value: 'B', label: 'Grade B' },
    { value: 'C', label: 'Grade C' }
];

/**
 * Vitrectomy gauge options for the risk calculator form
 * @type {Array<{value: string, label: string}>}
 */
export const gaugeOptions = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' },
    { value: 'not_recorded', label: 'Not recorded' }
];

// // Run validation tests only if this file is executed directly
// if (import.meta.url === import.meta.resolve('./riskCalculatorConstants.js')) {
//     const validateConstants = () => {
//         const testCases = [
//             {
//                 name: "Coefficients structure",
//                 fn: () => {
//                     const requiredKeys = ['constant', 'age_group', 'break_location', 
//                                         'inferior_detachment', 'total_rd', 'pvr_grade', 'gauge'];
//                     return requiredKeys.every(key => key in coefficients);
//                 }
//             },
//             {
//                 name: "Reference categories have 0.0 coefficient",
//                 fn: () => {
//                     return coefficients.age_group["45_to_64"] === 0.0 &&
//                            coefficients.break_location["9_to_3"] === 0.0 &&
//                            coefficients.inferior_detachment["less_than_3"] === 0.0 &&
//                            coefficients.total_rd["no"] === 0.0 &&
//                            coefficients.pvr_grade["none_A_B"] === 0.0 &&
//                            coefficients.gauge["20g"] === 0.0;
//                 }
//             },
//             {
//                 name: "PVR options validity",
//                 fn: () => {
//                     const requiredValues = ['none', 'A', 'B', 'C'];
//                     const values = pvrOptions.map(opt => opt.value);
//                     return requiredValues.every(val => values.includes(val));
//                 }
//             },
//             {
//                 name: "Gauge options validity",
//                 fn: () => {
//                     const requiredValues = ['20g', '23g', '25g', '27g', 'not_recorded'];
//                     const values = gaugeOptions.map(opt => opt.value);
//                     return requiredValues.every(val => values.includes(val));
//                 }
//             },
//             {
//                 name: "Options format consistency",
//                 fn: () => {
//                     return pvrOptions.every(opt => 'value' in opt && 'label' in opt) &&
//                            gaugeOptions.every(opt => 'value' in opt && 'label' in opt);
//                 }
//             }
//         ];

//         // Run tests and collect results
//         const results = testCases.map(testCase => {
//             const passed = testCase.fn();
//             return {
//                 name: testCase.name,
//                 passed: passed
//             };
//         });

//         // Print results
//         results.forEach(result => {
//             console.log(`\nTest: ${result.name}`);
//             console.log(`Result: ${result.passed ? 'PASS' : 'FAIL'}`);
//         });

//         // Return overall test status
//         return results.every(r => r.passed);
//     };

//     // Run the validation
//     const testsValid = validateConstants();
//     console.log(`\nAll validations ${testsValid ? 'PASSED' : 'FAILED'}`);
// }