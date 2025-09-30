# Testing Framework and Approach

## Testing Stack
- **Framework**: Jest (via React Scripts)
- **Testing Library**: React Testing Library
- **Assertions**: Jest matchers + @testing-library/jest-dom
- **User Events**: @testing-library/user-event

## Test Structure
```javascript
// Standard test file structure
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
    beforeEach(() => {
        // Setup
    });

    afterEach(() => {
        // Cleanup
    });

    it('should render correctly', () => {
        // Test implementation
    });

    describe('nested functionality', () => {
        it('should handle specific case', () => {
            // Test implementation
        });
    });
});
```

## Testing Patterns
- **Mocking**: Mock child components to isolate unit tests
- **Timer Mocking**: Use `jest.useFakeTimers()` for time-dependent tests
- **Async Testing**: Use `waitFor` and `async/await` for async operations
- **User Interactions**: Prefer `userEvent` over `fireEvent` for realistic interactions

## Test File Organization
- Component tests: `src/components/__tests__/`
- Utility tests: `src/utils/__tests__/`
- Hook tests: `src/components/clock/hooks/__tests__/`
- Test helpers: `src/test-utils/` and `src/components/test-helpers/`

## Common Testing Utilities
```javascript
// Query methods priority (React Testing Library)
1. getByRole
2. getByLabelText
3. getByPlaceholderText
4. getByText
5. getByTestId (last resort)

// Common assertions
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent()
expect(element).toHaveAttribute()
expect(element).toBeDisabled()
expect(mockFunction).toHaveBeenCalledWith()
```

## Test Categories
- `.test.jsx` - Main component tests
- `.rendering.test.jsx` - Rendering and display tests
- `.interactions.test.jsx` - User interaction tests
- `.validation.test.jsx` - Form validation tests
- `.state.test.jsx` - State management tests
- `.accessibility.test.jsx` - Accessibility tests
- `.integration.test.jsx` - Integration tests