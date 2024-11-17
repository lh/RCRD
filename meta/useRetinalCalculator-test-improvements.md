# useRetinalCalculator Test Improvements

## Missing Tests

The useRetinalCalculator hook currently lacks tests, particularly for risk calculation with detachment segments. The following tests should be added:

### 1. Segment Number Extraction
```javascript
describe('useRetinalCalculator', () => {
    test('extracts segment numbers before risk calculation', () => {
        const { result } = renderHook(() => useRetinalCalculator());
        
        act(() => {
            result.current.setAge('65');
            result.current.setPvrGrade('none');
            result.current.setVitrectomyGauge('25g');
            result.current.setDetachmentSegments(['segment25', 'segment26', 'segment27']); // Hour 6
        });

        act(() => {
            result.current.handleCalculate();
        });

        expect(result.current.calculatedRisk.steps).toContainEqual({
            label: "Inferior detachment",
            value: "0.435",
            detail: "(6 hours o'clock)"
        });
    });

    test('correctly categorizes wide detachment including hour 6', () => {
        const { result } = renderHook(() => useRetinalCalculator());
        
        // Create detachment from hour 3 to 9 (including 6)
        const segments = Array.from({ length: 35 }, (_, i) => `segment${i + 10}`);
        
        act(() => {
            result.current.setAge('65');
            result.current.setPvrGrade('none');
            result.current.setVitrectomyGauge('25g');
            result.current.setDetachmentSegments(segments);
        });

        act(() => {
            result.current.handleCalculate();
        });

        expect(result.current.calculatedRisk.steps).toContainEqual({
            label: "Inferior detachment",
            value: "0.435",
            detail: "(6 hours o'clock)"
        });
    });

    test('correctly categorizes hours 3-5 detachment', () => {
        const { result } = renderHook(() => useRetinalCalculator());
        
        // Create detachment for hours 3-5 (avoiding hour 6)
        const segments = Array.from({ length: 15 }, (_, i) => `segment${i + 10}`);
        
        act(() => {
            result.current.setAge('65');
            result.current.setPvrGrade('none');
            result.current.setVitrectomyGauge('25g');
            result.current.setDetachmentSegments(segments);
        });

        act(() => {
            result.current.handleCalculate();
        });

        expect(result.current.calculatedRisk.steps).toContainEqual({
            label: "Inferior detachment",
            value: "0.441",
            detail: "(3 to 5 o'clock)"
        });
    });
});
```

### 2. Edge Cases
```javascript
describe('useRetinalCalculator edge cases', () => {
    test('handles empty detachment segments', () => {
        const { result } = renderHook(() => useRetinalCalculator());
        
        act(() => {
            result.current.setAge('65');
            result.current.setPvrGrade('none');
            result.current.setVitrectomyGauge('25g');
            result.current.setDetachmentSegments([]);
        });

        expect(result.current.isCalculateDisabled).toBe(true);
    });

    test('handles invalid segment IDs', () => {
        const { result } = renderHook(() => useRetinalCalculator());
        
        act(() => {
            result.current.setAge('65');
            result.current.setPvrGrade('none');
            result.current.setVitrectomyGauge('25g');
            result.current.setDetachmentSegments(['invalid', 'segment25']);
        });

        act(() => {
            result.current.handleCalculate();
        });

        // Should still work with valid segments
        expect(result.current.calculatedRisk.steps).toContainEqual({
            label: "Inferior detachment",
            value: "0.435",
            detail: "(6 hours o'clock)"
        });
    });
});
```

### 3. Integration Tests
```javascript
describe('useRetinalCalculator integration', () => {
    test('calculates risk correctly with all inputs', () => {
        const { result } = renderHook(() => useRetinalCalculator());
        
        act(() => {
            result.current.setAge('65');
            result.current.setPvrGrade('none');
            result.current.setVitrectomyGauge('25g');
            result.current.setSelectedHours([6]);
            result.current.setDetachmentSegments(['segment25', 'segment26', 'segment27']);
        });

        act(() => {
            result.current.handleCalculate();
        });

        expect(result.current.calculatedRisk).toMatchObject({
            steps: expect.arrayContaining([
                {
                    label: "Age group",
                    value: "0.236",
                    detail: "(65 to 79)"
                },
                {
                    label: "Break location",
                    value: "0.607",
                    detail: "(5 to 7 o'clock)"
                },
                {
                    label: "Inferior detachment",
                    value: "0.435",
                    detail: "(6 hours o'clock)"
                }
            ])
        });
    });
});
```

## Test Implementation Strategy

1. Create Test File
```bash
mkdir -p src/components/clock/hooks/__tests__
touch src/components/clock/hooks/__tests__/useRetinalCalculator.test.js
```

2. Add Required Imports
```javascript
import { renderHook, act } from '@testing-library/react';
import { useRetinalCalculator } from '../useRetinalCalculator';
```

3. Add Test Setup
```javascript
beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.resetModules();
});
```

## Test Coverage Goals

1. Core Functionality
- State management
- Risk calculation
- Input validation
- Error handling

2. Specific Cases
- Hour 6 detachment
- Hours 3-5 detachment
- Wide detachments
- Edge cases

3. Integration
- Full risk calculation
- All inputs combined
- Real-world scenarios

## Notes
- Tests should be added after implementing the segment number extraction fix
- Focus on verifying correct inferior detachment categorization
- Include tests for both simple and complex detachment patterns
- Verify coefficients are correctly applied
