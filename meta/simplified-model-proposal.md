# Simplified Model Proposal Based on BEAVRS Paper

## Overview

Based on the BEAVRS paper, we should revise our implementation to:
1. Only use statistically significant coefficients in calculations
2. Still allow recording of all values for data collection
3. Simplify the UI to make the model's behavior clear to users

## Proposed Changes

### 1. Vitrectomy Gauge Selection

#### Current Implementation
```javascript
export const gaugeOptions = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' },
    { value: 'not_recorded', label: 'Not recorded' }
];
```

#### Proposed Implementation
```javascript
// For calculation
export const gaugeOptions = [
    { value: '25g', label: '25 gauge' },
    { value: 'other', label: 'Not 25 gauge' }  // Uses 20g coefficient
];

// For data recording (separate from calculation)
export const detailedGaugeOptions = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' }
];
```

#### UI Changes
1. Primary toggle:
   - Default: "25 gauge" (most common)
   - Toggle: "Not 25 gauge" (uses 20g coefficient)

2. Optional detailed selection:
   - Only shown if "Not 25 gauge" is selected
   - Records actual gauge for data collection
   - Doesn't affect calculation
   - Help text explains this behavior

### 2. Tamponade Selection

#### Current Implementation
Uses all coefficients from the paper.

#### Proposed Implementation
```javascript
// Primary selection (affects calculation)
export const tamponadeOptions = [
    { value: 'c2f6', label: 'C2F6 or other' },  // Default
    { value: 'sf6', label: 'SF6' },
    { value: 'oil', label: 'Oil' }
];

// UI Behavior:
// 1. Default to C2F6 (reference category)
// 2. Show SF6 toggle unless Oil is selected
// 3. If Oil is selected, hide SF6 option
```

### 3. Risk Calculation Display

Update RiskResults component to clearly show:
1. Which factors affected the calculation
2. Which values were recorded but not used
3. Why certain coefficients were applied

Example:
```javascript
const steps = [
    // ... other steps ...
    {
        label: 'Vitrectomy gauge',
        value: gauge === '25g' ? -0.885 : 0.0,
        detail: gauge === '25g' 
            ? '(25g, odds ratio 0.413)'
            : `(${actualGauge} recorded, using 20g reference value)`,
        recorded: actualGauge
    }
];
```

## Implementation Plan

### 1. Data Model Updates
```javascript
// Types for recording vs calculation
interface GaugeData {
    calculationValue: '25g' | 'other';
    recordedValue?: '20g' | '23g' | '25g' | '27g';
}

interface TamponadeData {
    calculationValue: 'c2f6' | 'sf6' | 'oil';
    recordedValue?: string;
}
```

### 2. UI Components

#### Gauge Selection
```jsx
const GaugeSelection = ({ onChange }) => {
    const [is25g, setIs25g] = useState(true);
    const [detailedGauge, setDetailedGauge] = useState(null);

    return (
        <div>
            <Toggle
                checked={is25g}
                onChange={setIs25g}
                labels={{ checked: '25 gauge', unchecked: 'Not 25 gauge' }}
            />
            
            {!is25g && (
                <div className="mt-2">
                    <label>Record actual gauge (for data collection only):</label>
                    <select 
                        value={detailedGauge} 
                        onChange={e => setDetailedGauge(e.target.value)}
                    >
                        {detailedGaugeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-600">
                        * This selection is recorded but does not affect the risk calculation
                    </p>
                </div>
            )}
        </div>
    );
};
```

#### Tamponade Selection
```jsx
const TamponadeSelection = ({ onChange }) => {
    const [useOil, setUseOil] = useState(false);
    const [useSF6, setUseSF6] = useState(false);

    return (
        <div>
            <Toggle
                checked={useOil}
                onChange={setUseOil}
                labels={{ checked: 'Oil', unchecked: 'Gas' }}
            />
            
            {!useOil && (
                <Toggle
                    checked={useSF6}
                    onChange={setUseSF6}
                    labels={{ checked: 'SF6', unchecked: 'C2F6 or other' }}
                />
            )}
        </div>
    );
};
```

### 3. Risk Display Updates
```jsx
const RiskResults = ({ risk }) => {
    return (
        <div>
            {/* ... probability display ... */}
            
            <div className="calculation-steps">
                {risk.steps.map(step => (
                    <div key={step.label}>
                        <div className="flex justify-between">
                            <span>{step.label}:</span>
                            <span>{step.value}</span>
                        </div>
                        {step.detail && (
                            <p className="text-sm text-gray-600">{step.detail}</p>
                        )}
                        {step.recorded && step.recorded !== step.calculationValue && (
                            <p className="text-sm text-blue-600">
                                Recorded value: {step.recorded}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
```

## Benefits

1. **Statistical Validity**
   - Uses only significant coefficients
   - Maintains model accuracy
   - Clear about reference values

2. **Data Collection**
   - Records actual values used
   - Supports future analysis
   - Doesn't affect current calculations

3. **User Experience**
   - Simpler interface
   - Clear about what affects calculation
   - Transparent about reference values

4. **Future Proofing**
   - Easy to update if new coefficients validated
   - Maintains data for retrospective analysis
   - Clear separation of recording vs calculation

## Next Steps

1. Update riskCalculatorConstants.js with new options
2. Create new UI components
3. Modify risk calculation to use simplified coefficients
4. Update tests to verify both calculation and recording
5. Add clear documentation about model behavior

Would you like me to proceed with implementing any of these changes?
