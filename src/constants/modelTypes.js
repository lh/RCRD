// Model types based on statistical significance thresholds
export const MODEL_TYPE = {
    SIGNIFICANT: 'significant',  // Only coefficients with p < 0.05
    FULL: 'full'                // All coefficients from Table 2 (p < 0.10)
};

// Model descriptions for UI
export const MODEL_DESCRIPTIONS = {
    [MODEL_TYPE.SIGNIFICANT]: 'Significant Parameters Model (p < 0.05)',
    [MODEL_TYPE.FULL]: 'Full Paper Model (p < 0.10)'
};

// Explanation of model differences
export const MODEL_EXPLANATIONS = {
    [MODEL_TYPE.SIGNIFICANT]: `
        This model includes only statistically significant coefficients (p < 0.05),
        following standard statistical practice. Non-significant coefficients are
        treated as reference values. 
    `,
    [MODEL_TYPE.FULL]: `
        This model includes all coefficients from Table 2 of the paper, including
        those that did not reach statistical significance (p < 0.10). This matches
        the example calculations in the paper.
    `
};
