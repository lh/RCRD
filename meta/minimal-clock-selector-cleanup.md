# MinimalClockSelector Cleanup Proposal

## Current Status

The MinimalClockSelector test suite is currently skipped in the test runs:
- Location: `scratch/MinimalClockSelector.test.jsx`
- Status: Skipped (1 of 14 test suites)
- Associated Tests: 5 skipped tests

## Reason for Skipping

The test suite is skipped because:
1. It's located in the scratch directory (experimental/prototype code)
2. The functionality has been migrated to the main codebase
3. Tests are now covered by:
   - RetinalCalculator.test.jsx
   - RetinalCalculator.interactions.test.jsx
   - Other component test files

## Coverage Analysis

The skipped tests' functionality is now covered by:

1. Clock Selection:
   - RetinalCalculator.interactions.test.jsx
   - RetinalCalculator.helpers.test.jsx

2. Touch Device Detection:
   - MobileRetinalCalculator.test.jsx
   - RetinalCalculator.interactions.test.jsx

3. State Management:
   - RetinalCalculator.test.jsx
   - RetinalCalculator.form.test.jsx

## Recommendations

1. Code Cleanup:
   - Archive MinimalClockSelector and its tests
   - Remove from active test suite
   - Document migration in commit history

2. Documentation:
   - Note learnings from prototype
   - Document test patterns that worked
   - Explain migration decisions

3. Test Coverage:
   - Verify all prototype features are tested
   - Add any missing test cases
   - Update test documentation

## Implementation Steps

1. Archive Files:
   ```bash
   mkdir -p archive/prototypes
   mv scratch/MinimalClockSelector* archive/prototypes/
   ```

2. Update Documentation:
   - Add migration notes
   - Document test coverage
   - Update test strategy docs

3. Verify Coverage:
   - Run full test suite
   - Check coverage reports
   - Add any missing tests

## Future Considerations

1. Prototype Process:
   - Keep prototypes in scratch/
   - Document experimental features
   - Plan migration strategy

2. Test Organization:
   - Maintain clear test structure
   - Document test dependencies
   - Keep test coverage high

3. Documentation:
   - Document prototype learnings
   - Maintain clear migration paths
   - Keep test documentation current
