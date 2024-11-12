# RiskInputForm Test Split Strategy

## Current Issues
1. Large test file with mixed concerns
2. Multiple accessibility improvements needed
3. Validation logic needs enhancement
4. Form submission behavior needs updating
5. Mobile vs desktop rendering differences
6. Syntax issues in test assertions

## Proposed Split

### 1. RiskInputForm.accessibility.test.jsx
Focus: Screen reader support, ARIA attributes, label associations

```jsx
describe('RiskInputForm Accessibility', () => {
  describe('Age Input', () => {
    test('renders age input with proper label association in desktop view')
    test('renders age input with proper label association in mobile view')
    test('includes required ARIA attributes')
    test('updates aria-invalid based on validation state')
  });

  describe('PVR Grade Selection', () => {
    test('radio buttons have proper label associations in desktop view')
    test('radio buttons have proper label associations in mobile view')
    test('radio group has proper ARIA attributes')
  });

  describe('Vitrectomy Gauge Selection', () => {
    test('radio buttons have proper label associations in desktop view')
    test('radio buttons have proper label associations in mobile view')
    test('radio group has proper ARIA attributes')
  });
});
```

### 2. RiskInputForm.validation.test.jsx
Focus: Input validation, error states, form submission behavior

```jsx
describe('RiskInputForm Validation', () => {
  describe('Age Validation', () => {
    test('validates age is between 18 and 100')
    test('shows appropriate error messages')
    test('updates aria-invalid state')
  });

  describe('Form Submission', () => {
    test('prevents default form submission')
    test('handles mobile form submission')
    test('validates all fields before submission')
  });
});
```

### 3. RiskInputForm.rendering.test.jsx
Focus: Component rendering, layout differences, conditional rendering

```jsx
describe('RiskInputForm Rendering', () => {
  describe('Desktop Layout', () => {
    test('renders age and PVR inputs when position is left')
    test('renders only gauge inputs when position is right')
  });

  describe('Mobile Layout', () => {
    test('renders all inputs in mobile layout')
    test('adds mobile suffix to input IDs')
  });
});
```

### 4. RiskInputForm.interactions.test.jsx
Focus: User interactions, event handlers, state updates

```jsx
describe('RiskInputForm Interactions', () => {
  describe('Age Input', () => {
    test('calls setAge when input changes')
    test('shows error message when age is empty')
  });

  describe('PVR Grade Selection', () => {
    test('calls setPvrGrade when option selected')
  });

  describe('Vitrectomy Gauge Selection', () => {
    test('calls setVitrectomyGauge when option selected')
  });
});
```

## Implementation Steps

1. Create Test Helper File
```jsx
// src/components/test-helpers/RiskInputForm.helpers.js
export const mockProps = {
  age: '',
  setAge: jest.fn(),
  pvrGrade: '',
  setPvrGrade: jest.fn(),
  vitrectomyGauge: '',
  setVitrectomyGauge: jest.fn(),
  position: 'left'
};

export const renderDesktop = (props = {}) => 
  render(<RiskInputForm {...mockProps} {...props} isMobile={false} />);

export const renderMobile = (props = {}) =>
  render(<RiskInputForm {...mockProps} {...props} isMobile={true} />);

// Reset all mocks between tests
export const resetMocks = () => {
  mockProps.setAge.mockReset();
  mockProps.setPvrGrade.mockReset();
  mockProps.setVitrectomyGauge.mockReset();
};
```

2. Create New Test Files
- Create the four test files
- Move relevant tests to each file
- Import shared helpers
- Add new tests for missing coverage

3. Update Test Organization
- Group related tests
- Add clear descriptions
- Maintain existing functionality
- Add new tests for edge cases

4. Enhance Test Coverage
- Add missing accessibility tests
- Add validation edge cases
- Add mobile-specific tests
- Add error state tests

## Benefits

1. Better Organization
- Tests grouped by concern
- Easier to find specific tests
- Clearer test purposes
- Better maintainability

2. Improved Focus
- Each file tests one aspect
- Clearer test boundaries
- Better error isolation
- Easier debugging

3. Enhanced Coverage
- Identifies missing tests
- Encourages complete testing
- Separates concerns
- Better edge case handling

4. Better Maintenance
- Smaller files
- Focused test suites
- Reusable helpers
- Consistent patterns

## Next Steps

1. Create Helper File
- Move shared setup
- Add render helpers
- Add common assertions
- Document usage

2. Create Test Files
- Start with accessibility tests
- Move existing tests
- Add missing tests
- Verify coverage

3. Update Documentation
- Update implementation notes
- Update test improvements doc
- Add new test guidelines
- Document patterns

4. Verify Tests
- Run all test suites
- Ensure no functionality lost
- Verify proper isolation
- Check coverage reports

## Notes
- Follow existing test patterns
- Maintain high test coverage
- Focus on one aspect per file
- Use consistent naming
- Share common setup
- Document test purposes
- Handle edge cases
- Consider accessibility

## Implementation Order

1. Create test helpers first
2. Start with accessibility tests (highest priority)
3. Add validation tests
4. Add rendering tests
5. Add interaction tests

This order aligns with the priorities in implementation-priorities.md, focusing on accessibility and validation first.
