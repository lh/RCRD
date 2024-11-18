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
    },

    cryotherapy: {
        "no": 0.0,          // Reference category
        "yes": -0.420
    },

    tamponade: {
        "sf6": 0.0,         // Reference category (also use for C3F8)
        "c2f6": -0.417,
        "light_oil": 0.670
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

/**
 * Tamponade options for the risk calculator form
 * Note: Only options studied in the BEAVRS paper are included
 * @type {Array<{value: string, label: string}>}
 */
export const tamponadeOptions = [
    { value: 'c2f6', label: 'C2F6 gas' },  // Default option
    { value: 'sf6', label: 'SF6 or C3F8 gas' },  // C3F8 not significantly different from SF6 (reference)
    { value: 'light_oil', label: 'Light silicone oil' }  // Only light oil was studied in the paper
];

/**
 * Cryotherapy options for the risk calculator form
 * @type {Array<{value: string, label: string}>}
 */
export const cryotherapyOptions = [
    { value: 'yes', label: 'Yes' },  // Default option
    { value: 'no', label: 'No' }
];
