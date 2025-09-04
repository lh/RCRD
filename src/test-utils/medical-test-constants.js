/**
 * Medical Test Constants
 * Based on BEAVRS Paper (Yorston et al., Eye 2023)
 * https://doi.org/10.1038/s41433-023-02388-0
 * 
 * These constants are used for medical validation testing
 * against published clinical research data.
 */

/**
 * Paper example cases with known outcomes
 */
export const BEAVRS_TEST_CASES = {
  // Page 7, Table 2: High-risk elderly patient
  elderlyHighRisk: {
    age: 82,
    selectedHours: [6], // Break at 6 o'clock (inferior)
    detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`), // Total RD
    pvrGrade: 'C',
    vitrectomyGauge: '23g',
    tamponade: 'light_oil',
    cryotherapy: 'no',
    expectedRisk: 74.5,
    description: '82-year-old with total RD, inferior break, PVR C'
  },
  
  // Page 7: Lowest risk case
  lowestRisk: {
    age: 55, // 45-64 range
    selectedHours: [12], // Superior break
    detachmentSegments: ['segment0', 'segment1'], // Minimal detachment
    pvrGrade: 'none',
    vitrectomyGauge: '25g',
    tamponade: 'c2f6',
    cryotherapy: 'yes',
    expectedRisk: 3.4,
    description: 'Middle-aged, superior break, minimal detachment, no PVR'
  }
};

/**
 * Age groups from BEAVRS with odds ratios
 */
export const BEAVRS_AGE_GROUPS = {
  young: {
    age: 35,
    group: '<45',
    oddsRatio: 1.583,
    coefficient: 0.459
  },
  reference: {
    age: 55,
    group: '45-64',
    oddsRatio: 1.0,
    coefficient: 0
  },
  senior: {
    age: 70,
    group: '65-79',
    oddsRatio: 1.266,
    coefficient: 0.235
  },
  elderly: {
    age: 85,
    group: '≥80',
    oddsRatio: 1.645,
    coefficient: 0.498
  }
};

/**
 * Break locations with clinical significance
 */
export const BREAK_LOCATIONS = {
  inferior57: {
    hours: [5, 6, 7],
    oddsRatio: 1.835,
    coefficient: 0.607,
    description: 'Highest risk inferior location'
  },
  inferior48: {
    hours: [4, 8],
    oddsRatio: 1.554,
    coefficient: 0.441,
    description: 'Moderate risk inferior location'
  },
  superior: {
    hours: [11, 12, 1],
    oddsRatio: 1.0,
    coefficient: 0,
    description: 'Reference superior location'
  }
};

/**
 * PVR grades from study
 */
export const PVR_GRADES = {
  none: {
    value: 'none',
    oddsRatio: 1.0,
    coefficient: 0,
    rawFailureRate: 11.9
  },
  gradeC: {
    value: 'C',
    oddsRatio: 1.247,
    coefficient: 0.220,
    rawFailureRate: 36.7
  }
};

/**
 * Clinical constants from BEAVRS
 */
export const CLINICAL_CONSTANTS = {
  medianAge: 62,
  overallFailureRate: 13.9,
  totalPatients: 5508,
  constantCoefficient: -1.611
};

/**
 * Common clinical scenarios for testing
 */
export const CLINICAL_SCENARIOS = {
  typicalPseudophakic: {
    age: 70,
    selectedHours: [5, 6, 7], // Inferior breaks
    detachmentSegments: Array.from({ length: 12 }, (_, i) => `segment${i + 8}`),
    pvrGrade: 'none',
    vitrectomyGauge: '23g',
    tamponade: 'c3f8',
    cryotherapy: 'yes',
    description: 'Common pseudophakic patient with inferior RD'
  },
  
  youngDialysis: {
    age: 25,
    selectedHours: [7, 8], // Inferotemporal dialysis
    detachmentSegments: Array.from({ length: 8 }, (_, i) => `segment${i + 12}`),
    pvrGrade: 'none',
    vitrectomyGauge: '25g',
    tamponade: 'c2f6',
    cryotherapy: 'yes',
    description: 'Young patient with dialysis'
  },
  
  complexWithPVR: {
    age: 82,
    selectedHours: [6], // Inferior break
    detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`), // Total RD
    pvrGrade: 'C',
    vitrectomyGauge: '23g',
    tamponade: 'light_oil',
    cryotherapy: 'no',
    description: 'Complex case with PVR and total detachment'
  }
};

/**
 * Inferior detachment hour segments
 * Used for testing inferior detachment extent calculations
 */
export const INFERIOR_SEGMENTS = {
  threeHours: {
    // Hours 4-6 (segments 15-29)
    segments: Array.from({ length: 15 }, (_, i) => `segment${i + 15}`),
    expectedCategory: '3_to_5',
    coefficient: 0.441
  },
  sixHours: {
    // Hours 4-9 (segments 15-44)
    segments: Array.from({ length: 30 }, (_, i) => `segment${i + 15}`),
    expectedCategory: '6_hours',
    coefficient: 0.435
  }
};