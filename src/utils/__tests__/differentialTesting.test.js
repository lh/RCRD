/**
 * Differential Testing against R
 * Validates JavaScript calculations match R statistical implementation
 */

import { execSync } from 'child_process';
import path from 'path';
import { calculateRiskWithSteps } from '../riskCalculations';

describe('Differential Testing: JavaScript vs R', () => {
  // Helper to run R calculation
  const runRCalculation = (params) => {
    const rScriptPath = path.join(process.cwd(), 'scripts', 'risk_calculation.R');
    
    // Convert params to JSON for R
    const jsonInput = JSON.stringify({
      age: params.age,
      pvrGrade: params.pvrGrade,
      vitrectomyGauge: params.vitrectomyGauge,
      selectedHours: params.selectedHours,
      detachmentSegments: params.detachmentSegments,
      cryotherapy: params.cryotherapy,
      tamponade: params.tamponade
    });
    
    try {
      // Check if jsonlite is installed
      try {
        execSync('Rscript -e "library(jsonlite)"', { stdio: 'pipe' });
      } catch (e) {
        console.log('Installing required R package: jsonlite...');
        execSync('Rscript -e "install.packages(\'jsonlite\', repos=\'https://cran.r-project.org\', quiet=TRUE)"', { 
          stdio: 'pipe' 
        });
      }
      
      // Run the R script with JSON input
      const result = execSync(`Rscript "${rScriptPath}" '${jsonInput}'`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      return JSON.parse(result.trim());
    } catch (error) {
      console.error(`Error running R script: ${error.message}`);
      return null;
    }
  };

  // Check if R is available
  let rAvailable = false;
  beforeAll(() => {
    try {
      execSync('which R', { stdio: 'pipe' });
      rAvailable = true;
    } catch (e) {
      console.warn('R is not installed - skipping differential tests');
    }
  });

  const testCases = [
    {
      name: 'young patient with minimal detachment',
      params: {
        age: 35,
        pvrGrade: 'none',
        vitrectomyGauge: '25g',
        selectedHours: [],
        detachmentSegments: [1, 2, 3],
        cryotherapy: 'no',
        tamponade: 'sf6'
      }
    },
    {
      name: 'middle age with moderate detachment',
      params: {
        age: 55,
        pvrGrade: 'none',
        vitrectomyGauge: '23g',
        selectedHours: [5, 6],
        detachmentSegments: Array.from({length: 10}, (_, i) => i + 1),
        cryotherapy: 'no',
        tamponade: 'c2f6'
      }
    },
    {
      name: 'elderly with severe detachment and PVR',
      params: {
        age: 75,
        pvrGrade: 'C',
        vitrectomyGauge: '20g',
        selectedHours: [4, 5, 6, 7, 8],
        detachmentSegments: Array.from({length: 15}, (_, i) => i + 1),
        cryotherapy: 'yes',
        tamponade: 'light_oil'
      }
    },
    {
      name: 'very elderly with total detachment',
      params: {
        age: 85,
        pvrGrade: 'C',
        vitrectomyGauge: '25g',
        selectedHours: Array.from({length: 12}, (_, i) => i + 1),
        detachmentSegments: Array.from({length: 24}, (_, i) => i + 1),
        cryotherapy: 'yes',
        tamponade: 'heavy_oil'
      }
    },
    {
      name: 'reference case with all baseline values',
      params: {
        age: 50,
        pvrGrade: 'none',
        vitrectomyGauge: '20g',
        selectedHours: [10, 11, 12],
        detachmentSegments: [1, 2],
        cryotherapy: 'no',
        tamponade: 'sf6'
      }
    },
    {
      name: 'edge case with no breaks',
      params: {
        age: 60,
        pvrGrade: 'none',
        vitrectomyGauge: '27g',
        selectedHours: [],
        detachmentSegments: [1, 2, 3, 4, 5],
        cryotherapy: 'no',
        tamponade: 'air'
      }
    },
    {
      name: 'mixed modifiable factors',
      params: {
        age: 45,
        pvrGrade: 'none',
        vitrectomyGauge: '25g',
        selectedHours: [4],
        detachmentSegments: Array.from({length: 8}, (_, i) => i + 1),
        cryotherapy: 'yes',
        tamponade: 'c3f8'
      }
    }
  ];

  describe.each(testCases)('$name', ({ params }) => {
    const testFunc = rAvailable ? test : test.skip;
    
    testFunc('JavaScript and R calculations match', () => {
      // Run JavaScript calculation
      const jsResult = calculateRiskWithSteps(params);
      expect(jsResult.error).toBeFalsy();
      
      // Run R calculation
      const rResult = runRCalculation(params);
      expect(rResult).not.toBeNull();
      
      // Compare probabilities (within 0.01% tolerance)
      expect(Math.abs(jsResult.probability - rResult.probability)).toBeLessThan(0.01);
      
      // Compare logits (within 0.0001 tolerance)
      expect(Math.abs(jsResult.logit - rResult.logit)).toBeLessThan(0.0001);
      
      // Compare categorical outputs
      expect(jsResult.ageGroup).toBe(rResult.ageGroup);
      expect(jsResult.pvrGrade).toBe(rResult.pvrCategory);
    });
  });

  // Additional validation tests
  describe('Statistical validation', () => {
    const testFunc = rAvailable ? test : test.skip;
    
    testFunc('probability bounds are respected', () => {
      const extremeCase = {
        age: 90,
        pvrGrade: 'C',
        vitrectomyGauge: '20g',
        selectedHours: Array.from({length: 12}, (_, i) => i + 1),
        detachmentSegments: Array.from({length: 24}, (_, i) => i + 1),
        cryotherapy: 'no',
        tamponade: 'light_oil'
      };
      
      const jsResult = calculateRiskWithSteps(extremeCase);
      const rResult = runRCalculation(extremeCase);
      
      // Both should produce valid probabilities
      expect(jsResult.probability).toBeGreaterThanOrEqual(0);
      expect(jsResult.probability).toBeLessThanOrEqual(100);
      expect(rResult.probability).toBeGreaterThanOrEqual(0);
      expect(rResult.probability).toBeLessThanOrEqual(100);
      
      // And they should match
      expect(Math.abs(jsResult.probability - rResult.probability)).toBeLessThan(0.01);
    });

    testFunc('logistic regression formula is correct', () => {
      // Test with known coefficients
      const testCase = {
        age: 50,  // 45-64 group = 0
        pvrGrade: 'none',  // 0
        vitrectomyGauge: '20g',  // 0
        selectedHours: [10],  // 9-3 location = 0
        detachmentSegments: [1],  // <3 hours = 0
        cryotherapy: 'no',  // 0
        tamponade: 'sf6'  // 0
      };
      
      const jsResult = calculateRiskWithSteps(testCase);
      const rResult = runRCalculation(testCase);
      
      // With all zero coefficients, logit should equal constant
      const expectedLogit = -1.611;
      expect(Math.abs(jsResult.logit - expectedLogit)).toBeLessThan(0.0001);
      expect(Math.abs(rResult.logit - expectedLogit)).toBeLessThan(0.0001);
      
      // Probability should be 1 / (1 + e^1.611) * 100
      const expectedProb = 100 / (1 + Math.exp(1.611));
      expect(Math.abs(jsResult.probability - expectedProb)).toBeLessThan(0.01);
      expect(Math.abs(rResult.probability - expectedProb)).toBeLessThan(0.01);
    });
  });
});