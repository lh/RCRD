# RetinalCalculator Test Split Plan

## Current Issues
- Large test file becoming difficult to maintain
- Multiple concerns mixed together
- Common setup code duplicated

## Proposed Split

### 1. RetinalCalculator.rendering.test.jsx
```jsx
// Basic rendering tests
describe('RetinalCalculator Rendering', () => {
  test('renders initial state correctly')
  test('displays different layouts for mobile and desktop')
})
```

### 2. RetinalCalculator.interactions.test.jsx
```jsx
// User interaction tests
describe('RetinalCalculator Interactions', () => {
  test('handles tear selection')
  test('handles detachment segment selection')
  test('handles touch device changes')
})
```

### 3. RetinalCalculator.form.test.jsx
```jsx
// Form handling and calculation tests
describe('RetinalCalculator Form', () => {
  test('calculates risk when form is valid')
  test('disables calculation when form is invalid')
  test('resets calculator state')
  test('displays read-only clock face in results view')
})
```

### 4. RetinalCalculator.helpers.js
```jsx
// Shared test helpers and mocks
export const getMobileView = (container) => {
  const mobileContainer = container.querySelector('.md\\:hidden')
  expect(mobileContainer).toBeInTheDocument()
  const mobileView = within(mobileContainer).getByTestId('clock-face')
  expect(mobileView).toHaveClass('mobile-view')
  return { mobileContainer, mobileView }
}

export const mockComponents = () => {
  // Common mock setup for ClockFace, RiskInputForm, RiskResults
}
```

## Benefits

1. Better Organization
   - Tests grouped by functionality
   - Easier to find specific tests
   - Clearer test purposes

2. Improved Maintenance
   - Smaller files
   - Focused test suites
   - Easier to update

3. Reduced Duplication
   - Shared helper functions
   - Common mock setup
   - Reusable test utilities

4. Better Test Focus
   - Each file tests one aspect
   - Clearer test boundaries
   - Easier to run specific tests

## Implementation Steps

1. Create Helper File
   - Move getMobileView helper
   - Extract common mocks
   - Add shared utilities

2. Create Test Files
   - Create three new test files
   - Move relevant tests
   - Import shared helpers

3. Update Test Organization
   - Group related tests
   - Add clear descriptions
   - Maintain existing functionality

4. Verify Tests
   - Run all test suites
   - Ensure no functionality lost
   - Verify proper isolation

## Notes
- Keep existing test improvements
- Maintain container-based selection pattern
- Follow Testing Library best practices
- No source code modifications needed
