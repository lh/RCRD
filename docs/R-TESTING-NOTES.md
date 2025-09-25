# R Differential Testing Documentation

## Overview
The RCRD application includes differential testing against an R statistical implementation to ensure JavaScript calculations match the reference statistical model. This is critical for medical accuracy.

## Running R Conformity Tests

### Recommended Method
```bash
npm run test:differential
```

This runs `scripts/run-differential-test.js` which:
- Executes R calculations using `scripts/risk_calculation.R`
- Compares results with JavaScript implementation
- Shows detailed pass/fail for each test case
- Currently tests 4 scenarios and **all pass** ✅

### Why Jest Tests Skip R Testing

The file `src/utils/__tests__/differentialTesting.test.js` contains Jest tests that compare JS vs R, but they are **automatically skipped** because:

1. **Jest's sandboxed environment** has restricted PATH access
2. Even though R is installed at `/usr/local/bin/R`, Jest can't access it
3. The test checks for R with `execSync('Rscript --version')` but this fails in Jest
4. When R isn't detected, tests use `test.skip` to avoid failures

This is a **known limitation** and not a bug. The standalone script works perfectly.

## The 24-Segment Fix (Historical Context)

### The Bug We Fixed
- **Issue**: UI used 24 segments (2 per hour) but `clockHourNotation.js` used 60-segment ranges
- **Impact**: Inferior hour detection was wrong by 5-10%, affecting medical risk calculations
- **Solution**: Standardized entire codebase on 24-segment model

### Verification
The differential testing confirms our fix is correct:
```
JS Result: 19.03% (logit: -1.4480)
R Result:  19.03% (logit: -1.4480)
✅ PASSED (diff: 0.0000%)
```

## Automated Testing Options

### Option 1: Git Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
echo "Running R differential tests..."
npm run test:differential
if [ $? -ne 0 ]; then
  echo "❌ R differential tests failed. Please fix before committing."
  exit 1
fi
```

### Option 2: GitHub Actions CI
Add to `.github/workflows/test.yml`:
```yaml
- name: Setup R
  uses: r-lib/actions/setup-r@v2
  with:
    r-version: '4.0.0'
    
- name: Install R dependencies
  run: Rscript -e "install.packages('jsonlite')"
  
- name: Run differential tests
  run: npm run test:differential
```

### Option 3: Husky (Recommended)
Install husky for Git hooks:
```bash
npm install --save-dev husky
npx husky add .husky/pre-commit "npm run test:differential"
```

## Test Data Structure

The differential tests use these test cases:
1. **Default test case** - Standard parameters
2. **Young patient minimal detachment** - Age 35, segments [1,2,3]
3. **Elderly with PVR** - Age 75, PVR grade C
4. **Reference baseline** - Minimal risk scenario

Each test verifies:
- Probability percentage matches
- Logit values match
- Difference is < 0.01%

## Troubleshooting

### If R tests fail to run:
1. Check R is installed: `which R`
2. Check jsonlite package: `Rscript -e "library(jsonlite)"`
3. Run standalone script: `node scripts/run-differential-test.js`

### If calculations don't match:
1. Check segment model consistency (should be 24 segments everywhere)
2. Verify `clockHourNotation.js` uses correct hour ranges
3. Check `segmentToHour()` function maps correctly
4. Run `node scripts/verify-segment-mapping.js` to visualize mappings

## Files Involved

- `scripts/run-differential-test.js` - Main test runner ✅
- `scripts/risk_calculation.R` - R reference implementation
- `scripts/differential-testing.mjs` - ES module version
- `src/utils/riskCalculations.js` - JavaScript implementation being tested

## Maintaining Accuracy

**IMPORTANT**: Any changes to risk calculation logic MUST:
1. Pass all existing JavaScript tests
2. Pass differential testing against R (`npm run test:differential`)
3. Maintain the 24-segment model consistently

Last verified: All differential tests passing as of this documentation.