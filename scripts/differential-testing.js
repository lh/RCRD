#!/usr/bin/env node

/**
 * Differential Testing Script
 * Compares JavaScript risk calculations against R implementation
 * to ensure statistical correctness
 */

const { execSync } = require('child_process');
const path = require('path');
const { calculateRiskWithSteps } = require('../src/utils/riskCalculations.js');

// Test cases covering various scenarios
const TEST_CASES = [
  {
    name: "Young patient, minimal detachment",
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
    name: "Middle age, moderate detachment",
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
    name: "Elderly, severe detachment with PVR",
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
    name: "Very elderly, total detachment",
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
    name: "Reference case (all baseline)",
    params: {
      age: 50,  // Will be 45-64 group
      pvrGrade: 'none',
      vitrectomyGauge: '20g',
      selectedHours: [10, 11, 12],  // 9-3 location
      detachmentSegments: [1, 2],  // <3 hours inferior
      cryotherapy: 'no',
      tamponade: 'sf6'
    }
  },
  {
    name: "Edge case - no breaks",
    params: {
      age: 60,
      pvrGrade: 'none',
      vitrectomyGauge: '27g',
      selectedHours: [],  // No breaks
      detachmentSegments: [1, 2, 3, 4, 5],
      cryotherapy: 'no',
      tamponade: 'air'
    }
  },
  {
    name: "Mixed modifiable factors",
    params: {
      age: 45,
      pvrGrade: 'none',
      vitrectomyGauge: '25g',
      selectedHours: [4],  // 4-8 location
      detachmentSegments: Array.from({length: 8}, (_, i) => i + 1),
      cryotherapy: 'yes',
      tamponade: 'c3f8'
    }
  }
];

// Color output helpers
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

// Function to run R calculation
function runRCalculation(params) {
  const rScriptPath = path.join(__dirname, 'risk_calculation.R');
  
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
    // First check if jsonlite is installed
    try {
      execSync('Rscript -e "library(jsonlite)"', { stdio: 'pipe' });
    } catch (e) {
      console.log(yellow('Installing required R package: jsonlite...'));
      execSync('Rscript -e "install.packages(\'jsonlite\', repos=\'https://cran.r-project.org\')"', { stdio: 'inherit' });
    }
    
    // Run the R script with JSON input
    const result = execSync(`Rscript "${rScriptPath}" '${jsonInput}'`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    return JSON.parse(result.trim());
  } catch (error) {
    console.error(red(`Error running R script: ${error.message}`));
    return null;
  }
}

// Function to compare results
function compareResults(jsResult, rResult, tolerance = 0.01) {
  const differences = [];
  
  // Compare probabilities
  const probDiff = Math.abs(jsResult.probability - rResult.probability);
  if (probDiff > tolerance) {
    differences.push({
      field: 'probability',
      js: jsResult.probability,
      r: rResult.probability,
      diff: probDiff
    });
  }
  
  // Compare logits
  const logitDiff = Math.abs(jsResult.logit - rResult.logit);
  if (logitDiff > tolerance) {
    differences.push({
      field: 'logit',
      js: jsResult.logit,
      r: rResult.logit,
      diff: logitDiff
    });
  }
  
  // Compare categorical outputs
  const categoricalFields = ['ageGroup', 'pvrGrade'];
  for (const field of categoricalFields) {
    if (jsResult[field] !== rResult[field]) {
      differences.push({
        field,
        js: jsResult[field],
        r: rResult[field],
        diff: 'mismatch'
      });
    }
  }
  
  return differences;
}

// Main test runner
function runDifferentialTests() {
  console.log(bold('\n🔬 Running Differential Testing: JavaScript vs R\n'));
  console.log('Comparing risk calculations between implementations...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = [];
  
  for (const testCase of TEST_CASES) {
    totalTests++;
    console.log(bold(`Test ${totalTests}: ${testCase.name}`));
    
    // Run JavaScript calculation
    const jsResult = calculateRiskWithSteps(testCase.params);
    if (jsResult.error) {
      console.log(red(`  ❌ JavaScript calculation failed: ${jsResult.message}`));
      failedTests.push({ name: testCase.name, error: 'JS failed' });
      continue;
    }
    
    // Run R calculation
    const rResult = runRCalculation(testCase.params);
    if (!rResult) {
      console.log(red(`  ❌ R calculation failed`));
      failedTests.push({ name: testCase.name, error: 'R failed' });
      continue;
    }
    
    // Compare results
    const differences = compareResults(jsResult, rResult);
    
    if (differences.length === 0) {
      passedTests++;
      console.log(green(`  ✅ Passed`));
      console.log(`     JS: ${jsResult.probability.toFixed(2)}% | R: ${rResult.probability.toFixed(2)}%`);
    } else {
      failedTests.push({ name: testCase.name, differences });
      console.log(red(`  ❌ Failed - Differences found:`));
      for (const diff of differences) {
        if (diff.diff === 'mismatch') {
          console.log(red(`     ${diff.field}: JS=${diff.js}, R=${diff.r}`));
        } else {
          console.log(red(`     ${diff.field}: JS=${diff.js.toFixed(4)}, R=${diff.r.toFixed(4)}, diff=${diff.diff.toFixed(4)}`));
        }
      }
    }
    
    // Show detailed breakdown for debugging
    if (process.env.DEBUG) {
      console.log('  Debug info:');
      console.log(`    Age: ${testCase.params.age} -> ${jsResult.ageGroup}`);
      console.log(`    Breaks: [${testCase.params.selectedHours}]`);
      console.log(`    Segments: ${testCase.params.detachmentSegments.length} segments`);
      console.log(`    Logit: JS=${jsResult.logit.toFixed(4)}, R=${rResult.logit.toFixed(4)}`);
    }
    
    console.log();
  }
  
  // Summary
  console.log(bold('─'.repeat(60)));
  console.log(bold('\n📊 Summary:\n'));
  console.log(`Total tests: ${totalTests}`);
  console.log(green(`Passed: ${passedTests}`));
  console.log(red(`Failed: ${totalTests - passedTests}`));
  
  if (failedTests.length > 0) {
    console.log(red('\n❌ Failed tests:'));
    for (const failed of failedTests) {
      console.log(red(`  - ${failed.name}`));
      if (failed.error) {
        console.log(red(`    Error: ${failed.error}`));
      } else if (failed.differences) {
        for (const diff of failed.differences) {
          console.log(red(`    ${diff.field} difference: ${JSON.stringify(diff.diff)}`));
        }
      }
    }
    process.exit(1);
  } else {
    console.log(green('\n✅ All differential tests passed!'));
    console.log(green('JavaScript and R implementations produce identical results.\n'));
  }
}

// Run tests
try {
  // Check if R is installed
  try {
    execSync('which R', { stdio: 'pipe' });
  } catch (e) {
    console.error(red('❌ R is not installed or not in PATH'));
    console.error(yellow('Please install R from https://www.r-project.org/'));
    process.exit(1);
  }
  
  runDifferentialTests();
} catch (error) {
  console.error(red(`\n❌ Unexpected error: ${error.message}`));
  process.exit(1);
}