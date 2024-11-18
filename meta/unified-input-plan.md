# Plan for Unified Input with Dual Model Results

## Overview
Instead of restricting inputs based on the model, we'll:
1. Allow all inputs from Table 2 to be selected
2. Show both model calculations side by side in results
3. Clearly explain how each model uses the inputs differently
4. Maintain all data for potential future analysis

## Component Changes

### 1. Input Form Updates

#### GaugeSelection.jsx
```javascript
// Update to show all gauges from Table 2
export const gaugeOptions = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' }
];
```

#### TamponadeSelection.jsx
```javascript
// Update to show all tamponade options from Table 2
export const tamponadeOptions = [
    { value: 'sf6', label: 'SF6 gas' },
    { value: 'c2f6', label: 'C2F6 gas' },
    { value: 'c3f8', label: 'C3F8 gas' },
    { value: 'air', label: 'Air' },
    { value: 'light_oil', label: 'Light oil' },
    { value: 'heavy_oil', label: 'Heavy oil' }
];
```

### 2. New Components

#### DualModelResults.jsx
```jsx
const DualModelResults = ({ inputs }) => {
    // Calculate both results
    const significantResult = calculateSignificantRisk(inputs);
    const fullResult = calculateFullRisk(inputs);

    return (
        <div className="space-y-8">
            {/* Model comparison header */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Model Comparison</h3>
                <p className="text-sm text-gray-600">
                    Comparing results between the significant parameters model (p < 0.05) 
                    and the full model from Table 2 (p < 0.10).
                </p>
            </div>

            {/* Results grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Significant model results */}
                <div>
                    <RiskResults 
                        risk={significantResult}
                        modelType={MODEL_TYPE.SIGNIFICANT}
                    />
                </div>

                {/* Full model results */}
                <div>
                    <RiskResults 
                        risk={fullResult}
                        modelType={MODEL_TYPE.FULL}
                    />
                </div>
            </div>
        </div>
    );
};
```

### 3. Flow Changes

#### RetinalCalculator.jsx
- Remove model toggle from main view
- Update to use DualModelResults after calculation
- Keep all input options available

#### Mobile/Desktop Views
- Update to handle all input options
- Pass all inputs to DualModelResults
- Maintain responsive layout with side-by-side results on desktop

### 4. Test Updates

#### Input Form Tests
- Update to verify all options are available
- Add tests for input validation
- Verify data collection for all values

#### Results Tests
- Add tests for dual model display
- Verify coefficient handling in both models
- Test side-by-side layout on desktop
- Test stacked layout on mobile

### 5. Implementation Steps

1. Update Constants
- Modify gauge and tamponade options
- Update risk calculation constants
- Add model comparison text

2. Create Components
- Build DualModelResults component
- Update RiskResults for side-by-side display
- Add comparison explanations

3. Update Tests
- Add tests for all input options
- Verify both calculations
- Test responsive layout

4. Update Documentation
- Document model differences
- Explain coefficient usage
- Update user instructions

## Benefits

1. Data Collection
- All possible values can be recorded
- Future analysis options preserved
- Complete case data available

2. User Experience
- Single input interface
- Clear model comparison
- Better understanding of differences

3. Clinical Value
- See both calculations
- Understand coefficient impact
- Make informed decisions

## Technical Considerations

1. State Management
- Keep all inputs in form state
- Pass complete data to results
- Maintain clean data structure

2. Performance
- Calculate both models efficiently
- Optimize rendering
- Handle layout changes smoothly

3. Accessibility
- Clear model differences
- Readable results comparison
- Proper ARIA attributes

## Next Steps

1. Update input components to show all options
2. Create DualModelResults component
3. Update tests for new structure
4. Add comparison documentation

Would you like me to proceed with any specific part of this plan?
