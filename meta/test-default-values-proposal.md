# Test Default Values Proposal

## Current Issues

The age reset value (50) and other default values are being tested repeatedly across multiple test files:

1. Component Tests:
   - MobileRetinalCalculator.test.jsx
   - DesktopRetinalCalculator.test.jsx
   - RetinalCalculator.validation.test.jsx
   - RetinalCalculator.interactions.test.jsx

2. Form Tests:
   - RiskInputForm.test.jsx
   - RiskInputForm.integration.test.jsx
   - RiskInputForm.base.test.jsx
   - RiskInputForm.error.test.jsx
   - RiskInputForm.disabled.test.jsx

## Problems with Current Approach

1. Duplication:
   - Same default values tested in multiple places
   - Changes require updates in many files
   - Risk of inconsistency

2. Maintenance:
   - Hard to track where defaults are used
   - Changes are error-prone
   - No single source of truth

3. Documentation:
   - No clear explanation of why specific defaults were chosen
   - Clinical significance not documented
   - Test intent not always clear

## Proposed Solution

1. Create Shared Test Constants:
```javascript
// src/test-utils/constants.js
export const TEST_DEFAULTS = {
  age: {
    value: '50',
    reason: 'Median age from BEAVRS study, represents typical case'
  },
  pvrGrade: {
    value: 'none',
    reason: 'Most common initial presentation'
  },
  // ... other defaults
};
```

2. Create Test Utilities:
```javascript
// src/test-utils/form-helpers.js
export const getDefaultFormState = () => ({
  age: TEST_DEFAULTS.age.value,
  pvrGrade: TEST_DEFAULTS.pvrGrade.value,
  // ... other defaults
});

export const resetForm = async (form) => {
  // Common form reset logic
};
```

3. Update Test Files:
```javascript
import { TEST_DEFAULTS, getDefaultFormState } from '../test-utils';

describe('RiskInputForm', () => {
  test('resets to default values', () => {
    const form = render(<RiskInputForm />);
    fireEvent.click(form.getByText('Reset'));
    expect(form.getByLabelText('Age')).toHaveValue(TEST_DEFAULTS.age.value);
  });
});
```

## Benefits

1. Single Source of Truth:
   - Default values defined in one place
   - Changes only needed in one file
   - Consistent across all tests

2. Better Documentation:
   - Clear explanation of default values
   - Clinical significance documented
   - Test intent more obvious

3. Easier Maintenance:
   - Centralized updates
   - Less chance of errors
   - Better test organization

4. Improved Test Clarity:
   - Tests focus on behavior, not data
   - Easier to understand test purpose
   - More maintainable code

## Implementation Steps

1. Create Test Utils:
   - Add constants file
   - Add helper functions
   - Document all defaults

2. Update Tests:
   - Import new utilities
   - Replace hardcoded values
   - Update test descriptions

3. Add Documentation:
   - Explain default values
   - Document clinical significance
   - Update test documentation

4. Verify Coverage:
   - Ensure all tests still pass
   - Check edge cases
   - Verify documentation

## Future Considerations

1. Test Data Management:
   - Consider test data generators
   - Add more test scenarios
   - Improve test isolation

2. Documentation:
   - Add visual diagrams
   - Include clinical context
   - Document test patterns

3. Maintenance:
   - Regular review of defaults
   - Update based on new requirements
   - Keep documentation current
