#!/usr/bin/env node

// Debug differential testing - check what's different

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Load and process the JavaScript code
const context = { 
  exports: {}, 
  console,
  process,
  MODEL_TYPE: { FULL: 'FULL', SIGNIFICANT: 'SIGNIFICANT' }
};

const coeffCode = fs.readFileSync(path.join(__dirname, '../src/constants/paperCoefficients.js'), 'utf8');
const clockCode = fs.readFileSync(path.join(__dirname, '../src/components/clock/utils/clockHourNotation.js'), 'utf8');
const ciCode = fs.readFileSync(path.join(__dirname, '../src/utils/confidenceIntervals.js'), 'utf8');
const jsCode = fs.readFileSync(path.join(__dirname, '../src/utils/riskCalculations.js'), 'utf8');

const processCode = (code) => {
  code = code.replace(/import[\s\S]*?from\s+['"][^'"]+['"]\s*;?/g, '');
  code = code.replace(/export const /g, 'this.');
  code = code.replace(/export function (\w+)/g, 'this.$1 = function $1');
  code = code.replace(/export \{[^}]*\};?/g, '');
  code = code.replace(/export default .*/g, '');
  return code;
};

vm.runInNewContext(processCode(coeffCode), context);
vm.runInNewContext(processCode(clockCode), context);
vm.runInNewContext(processCode(ciCode), context);
vm.runInNewContext(processCode(jsCode), context);

const { calculateRiskWithSteps, getInferiorDetachment } = context;

// Test case that's failing
const testCase = {
  age: 55,
  pvrGrade: 'none',
  vitrectomyGauge: '25g',
  selectedHours: [5, 6],
  detachmentSegments: [1,2,3,4,5,6,7,8,9,10],
  cryotherapy: 'no',
  tamponade: 'sf6'
};

console.log('\n=== Debugging Test Case ===');
console.log('Input:', testCase);

// Run JavaScript calculation
const jsResult = calculateRiskWithSteps(testCase);
console.log('\nJavaScript Results:');
console.log('  Probability:', jsResult.probability);
console.log('  Logit:', jsResult.logit);
console.log('  Steps:');
jsResult.steps.forEach(step => {
  console.log(`    ${step.step}: ${step.value} (category: ${step.category || 'N/A'})`);
});

// Check inferior detachment calculation specifically
const inferiorJS = getInferiorDetachment(testCase.detachmentSegments);
console.log('\n  Inferior Detachment (JS):', inferiorJS);

// Run R calculation with details
console.log('\n=== R Calculation ===');
const jsonInput = JSON.stringify(testCase);
try {
  const output = execSync(
    `Rscript -e "
    source('scripts/risk_calculation.R')
    input <- jsonlite::fromJSON('${jsonInput}')
    result <- calculateRisk(
      age = input\\$age,
      pvrGrade = input\\$pvrGrade,
      vitrectomyGauge = input\\$vitrectomyGauge,
      selectedHours = input\\$selectedHours,
      detachmentSegments = input\\$detachmentSegments,
      cryotherapy = input\\$cryotherapy,
      tamponade = input\\$tamponade
    )
    cat('Probability:', result\\$probability, '\\n')
    cat('Logit:', result\\$logit, '\\n')
    cat('Inferior Detachment:', result\\$inferiorDetachment, '\\n')
    
    # Debug inferior calculation
    segments <- input\\$detachmentSegments
    inferiorHours <- c(3, 4, 5, 6, 7, 8, 9)
    for (hour in inferiorHours) {
      touches <- segmentsTouchHour(segments, hour)
      if (touches) {
        cat('  Hour', hour, 'is touched\\n')
      }
    }
    "`,
    { encoding: 'utf8', stdio: 'pipe' }
  );
  console.log(output);
} catch (e) {
  console.error('R Error:', e.message);
}