import { validateCalculationInputs, getPVRGrade } from '../riskCalculations';
import { pvrOptions } from '../../constants/riskCalculatorConstants';

describe('Risk Calculation Validation', () => {
    describe('validateCalculationInputs', () => {
        const validBaseParams = {
            age: 50,
            pvrGrade: 'none',
            vitrectomyGauge: '25g',
            selectedHours: [6],
            detachmentSegments: ['segment1'],
            cryotherapy: 'yes',
            tamponade: 'sf6'
        };

        describe('PVR Grade Validation', () => {
            it('should accept all PVR grades available in the UI', () => {
                // Test every grade that appears in the UI constants
                const uiGrades = pvrOptions.map(g => g.value);
                
                uiGrades.forEach(grade => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        pvrGrade: grade
                    });
                    
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
            });

            it('should specifically accept Grade A and Grade B', () => {
                // These grades were historically problematic
                ['A', 'B'].forEach(grade => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        pvrGrade: grade
                    });
                    
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
            });

            it('should reject invalid PVR grades', () => {
                const invalidGrades = ['E', 'F', 'invalid', '1', '2'];
                
                invalidGrades.forEach(grade => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        pvrGrade: grade
                    });
                    
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain(
                        `PVR grade must be one of: none, A, B, C, D`
                    );
                });
            });

            it('should handle Grade B correctly in calculations', () => {
                // Grade B should be treated as 'none' for coefficient purposes
                expect(getPVRGrade('B')).toBe('none');
                expect(getPVRGrade('A')).toBe('none');
                expect(getPVRGrade('C')).toBe('C');
                expect(getPVRGrade('D')).toBe('none'); // D is also treated as none in full model
            });
        });

        describe('Age Validation', () => {
            it('should accept valid ages', () => {
                const validAges = [0, 1, 18, 45, 65, 80, 100, 120];
                
                validAges.forEach(age => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        age: age.toString()
                    });
                    
                    expect(result.isValid).toBe(true);
                });
            });

            it('should reject invalid ages', () => {
                const invalidAges = [-1, 121, 'abc', NaN, null, undefined, ''];
                
                invalidAges.forEach(age => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        age
                    });
                    
                    expect(result.isValid).toBe(false);
                });
            });
        });

        describe('Vitrectomy Gauge Validation', () => {
            it('should accept all valid gauges', () => {
                const validGauges = ['20g', '23g', '25g', '27g'];
                
                validGauges.forEach(gauge => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        vitrectomyGauge: gauge
                    });
                    
                    expect(result.isValid).toBe(true);
                });
            });

            it('should reject invalid gauges', () => {
                const invalidGauges = ['19g', '22g', '30g', 'invalid'];
                
                invalidGauges.forEach(gauge => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        vitrectomyGauge: gauge
                    });
                    
                    expect(result.isValid).toBe(false);
                });
            });
        });

        describe('Selected Hours Validation', () => {
            it('should accept valid clock hours', () => {
                const validHours = [
                    [1], [12], [1, 2, 3], [6, 7, 8], 
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                ];
                
                validHours.forEach(hours => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        selectedHours: hours
                    });
                    
                    expect(result.isValid).toBe(true);
                });
            });

            it('should reject invalid clock hours', () => {
                const invalidHours = [
                    [0], [13], [-1], [1.5], ['1'], [NaN]
                ];
                
                invalidHours.forEach(hours => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        selectedHours: hours
                    });
                    
                    expect(result.isValid).toBe(false);
                });
            });
        });

        describe('Cryotherapy Validation', () => {
            it('should accept valid cryotherapy options', () => {
                const validOptions = ['yes', 'no'];
                
                validOptions.forEach(option => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        cryotherapy: option
                    });
                    
                    expect(result.isValid).toBe(true);
                });
            });

            it('should reject invalid cryotherapy options', () => {
                const invalidOptions = ['maybe', 'true', 'false', 1, 0];
                
                invalidOptions.forEach(option => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        cryotherapy: option
                    });
                    
                    expect(result.isValid).toBe(false);
                });
            });
        });

        describe('Tamponade Validation', () => {
            it('should accept all valid tamponade options', () => {
                const validOptions = [
                    'sf6', 'c2f6', 'c3f8', 'air', 'light_oil', 'heavy_oil'
                ];
                
                validOptions.forEach(option => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        tamponade: option
                    });
                    
                    expect(result.isValid).toBe(true);
                });
            });

            it('should reject invalid tamponade options', () => {
                const invalidOptions = ['water', 'invalid', 'oil', 'gas'];
                
                invalidOptions.forEach(option => {
                    const result = validateCalculationInputs({
                        ...validBaseParams,
                        tamponade: option
                    });
                    
                    expect(result.isValid).toBe(false);
                });
            });
        });

        describe('Complete Validation', () => {
            it('should provide clear error messages for each invalid field', () => {
                const result = validateCalculationInputs({
                    age: -5,
                    pvrGrade: 'Z',
                    vitrectomyGauge: '30g',
                    selectedHours: [0, 13],
                    detachmentSegments: null,
                    cryotherapy: 'maybe',
                    tamponade: 'water'
                });
                
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Age must be a number between 0 and 120');
                expect(result.errors).toContain('PVR grade must be one of: none, A, B, C, D');
                expect(result.errors).toContain('Vitrectomy gauge must be one of: 20g, 23g, 25g, 27g');
                expect(result.errors).toContain('All selected hours must be integers between 1 and 12');
                expect(result.errors).toContain('Cryotherapy must be one of: yes, no');
                expect(result.errors).toContain('Tamponade must be one of: none, air, sf6, c2f6, c3f8, light_oil, heavy_oil');
            });

            it('should pass validation for a typical patient case', () => {
                const result = validateCalculationInputs({
                    age: '65',
                    pvrGrade: 'B',
                    vitrectomyGauge: '25g',
                    selectedHours: [6, 7],
                    detachmentSegments: ['segment1', 'segment2', 'segment3'],
                    cryotherapy: 'yes',
                    tamponade: 'c3f8'
                });
                
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
        });
    });
});