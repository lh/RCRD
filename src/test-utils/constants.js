/**
 * Test Default Values
 * 
 * This file contains default values used across test files.
 * Each value includes documentation explaining its clinical significance
 * and why it was chosen as a default.
 */

export const TEST_DEFAULTS = {
  age: {
    value: '50',
    reason: 'Median age from BEAVRS study, represents typical case',
    clinicalSignificance: 'Age 45-64 group has baseline risk profile'
  },
  pvrGrade: {
    value: 'none',
    reason: 'Most common initial presentation',
    clinicalSignificance: 'Absence of PVR is baseline scenario'
  },
  vitrectomyGauge: {
    value: '25g',
    reason: 'Most commonly used gauge size',
    clinicalSignificance: 'Standard approach in modern vitrectomy'
  },
  cryotherapy: {
    value: 'no',
    reason: 'Default treatment approach',
    clinicalSignificance: 'Baseline scenario without additional interventions'
  },
  tamponade: {
    value: 'sf6',
    reason: 'Most common tamponade agent',
    clinicalSignificance: 'Standard choice for uncomplicated cases'
  },
  selectedHours: {
    value: [],
    reason: 'Empty array represents no tears selected',
    clinicalSignificance: 'Starting point for tear selection'
  },
  detachmentSegments: {
    value: [],
    reason: 'Empty array represents no detachment',
    clinicalSignificance: 'Starting point for detachment mapping'
  }
};

/**
 * Common test scenarios representing different clinical cases.
 * Each scenario is documented with its clinical significance.
 */
export const TEST_SCENARIOS = {
  simpleCase: {
    age: '50',
    pvrGrade: 'none',
    vitrectomyGauge: '25g',
    selectedHours: [6],
    detachmentSegments: [25, 26, 27, 28, 29], // Hour 6 segments
    description: 'Simple inferior tear with local detachment',
    clinicalSignificance: 'Common presentation pattern'
  },
  complexCase: {
    age: '75',
    pvrGrade: 'C',
    vitrectomyGauge: '23g',
    selectedHours: [3, 6, 9],
    detachmentSegments: [
      10, 11, 12, 13, 14,  // Hour 3
      25, 26, 27, 28, 29,  // Hour 6
      40, 41, 42, 43, 44   // Hour 9
    ],
    description: 'Multiple tears with PVR',
    clinicalSignificance: 'High-risk scenario'
  }
};

/**
 * Common validation scenarios for form testing
 */
export const VALIDATION_SCENARIOS = {
  invalidAge: {
    value: '200',
    error: 'Age must be between 0 and 120'
  },
  emptyRequired: {
    value: '',
    error: 'This field is required'
  }
};
