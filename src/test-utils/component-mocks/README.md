# Component Mock System

This directory contains centralized mock implementations for all major components used in tests.

## Overview

The mock system provides consistent, reusable mocks that replace the previous pattern of inline mock definitions scattered across test files. Each component has both minimal and detailed mock versions to support different testing needs.

## Mock Types

### Minimal Mocks
- Lightweight implementations for unit tests
- Focus on component isolation
- Minimal DOM structure
- Fast test execution

### Detailed Mocks
- Fuller implementations for integration tests
- Include more realistic behavior
- Support interaction testing
- Better for testing component integration

## Available Mocks

### GaugeSelection
- **File**: `GaugeSelection.mock.js`
- **Minimal**: Simple div with data attributes
- **Detailed**: Full radio button implementation with 20g, 23g, 25g, 27g options

### TamponadeSelection
- **File**: `TamponadeSelection.mock.js`
- **Minimal**: Simple div with value display
- **Detailed**: Radio buttons for SF6, C2F6, C3F8, Air, Light/Heavy oil

### CryotherapySelection
- **File**: `CryotherapySelection.mock.js`
- **Minimal**: Simple div with value display
- **Detailed**: Yes/No radio button implementation

### ClockFace
- **File**: `ClockFace.mock.js`
- **Minimal**: Basic div with hour/segment tracking
- **Detailed**: Full SVG implementation with 12 hour markers and interactive segments

### RiskResults
- **File**: `RiskResults.mock.js`
- **Minimal**: Simple probability display with action buttons
- **Detailed**: Complete risk display with category, calculation steps, and model type

### RiskInputForm
- **File**: `RiskInputForm.mock.js`
- **Minimal**: Basic form inputs with position awareness
- **Detailed**: Full form with validation, error messages, and proper field grouping

## Usage

### Basic Import (Minimal Mock)
```javascript
jest.mock('../GaugeSelection', () => 
  require('../../test-utils/component-mocks/GaugeSelection.mock')
);
```

### Detailed Mock Import
```javascript
jest.mock('../GaugeSelection', () => {
  const { createDetailedMock } = require('../../test-utils/component-mocks/GaugeSelection.mock');
  return createDetailedMock();
});
```

### Using Mock Helpers
```javascript
import { assertMockCalled } from '../../test-utils/mock-helpers';

// Assert mock was called with specific props
assertMockCalled(MockGaugeSelection, { value: '25g', disabled: false });
```

### Accessing All Mocks
```javascript
import { getMinimalMocks, getDetailedMocks } from '../../test-utils/component-mocks';

// Get all minimal mocks
const mocks = getMinimalMocks();

// Get specific mock type
const DetailedGauge = createMocks.gauge.detailed();
```

## Mock Structure

Each mock file exports:
1. `createMinimalMock()` - Factory for minimal version
2. `createDetailedMock()` - Factory for detailed version
3. Default export - The minimal mock for convenience

## Best Practices

1. **Use minimal mocks for unit tests** - Faster and focused on single component behavior
2. **Use detailed mocks for integration tests** - When testing component interactions
3. **Reset mocks between tests** - Use `jest.clearAllMocks()` in `beforeEach`
4. **Assert on mock calls** - Use the mock-helpers utilities for consistent assertions
5. **Keep mocks synchronized** - Update mocks when component interfaces change

## Migration Guide

### From Inline Mocks
```javascript
// Before
jest.mock('../GaugeSelection', () => {
  return jest.fn(({ value, onChange }) => (
    <div>Mock Gauge: {value}</div>
  ));
});

// After
jest.mock('../GaugeSelection', () => 
  require('../../test-utils/component-mocks/GaugeSelection.mock')
);
```

### From Multiple Mock Patterns
```javascript
// Before - Different mocks in each test
test('test1', () => {
  const MockGauge = jest.fn(() => <div>Mock1</div>);
});

test('test2', () => {
  const MockGauge = jest.fn(() => <div>Mock2</div>);
});

// After - Consistent mocks
import { createMocks } from '../../test-utils/component-mocks';
const MockGauge = createMocks.gauge.minimal();
```

## Maintenance

When updating component interfaces:
1. Update both minimal and detailed mock versions
2. Ensure data-testid attributes match test expectations
3. Update this README if adding new mocks
4. Run affected tests to verify compatibility

## Testing the Mocks

The mocks themselves should be tested to ensure they maintain the expected interface:
```javascript
npm test -- --testPathPattern="mock.test"
```

## Future Improvements

- [ ] Add mock state management utilities
- [ ] Create mock preset configurations
- [ ] Add TypeScript definitions
- [ ] Implement mock verification helpers
- [ ] Add mock snapshot testing