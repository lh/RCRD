# Test Organization Guidelines

## Current Structure

### View-Based Organization

#### RetinalCalculator Tests
Successfully organized by view and responsibility:

1. Container Tests
   ```
   src/components/__tests__/RetinalCalculator.test.jsx
   ```
   - View switching tests
   - Layout coordination
   - Component composition

2. Mobile View Tests
   ```
   src/components/__tests__/MobileRetinalCalculator.test.jsx
   ```
   - Touch interactions
   - Mobile layout
   - Form validation
   - Mobile-specific features

3. Desktop View Tests
   ```
   src/components/__tests__/DesktopRetinalCalculator.test.jsx
   ```
   - Mouse interactions
   - Desktop layout
   - Form synchronization
   - Desktop-specific features

### Shared Component Tests

#### useClockInteractions Tests
Example of well-organized hook tests:

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

## Directory Structure

```
src/
├── components/
│   ├── RetinalCalculator.jsx
│   ├── MobileRetinalCalculator.jsx
│   ├── DesktopRetinalCalculator.jsx
│   │
│   ├── __tests__/
│   │   ├── RetinalCalculator.test.jsx
│   │   ├── MobileRetinalCalculator.test.jsx
│   │   └── DesktopRetinalCalculator.test.jsx
│   │
│   ├── shared/
│   │   └── ComponentName/
│   │       ├── __tests__/
│   │       │   └── ComponentName.test.jsx
│   │       └── ComponentName.jsx
│   │
│   └── hooks/
│       ├── shared/
│       │   └── __tests__/
│       │       └── useSharedHook.test.js
│       ├── mobile/
│       │   └── __tests__/
│       │       └── useMobileHook.test.js
│       └── desktop/
│           └── __tests__/
│               └── useDesktopHook.test.js
```

## Test Categories

1. View-Specific Tests
   - Mobile view behavior
   - Desktop view behavior
   - View-specific interactions
   - Layout verification

2. Shared Tests
   - Common functionality
   - Utility functions
   - Shared hooks
   - Core business logic

3. Integration Tests
   - View switching
   - Component interactions
   - State management
   - Data flow

## Best Practices

1. View Separation
   - Clear view boundaries
   - Isolated view tests
   - Shared functionality tests
   - View-specific mocks

2. Test Structure
   ```javascript
   describe('ComponentName', () => {
     describe('Mobile View', () => {
       test('handles touch interactions', () => {
         // Mobile-specific tests
       });
     });

     describe('Desktop View', () => {
       test('handles mouse interactions', () => {
         // Desktop-specific tests
       });
     });

     describe('Shared Behavior', () => {
       test('common functionality', () => {
         // Shared behavior tests
       });
     });
   });
   ```

3. Mock Management
   ```javascript
   // View-specific mocks
   jest.mock('../MobileRetinalCalculator', () => ({
     MobileRetinalCalculator: () => <div data-testid="mobile-view" />
   }));

   // Shared mocks
   jest.mock('../utils/calculations', () => ({
     calculate: jest.fn()
   }));
   ```

4. Helper Functions
   ```javascript
   // View-specific helpers
   const simulateTouchInteraction = async (element) => {
     fireEvent.touchStart(element);
     await waitFor(() => {
       expect(element).toHaveClass('active');
     });
   };

   // Shared helpers
   const getCalculateButton = () => screen.getByTestId('calculate-button');
   ```

## Documentation

1. Test File Headers
   ```javascript
   /**
    * @jest-environment jsdom
    * Tests for [Mobile/Desktop]RetinalCalculator
    * Focus: View-specific behavior and interactions
    */
   ```

2. Test Descriptions
   - View context
   - Expected behavior
   - Interaction patterns
   - Layout requirements

3. Mock Documentation
   - View-specific mocks
   - Shared functionality
   - Mock limitations
   - Usage examples

## Future Improvements

1. Test Coverage
   - View-specific edge cases
   - Transition scenarios
   - Responsive behavior
   - Cross-view interactions

2. Performance
   - View-specific optimizations
   - Shared test utilities
   - Mock efficiency
   - Setup optimization

3. Documentation
   - View separation patterns
   - Test organization
   - Best practices
   - Migration guides

## Notes

- Maintain clear view boundaries
- Share common functionality
- Document view-specific behavior
- Regular test review and updates
- Follow consistent patterns
- Keep tests focused and maintainable
