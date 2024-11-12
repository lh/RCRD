# Test Organization Guidelines

## Current Structure

### Successfully Organized Tests

#### useClockInteractions Tests
A prime example of well-organized tests:

```
src/components/clock/hooks/__tests__/useClockInteractions.test.js
```

1. Clear Test Groups
   - Core state tests
   - Device detection tests
   - Interaction tests
   - Drawing state tests
   - Clear functionality tests
   - Event handling tests

2. Proper Setup/Teardown
   ```javascript
   beforeEach(() => {
     jest.useFakeTimers();
     jest.clearAllMocks();
     // Environment setup
     delete window.ontouchstart;
     Object.defineProperty(navigator, 'maxTouchPoints', { value: 0 });
   });

   afterEach(() => {
     jest.useRealTimers();
     jest.resetModules();
   });
   ```

3. Mock Organization
   ```javascript
   // Module level mocks
   jest.mock('../../utils/clockCalculations', () => ({
     segmentToHour: (segment) => {
       const num = parseInt(segment.replace('segment', ''), 10);
       return isNaN(num) ? 0 : num;
     }
   }));
   ```

### RetinalCalculator Tests
Successfully split into logical groups:

1. RetinalCalculator.rendering.test.jsx
   - Initial state rendering
   - Layout tests
   - Component presence tests

2. RetinalCalculator.interactions.test.jsx
   - User interaction tests
   - Event handling tests
   - State change tests

3. RetinalCalculator.form.test.jsx
   - Form validation tests
   - Calculation tests
   - Reset functionality tests

4. RetinalCalculator.helpers.js
   - Shared test utilities
   - Common setup functions
   - Test data factories

## Best Practices

1. File Organization
   - Group related tests together
   - Keep test files close to source
   - Use descriptive file names
   - Separate helpers and utilities

2. Test Structure
   ```javascript
   describe('Component/Hook Name', () => {
     beforeEach(() => {
       // Common setup
     });

     afterEach(() => {
       // Cleanup
     });

     test('specific functionality', () => {
       // Arrange
       // Act
       // Assert
     });
   });
   ```

3. Mock Management
   - Define mocks at appropriate scope
   - Clean up mocks after tests
   - Use clear mock implementations
   - Document mock behavior

4. Test Isolation
   - Reset state between tests
   - Clean up side effects
   - Avoid test interdependence
   - Use fresh mocks per test

## Directory Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── ComponentName.rendering.test.jsx
│   │   ├── ComponentName.interactions.test.jsx
│   │   └── ComponentName.form.test.jsx
│   │
│   └── ComponentName/
│       ├── __tests__/
│       │   └── NestedComponent.test.jsx
│       └── hooks/
│           ├── __tests__/
│           │   └── useHook.test.js
│           └── useHook.js
```

## Test Categories

1. Unit Tests
   - Individual function behavior
   - Isolated component rendering
   - Hook behavior
   - Utility functions

2. Integration Tests
   - Component interactions
   - Hook integration
   - Form submissions
   - API interactions

3. Behavioral Tests
   - User interactions
   - Event handling
   - State changes
   - Error scenarios

## Documentation

1. Test File Headers
   ```javascript
   /**
    * @jest-environment jsdom
    * Tests for ComponentName
    * Focus: [rendering/interactions/form handling]
    */
   ```

2. Test Descriptions
   - Clear purpose
   - Expected behavior
   - Edge cases
   - Assumptions

3. Mock Documentation
   - Purpose of mocks
   - Expected behavior
   - Limitations
   - Usage examples

## Future Improvements

1. Test Coverage
   - Identify gaps
   - Add missing tests
   - Improve edge cases
   - Document coverage decisions

2. Performance
   - Optimize test runs
   - Reduce setup overhead
   - Improve mock efficiency
   - Better test isolation

3. Documentation
   - Update test guidelines
   - Document patterns
   - Share best practices
   - Maintain examples

## Notes

- Keep tests focused and maintainable
- Follow consistent patterns
- Document decisions and rationale
- Regular review and updates
