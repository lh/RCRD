#!/usr/bin/env node

/**
 * Simple differential testing runner
 * Compares specific test cases between JavaScript and R
 */

const { execSync } = require('child_process');
const path = require('path');

// Import the JavaScript functions manually since ES modules are tricky
const jsCode = require('fs').readFileSync(
  path.join(__dirname, '../src/utils/riskCalculations.js'), 
  'utf8'
);

// Extract just the functions we need by evaluating the code
const vm = require('vm');
const context = { 
  exports: {}, 
  console,
  process,
  MODEL_TYPE: { FULL: 'FULL', SIGNIFICANT: 'SIGNIFICANT' }
};

// Load paper coefficients first
const coeffCode = require('fs').readFileSync(
  path.join(__dirname, '../src/constants/paperCoefficients.js'), 
  'utf8'
);

// Load ClockHourNotation
const clockCode = require('fs').readFileSync(
  path.join(__dirname, '../src/components/clock/utils/clockHourNotation.js'),
  'utf8'
);

// Load confidence intervals
const ciCode = require('fs').readFileSync(
  path.join(__dirname, '../src/utils/confidenceIntervals.js'),
  'utf8'
);

// Execute in context - properly handle ES6 exports
const processCode = (code) => {
  // Remove all import statements (including multiline)
  code = code.replace(/import[\s\S]*?from\s+['"][^'"]+['"]\s*;?/g, '');
  // Convert 'export const X' to 'this.X'
  code = code.replace(/export const /g, 'this.');
  // Convert 'export function' to 'this.functionName = function'
  code = code.replace(/export function (\w+)/g, 'this.$1 = function $1');
  // Remove export { } statements
  code = code.replace(/export \{[^}]*\};?/g, '');
  // Remove default exports
  code = code.replace(/export default .*/g, '');
  return code;
};

vm.runInNewContext(processCode(coeffCode), context);
vm.runInNewContext(processCode(clockCode), context);
vm.runInNewContext(processCode(ciCode), context);
vm.runInNewContext(processCode(jsCode), context);

const { calculateRiskWithSteps } = context;

// Color helpers
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

// Test cases
const testCases = [
  {
    name: "Default test case",
    params: {
      age: 55,
      pvrGrade: 'none',
      vitrectomyGauge: '25g',
      selectedHours: [5, 6],
      detachmentSegments: [1,2,3,4,5,6,7,8,9,10],
      cryotherapy: 'no',
      tamponade: 'sf6'
    }
  },
  {
    name: "Young patient minimal detachment",
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
    name: "Elderly with PVR",
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
    name: "Reference baseline",
    params: {
      age: 50,
      pvrGrade: 'none',
      vitrectomyGauge: '20g',
      selectedHours: [10, 11, 12],
      detachmentSegments: [1, 2],
      cryotherapy: 'no',
      tamponade: 'sf6'
    }
  }
];

console.log(bold('\n🔬 Differential Testing: JavaScript vs R\n'));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(bold(`\nTest: ${testCase.name}`));
  
  // Run JavaScript calculation
  const jsResult = calculateRiskWithSteps(testCase.params);
  
  if (jsResult.error) {
    console.log(red(`  JS Error: ${jsResult.message}`));
    failed++;
    continue;
  }
  
  // Run R calculation
  const jsonInput = JSON.stringify(testCase.params);
  let rResult;
  
  try {
    const output = execSync(
      `Rscript scripts/risk_calculation.R '${jsonInput}'`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    rResult = JSON.parse(output.trim());
  } catch (e) {
    console.log(red(`  R Error: ${e.message}`));
    failed++;
    continue;
  }
  
  // Compare results
  const probDiff = Math.abs(jsResult.probability - rResult.probability);
  const logitDiff = Math.abs(jsResult.logit - rResult.logit);
  
  console.log(`  JS Result: ${jsResult.probability.toFixed(2)}% (logit: ${jsResult.logit.toFixed(4)})`);
  console.log(`  R Result:  ${rResult.probability.toFixed(2)}% (logit: ${rResult.logit.toFixed(4)})`);
  
  if (probDiff < 0.01 && logitDiff < 0.0001) {
    console.log(green(`  ✅ PASSED (diff: ${probDiff.toFixed(4)}%)`));
    passed++;
  } else {
    console.log(red(`  ❌ FAILED`));
    console.log(red(`     Probability diff: ${probDiff.toFixed(4)}%`));
    console.log(red(`     Logit diff: ${logitDiff.toFixed(6)}`));
    failed++;
  }
}

console.log(bold('\n' + '='.repeat(60)));
console.log(bold('\nSummary:'));
console.log(green(`  Passed: ${passed}`));
console.log(red(`  Failed: ${failed}`));

if (failed === 0) {
  console.log(green('\n✅ All tests passed! JavaScript and R produce identical results.\n'));
} else {
  console.log(red('\n❌ Some tests failed. Review the differences above.\n'));
  process.exit(1);
}