# Model Selection UI Simplification Plan

## Current Implementation

The application currently shows model selection on the front page:
1. ModelToggle component rendered in RetinalCalculator.jsx
2. Two calculation methods:
   - Complete model (all parameters from Table 2)
   - Significant model (only statistically significant parameters)
3. Model selection visible during data collection

## Proposed Changes

### 1. Default Model Selection
- Use complete model (all Table 2 parameters) as default
- Remove model selection from front page
- Move model toggle to results page only

### 2. Component Changes

#### RetinalCalculator.jsx
```jsx
const RetinalCalculator = () => {
    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">Retinal Detachment Risk Calculator</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Based on the <a href="https://www.beavrs.org/">UK BEAVRS</a> database <a href="https://www.nature.com/articles/s41433-023-02388-0">study</a>
                    </p>

                    {/* Mobile version */}
                    <div className="md:hidden">
                        <MobileRetinalCalculator modelType={MODEL_TYPE.FULL} />
                    </div>

                    {/* Desktop version */}
                    <div className="hidden md:block">
                        <DesktopRetinalCalculator modelType={MODEL_TYPE.FULL} />
                    </div>
                </div>
            </div>
        </div>
    );
};
```

#### RiskResults.jsx
```jsx
const RiskResults = ({ risk }) => {
    const [modelType, setModelType] = useState(MODEL_TYPE.FULL);

    return (
        <div>
            {/* Model selection toggle */}
            <div className="mb-6">
                <ModelToggle 
                    modelType={modelType}
                    onChange={setModelType}
                />
            </div>

            {/* Risk calculation results */}
            <div className="risk-results">
                {/* ... existing results display ... */}
            </div>
        </div>
    );
};
```

### 3. Data Flow Changes

1. Data Collection
   - Collect all parameters without showing model information
   - Store complete data for both calculation methods
   - Maintain clean interface focused on data entry

2. Results Display
   - Show model toggle in results view
   - Allow switching between models after calculation
   - Display clear explanation of model differences

### 4. Implementation Steps

1. Update RetinalCalculator.jsx
   - Remove ModelToggle from main view
   - Set default model to FULL
   - Pass modelType to mobile/desktop components

2. Update RiskResults.jsx
   - Add local state for model selection
   - Move ModelToggle component into results
   - Update results display based on selected model

3. Update Mobile/Desktop Components
   - Remove model selection logic
   - Use passed modelType prop
   - Maintain data collection for all parameters

4. Update Tests
   - Modify RetinalCalculator tests for default model
   - Add RiskResults tests for model switching
   - Update mobile/desktop view tests

### 5. Benefits

1. Simplified User Experience
   - Cleaner data collection interface
   - Focus on parameter input
   - Model selection when relevant (results)

2. Better Data Collection
   - All parameters collected regardless of model
   - No confusion about parameter significance
   - Complete data for analysis

3. Improved Results Display
   - Clear model comparison
   - Easy switching between models
   - Better understanding of differences

### 6. Technical Considerations

1. State Management
   - Model selection managed in results component
   - Clean separation of concerns
   - Simplified data flow

2. Performance
   - Calculate both models when needed
   - Cache results if necessary
   - Smooth model switching

3. Testing
   - Verify default model behavior
   - Test model switching in results
   - Maintain test coverage

### 7. Next Steps

1. Remove ModelToggle from RetinalCalculator
2. Update RetinalCalculator to use FULL model default
3. Move ModelToggle to RiskResults
4. Update tests to reflect changes
5. Verify all functionality works as expected

### 8. Success Criteria

1. Clean data collection interface
2. All parameters collected
3. Model selection available in results
4. Smooth switching between models
5. Clear explanation of differences
6. All tests passing

### 9. Documentation Updates

1. Update component documentation
2. Document model selection behavior
3. Update test documentation
4. Add user instructions
5. Document calculation differences

### 10. Future Considerations

1. Results Caching
   - Cache both model calculations
   - Improve model switching performance
   - Maintain data consistency

2. Visual Feedback
   - Add transitions for model switching
   - Highlight calculation differences
   - Improve user understanding

3. Analytics
   - Track model usage
   - Analyze parameter patterns
   - Gather user feedback
