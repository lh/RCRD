# Toggle Component

A fully accessible radio button toggle component that supports keyboard navigation, error states, and mobile/desktop layouts.

## Features

- Binary choice selection (Yes/No, On/Off, etc.)
- Keyboard navigation (arrow keys, space, enter)
- Error state handling
- Help text support
- Mobile/desktop layout support
- Full accessibility support
- Focus management
- Consistent styling with RiskInputForm

## Usage

### Basic Usage

```jsx
const [isEnabled, setIsEnabled] = useState(false);

<Toggle
    id="feature-toggle"
    name="feature"
    checked={isEnabled}
    onChange={setIsEnabled}
    labels={{ checked: 'Enabled', unchecked: 'Disabled' }}
    ariaLabel="Feature Toggle"
/>
```

### With Help Text

```jsx
<Toggle
    id="gauge-toggle"
    name="gauge"
    checked={is25Gauge}
    onChange={setIs25Gauge}
    labels={{ checked: '25 gauge', unchecked: 'Not 25 gauge' }}
    ariaLabel="Vitrectomy Gauge Selection"
    helpText="Select 25 gauge for modern vitrectomy"
/>
```

### With Error State

```jsx
<Toggle
    id="required-toggle"
    name="required-field"
    checked={selected}
    onChange={setSelected}
    labels={{ checked: 'Yes', unchecked: 'No' }}
    ariaLabel="Required Selection"
    required={true}
    error={!selected}
    errorMessage="This field is required"
/>
```

### Mobile Layout

```jsx
<Toggle
    id="mobile-toggle"
    name="mobile-setting"
    checked={enabled}
    onChange={setEnabled}
    labels={{ checked: 'On', unchecked: 'Off' }}
    ariaLabel="Mobile Setting"
    isMobile={true}
/>
```

### Disabled State

