// Full model coefficients from Table 2 of the paper (p < 0.10)
export const PAPER_COEFFICIENTS = {
    // Non-modifiable Risk Factors
    constant: -1.611,
    
    age: {
        '45-64': 0,      // Reference
        '65-79': 0.236,
        '80+': 0.498,
        '<45': 0.459
    },

    breakLocation: {
        '9-3': 0,        // Reference
        '4-8': 0.428,
        '5-7': 0.607,
        'none': 0.676
    },

    inferiorDetachment: {
        'less_than_3': 0,  // Reference
        '3_to_5': 0.441,
        '6_hours': 0.435
    },

    totalDetachment: {
        'no': 0,         // Reference
        'yes': 0.663
    },

    pvrGrade: {
        'none': 0,       // Reference
        'C': 0.220
    },

    // Modifiable Risk Factors
    cryotherapy: {
        'no': 0,         // Reference
        'yes': -0.420
    },

    tamponade: {
        'sf6': 0,        // Reference (Sulphur Hexafluoride Gas)
        'c2f6': -0.417,  // Perfluoroethane Gas
        'c3f8': -0.104,  // Perfluoropropane Gas
        'air': -0.159,
        'light_oil': 0.670,
        'heavy_oil': 0.030
    },

    vitrectomyGauge: {
        '20g': 0,        // Reference
        '23g': -0.408,
        '25g': -0.885,
        '27g': -0.703,
        'not_recorded': -0.738
    }
};

// Document which coefficients are statistically significant
export const SIGNIFICANT_COEFFICIENTS = {
    age: ['65-79', '80+', '<45'],              // All p < 0.05
    breakLocation: ['4-8', '5-7', 'none'],     // All p < 0.05
    inferiorDetachment: ['3_to_5', '6_hours'], // All p < 0.05
    totalDetachment: ['yes'],                  // p < 0.001
    pvrGrade: ['C'],                          // p < 0.001
    cryotherapy: ['yes'],                     // p = 0.011
    tamponade: ['c2f6', 'light_oil'],         // p = 0.006, p < 0.001
    vitrectomyGauge: ['25g']                  // p = 0.014
};

// Helper function to check if a coefficient is statistically significant
export const isSignificant = (category, value) => {
    return SIGNIFICANT_COEFFICIENTS[category]?.includes(value) ?? false;
};
