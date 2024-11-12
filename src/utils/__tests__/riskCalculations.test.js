import {
  getAgeGroup,
  getBreakLocation,
  getInferiorDetachment,
  isTotalRD,
  getPVRGrade,
  calculateRiskWithSteps
} from '../riskCalculations';

describe('getAgeGroup', () => {
  test('returns correct age group for under 45', () => {
    expect(getAgeGroup('30')).toBe('under_45');
    expect(getAgeGroup('44')).toBe('under_45');
  });

  test('returns correct age group for 45-64', () => {
    expect(getAgeGroup('45')).toBe('45_to_64');
    expect(getAgeGroup('64')).toBe('45_to_64');
  });

  test('returns correct age group for 65-79', () => {
    expect(getAgeGroup('65')).toBe('65_to_79');
    expect(getAgeGroup('79')).toBe('65_to_79');
  });

  test('returns correct age group for 80+', () => {
    expect(getAgeGroup('80')).toBe('80_plus');
    expect(getAgeGroup('90')).toBe('80_plus');
  });

  test('handles default case', () => {
    expect(getAgeGroup()).toBe('45_to_64');
    expect(getAgeGroup('')).toBe('45_to_64');
  });
});

describe('getBreakLocation', () => {
  test('returns no_break when no hours selected', () => {
    expect(getBreakLocation([])).toBe('no_break');
  });

  test('identifies 5-7 location with priority', () => {
    expect(getBreakLocation([5])).toBe('5_to_7');
    expect(getBreakLocation([6])).toBe('5_to_7');
    expect(getBreakLocation([7])).toBe('5_to_7');
    // Should still return 5_to_7 even with 4 or 8 present
    expect(getBreakLocation([4, 6])).toBe('5_to_7');
  });

  test('identifies 4 or 8 location', () => {
    expect(getBreakLocation([4])).toBe('4_or_8');
    expect(getBreakLocation([8])).toBe('4_or_8');
  });

  test('identifies 9-3 location', () => {
    expect(getBreakLocation([1])).toBe('9_to_3');
    expect(getBreakLocation([2])).toBe('9_to_3');
    expect(getBreakLocation([3])).toBe('9_to_3');
    expect(getBreakLocation([9])).toBe('9_to_3');
  });
});

describe('getInferiorDetachment', () => {
  test('identifies 6 hours detachment', () => {
    // Segment 25-29 corresponds to hour 6
    expect(getInferiorDetachment([25, 26, 27, 28, 29])).toBe('6_hours');
  });

  test('identifies 3-5 hours detachment', () => {
    // Segments 10-24 correspond to hours 3-5
    expect(getInferiorDetachment([10, 11, 12])).toBe('3_to_5');
    expect(getInferiorDetachment([15, 16, 17])).toBe('3_to_5');
    expect(getInferiorDetachment([20, 21, 22])).toBe('3_to_5');
  });

  test('identifies less than 3 hours detachment', () => {
    // Segments 0-9 correspond to hours 1-2
    expect(getInferiorDetachment([0, 1, 2])).toBe('less_than_3');
  });
});

describe('isTotalRD', () => {
  test('identifies total RD when 10 or more hours affected', () => {
    const totalDetachment = Array.from({ length: 50 }, (_, i) => i); // All segments
    expect(isTotalRD(totalDetachment)).toBe('yes');
  });

  test('identifies non-total RD when less than 10 hours affected', () => {
    expect(isTotalRD([0, 1, 2, 3, 4])).toBe('no');
  });
});

describe('getPVRGrade', () => {
  test('identifies grade C', () => {
    expect(getPVRGrade('C')).toBe('C');
  });

  test('identifies non-C grades', () => {
    expect(getPVRGrade('A')).toBe('none_A_B');
    expect(getPVRGrade('B')).toBe('none_A_B');
    expect(getPVRGrade('')).toBe('none_A_B');
  });
});

describe('calculateRiskWithSteps', () => {
  test('calculates risk with all parameters', () => {
    const result = calculateRiskWithSteps({
      age: '50',
      pvrGrade: 'C',
      vitrectomyGauge: '23g',
      selectedHours: [6],
      detachmentSegments: [25, 26, 27] // Hour 6
    });

    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('logit');
    expect(result).toHaveProperty('probability');
    expect(parseFloat(result.probability)).toBeLessThanOrEqual(100);
    expect(parseFloat(result.probability)).toBeGreaterThanOrEqual(0);
  });

  test('handles default/edge cases', () => {
    const result = calculateRiskWithSteps({
      age: '',
      pvrGrade: '',
      vitrectomyGauge: '23g',
      selectedHours: [],
      detachmentSegments: []
    });

    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('logit');
    expect(result).toHaveProperty('probability');
    expect(parseFloat(result.probability)).toBeLessThanOrEqual(100);
    expect(parseFloat(result.probability)).toBeGreaterThanOrEqual(0);
  });
});