```jsx
<Toggle
    id="disabled-toggle"
    name="disabled-setting"
    checked={value}
    onChange={setValue}
    labels={{ checked: 'Yes', unchecked: 'No' }}
    ariaLabel="Disabled Setting"
    disabled={true}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| id | string | Yes | - | Unique identifier for the toggle |
| name | string | Yes | - | Form field name |
| checked | boolean | Yes | - | Current toggle state |
| onChange | function | Yes | - | Callback when toggle changes |
| labels | object | No | `{ checked: 'Yes', unchecked: 'No' }` | Custom labels for options |
| className | string | No | '' | Additional CSS classes |
| disabled | boolean | No | false | Whether the toggle is disabled |
| helpText | string | No | - | Help text shown below the toggle |
| isMobile | boolean | No | false | Whether to use mobile layout |
| required | boolean | No | false | Whether the field is required |
| ariaLabel | string | Yes | - | Accessible label for the toggle |
| error | boolean | No | false | Whether the field has an error |
| errorMessage | string | No | - | Error message to display |

## Keyboard Navigation

- **Tab**: Move focus to the toggle
- **Space/Enter**: Select focused option
- **Arrow Left/Up**: Select previous option
- **Arrow Right/Down**: Select next option

## Accessibility

- Uses proper ARIA attributes (`role="radiogroup"`, `aria-required`, `aria-label`)
- Supports keyboard navigation
- Connects help text and error messages via `aria-describedby`
- Manages focus states
- Provides error states with proper ARIA attributes
- Uses semantic HTML elements

## Styling

- Matches RiskInputForm's styling patterns
- Uses Tailwind CSS classes
- Supports error states with red highlighting
- Provides focus rings and borders
- Handles disabled states with proper styling

## Example Implementation for Gauge Selection

```jsx
const GaugeSelection = () => {
    const [is25Gauge, setIs25Gauge] = useState(true);
    const [detailedGauge, setDetailedGauge] = useState(null);

    return (
        <div className="space-y-4">
            <Toggle
                id="gauge-toggle"
                name="gauge"
                checked={is25Gauge}
                onChange={setIs25Gauge}
                labels={{ checked: '25 gauge', unchecked: 'Not 25 gauge' }}
                ariaLabel="Vitrectomy Gauge Selection"
                helpText="Select 25 gauge for modern vitrectomy"
            />

            {!is25Gauge && (
                <div className="mt-2">
                    <label className="text-sm text-gray-600">
                        Record actual gauge (for data collection only):
                    </label>
                    <select 
                        value={detailedGauge} 
                        onChange={e => setDetailedGauge(e.target.value)}
                        className="mt-1 block w-full"
                    >
                        <option value="20g">20 gauge</option>
                        <option value="23g">23 gauge</option>
                        <option value="27g">27 gauge</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                        * This selection is recorded but does not affect the risk calculation
                    </p>
                </div>
            )}

            {/* Example of displaying the selected gauge */}
            <p className="text-sm text-gray-600">
                Using coefficient for: {is25Gauge ? '25 gauge' : '20 gauge (reference)'}
            </p>
        </div>
    );
};
```

## Example Implementation for Tamponade Selection

```jsx
const TamponadeSelection = () => {
    const [useOil, setUseOil] = useState(false);
    const [useSF6, setUseSF6] = useState(false);

    // Calculate the actual tamponade value for risk calculation
    const getTamponadeValue = () => {
        if (useOil) return 'oil';
        if (useSF6) return 'sf6';
        return 'c2f6'; // Default/reference value
    };

    return (
        <div className="space-y-4">
            {/* Oil Selection */}
            <Toggle
                id="oil-toggle"
                name="oil"
                checked={useOil}
                onChange={(checked) => {
                    setUseOil(checked);
                    // Reset SF6 when oil is selected
                    if (checked) {
                        setUseSF6(false);
                    }
                }}
                labels={{ checked: 'Oil', unchecked: 'Gas' }}
                ariaLabel="Tamponade Type Selection"
                helpText="Select oil for complex cases requiring longer tamponade"
            />

            {/* SF6 Toggle - Only shown when oil is not selected */}
            {!useOil && (
                <Toggle
                    id="sf6-toggle"
                    name="sf6"
                    checked={useSF6}
                    onChange={setUseSF6}
                    labels={{ checked: 'SF6', unchecked: 'C2F6 or other' }}
                    ariaLabel="Gas Type Selection"
                    helpText="Select SF6 for shorter-acting gas tamponade"
                    className="ml-4" // Indent to show relationship
                />
            )}

            {/* Example of displaying the selected tamponade */}
            <p className="text-sm text-gray-600">
                Selected tamponade: {getTamponadeValue()}
                {!useOil && !useSF6 && " (using C2F6 reference value)"}
            </p>

            {/* Example of recording detailed data */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700">Data Recording</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Calculation using: {getTamponadeValue()}
                    <br />
                    {useOil ? (
                        "Oil coefficient will be used in calculation"
                    ) : useSF6 ? (
                        "SF6 coefficient will be used in calculation"
                    ) : (
                        "Using C2F6 (reference) coefficient in calculation"
                    )}
                </p>
            </div>
        </div>
    );
};
```

### Key Features of Tamponade Selection

1. **Conditional Rendering**
   - SF6 toggle only appears when oil is not selected
   - Maintains clear user interface
   - Prevents invalid combinations

2. **State Management**
   - Manages two independent toggles
   - Automatically resets SF6 when oil is selected
   - Provides clear default state (C2F6)

3. **User Feedback**
   - Shows current selection
   - Indicates when using reference value
   - Provides help text for each option

4. **Accessibility**
   - Proper ARIA labels
   - Logical tab order
   - Clear relationship between toggles

5. **Visual Hierarchy**
   - Indentation shows relationship
   - Clear grouping of options
   - Consistent styling

### Usage in RiskInputForm

```jsx
const RiskInputForm = ({ /* ... other props ... */ }) => {
    const [useOil, setUseOil] = useState(false);
    const [useSF6, setUseSF6] = useState(false);

    // Calculate risk coefficient based on tamponade
    const getTamponadeCoefficient = () => {
        if (useOil) return 0.670;  // Oil coefficient
        if (useSF6) return 0.428;  // SF6 coefficient
        return 0.0;  // C2F6 reference value
    };

    return (
        <div className="space-y-6">
            {/* Other form fields */}
            
            <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tamponade Selection
                </h3>
                <TamponadeSelection
                    useOil={useOil}
                    setUseOil={setUseOil}
                    useSF6={useSF6}
                    setUseSF6={setUseSF6}
                />
            </div>

            {/* Rest of the form */}
        </div>
    );
};
