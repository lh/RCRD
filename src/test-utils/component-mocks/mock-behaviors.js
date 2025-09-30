/**
 * Shared Mock Behaviors
 * 
 * This module defines consistent behaviors that should be shared between
 * minimal and detailed mock implementations to ensure test consistency.
 */

/**
 * Standard validation functions used across mocks
 */
export const validators = {
  /**
   * Validates age input is within acceptable range
   * @param {string|number} value - Age value to validate
   * @returns {boolean} True if valid age
   */
  isAgeValid: (value) => {
    if (!value && value !== 0) return false;
    const numValue = parseInt(value, 10);
    return !isNaN(numValue) && numValue >= 18 && numValue <= 100;
  },

  /**
   * Validates PVR grade is acceptable value
   * @param {string} grade - PVR grade value
   * @returns {boolean} True if valid grade
   */
  isPvrGradeValid: (grade) => {
    return ['none', 'A', 'B', 'C'].includes(grade);
  },

  /**
   * Validates vitrectomy gauge value
   * @param {string} gauge - Gauge value
   * @returns {boolean} True if valid gauge
   */
  isGaugeValid: (gauge) => {
    return ['20g', '23g', '25g', '27g', 'not_recorded'].includes(gauge);
  },

  /**
   * Validates tamponade selection
   * @param {string} tamponade - Tamponade value
   * @returns {boolean} True if valid tamponade
   */
  isTamponadeValid: (tamponade) => {
    return ['sf6', 'c2f6', 'c3f8', 'air', 'light_oil', 'heavy_oil'].includes(tamponade);
  },

  /**
   * Validates cryotherapy selection
   * @param {string} cryo - Cryotherapy value
   * @returns {boolean} True if valid
   */
  isCryotherapyValid: (cryo) => {
    return ['yes', 'no'].includes(cryo);
  }
};

/**
 * Standard prop configurations for components
 */
export const propConfigs = {
  RiskInputForm: {
    /**
     * Determines which fields should be shown based on position
     * Both minimal and detailed mocks should respect this logic
     */
    getVisibleFields: (position, isMobile) => {
      const fields = [];
      
      // Age is always shown on left or mobile
      if (position === 'left' || isMobile) {
        fields.push('age', 'pvrGrade', 'vitrectomyGauge');
      }
      
      // Right position shows treatment options
      if (position === 'right' || isMobile) {
        fields.push('cryotherapy', 'tamponade');
      }
      
      return fields;
    },

    /**
     * Standard options for each field type
     */
    fieldOptions: {
      pvrGrade: [
        { value: 'none', label: 'No PVR' },
        { value: 'A', label: 'Grade A' },
        { value: 'B', label: 'Grade B' },
        { value: 'C', label: 'Grade C' }
      ],
      vitrectomyGauge: [
        { value: '20g', label: '20 gauge' },
        { value: '23g', label: '23 gauge' },
        { value: '25g', label: '25 gauge' },
        { value: '27g', label: '27 gauge' },
        { value: 'not_recorded', label: 'Not recorded' }
      ],
      tamponade: [
        { value: 'sf6', label: 'SF6 gas' },
        { value: 'c2f6', label: 'C2F6 gas' },
        { value: 'c3f8', label: 'C3F8 gas' },
        { value: 'air', label: 'Air' },
        { value: 'light_oil', label: 'Light silicone oil' },
        { value: 'heavy_oil', label: 'Heavy silicone oil' }
      ],
      cryotherapy: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' }
      ]
    }
  },

  RiskResults: {
    /**
     * Determines risk category based on probability
     * Both mocks should use same thresholds
     */
    getRiskCategory: (probability) => {
      if (probability < 10) return 'low-risk';
      if (probability < 25) return 'moderate-risk';
      return 'high-risk';
    },

    /**
     * Formats probability for display
     */
    formatProbability: (probability) => {
      if (typeof probability === 'number') {
        return `${probability.toFixed(1)}%`;
      }
      return '0.0%';
    }
  },

  ClockFace: {
    /**
     * Standard hour positions for clock face
     */
    hourPositions: Array.from({ length: 12 }, (_, i) => i + 1),

    /**
     * Validates hour selection
     */
    isValidHour: (hour) => {
      return hour >= 1 && hour <= 12;
    },

    /**
     * Validates segment selection
     */
    isValidSegment: (segment) => {
      return segment >= 0 && segment <= 59;
    }
  }
};

/**
 * Standard data-testid patterns for consistent querying
 */
export const testIdPatterns = {
  // Form elements
  ageInput: (position) => `age-input-${position || 'default'}`,
  pvrSelect: (position) => `pvr-select-${position || 'default'}`,
  gaugeSelect: (position) => `gauge-select-${position || 'default'}`,
  tamponadeSelect: (position) => `tamponade-select-${position || 'default'}`,
  cryoSelect: (position) => `cryo-select-${position || 'default'}`,
  
  // Risk results
  riskProbability: 'risk-probability',
  riskCategory: 'risk-category',
  riskModel: 'risk-model-type',
  
  // Clock face
  clockFace: 'clock-face',
  hourMarker: (hour) => `hour-${hour}`,
  segmentMarker: (segment) => `segment-${segment}`,
  
  // Calculation steps
  calculationStep: (stepName) => `step-${stepName.toLowerCase().replace(/\s+/g, '-')}`,
  totalLogit: 'total-logit',
  methodology: 'methodology-note'
};

/**
 * Standard aria labels for accessibility
 */
export const ariaLabels = {
  riskPercentage: (value) => `Risk percentage: ${value}`,
  ageInput: 'Patient age in years',
  pvrGrade: 'PVR grade selection',
  vitrectomyGauge: 'Vitrectomy gauge selection',
  tamponade: 'Tamponade selection',
  cryotherapy: 'Cryotherapy selection',
  clockHour: (hour) => `Clock hour ${hour}`,
  calculationCoefficient: (name, value) => `${name} coefficient: ${value}`
};

/**
 * Helper to ensure both mock versions handle props consistently
 */
export const standardizePropHandling = (props, defaults = {}) => {
  return {
    ...defaults,
    ...props,
    // Ensure consistent handling of undefined vs null
    disabled: props.disabled === true,
    isMobile: props.isMobile === true,
    readOnly: props.readOnly === true
  };
};

/**
 * Helper to create consistent mock response structure
 */
export const createMockResponse = (componentName, props, children) => {
  const standardProps = standardizePropHandling(props);
  
  return {
    componentName,
    props: standardProps,
    testId: `mock-${componentName.toLowerCase()}`,
    children: children || null
  };
};

/**
 * Medical validation constants for accurate testing
 */
export const medicalConstants = {
  probability: {
    min: 0,
    max: 100,
    precision: 1
  },
  coefficients: {
    // Expected signs for coefficients (positive increases risk, negative decreases)
    expectedSigns: {
      age_80plus: 'positive',
      vitrectomy_25g: 'negative',
      pvrGrade_C: 'positive',
      totalDetachment: 'positive',
      inferiorBreak: 'positive'
    }
  },
  pValues: {
    significanceThreshold: 0.05,
    highlySignificant: 0.001
  }
};

export default {
  validators,
  propConfigs,
  testIdPatterns,
  ariaLabels,
  standardizePropHandling,
  createMockResponse,
  medicalConstants
};