# RiskInputForm Test Fixes Required

## Overview
After reviewing all RiskInputForm test files and unified-input-plan.md, several issues need to be addressed to make all tests pass. These changes reflect both accessibility improvements and the move to support dual model results.

## 1. Input Option Updates

### Gauge Selection
- Update tests to expect all gauge options from Table 2:
```javascript
const expectedGaugeOptions = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' }
];
```

### Tamponade Selection
- Update tests to expect all tamponade options from Table 2:
```javascript
const expectedTamponadeOptions = [
    { value: 'sf6', label: 'SF6 gas' },
    { value: 'c2f6', label: 'C2F6 gas' },
    { value: 'c3f8', label: 'C3F8 gas' },
    { value: 'air', label: 'Air' },
    { value: 'light_oil', label: 'Light oil' },
    { value: 'heavy_oil', label: 'Heavy oil' }
];
```

## 2. Accessibility Improvements

### Form Role and Labels
- Add role="form" to form element
- Add proper label associations with htmlFor/id
- Add aria-errormessage attributes for error messages
- Add aria-required="true" to required fields

### ARIA Attributes
```jsx
<form role="form">
  <label htmlFor="age-input">Age (years)</label>
  <input
    id="age-input"
    aria-required="true"
    aria-errormessage="age-error"
    aria-invalid={!isAgeValid(age)}
  />
  <p id="age-error" role="alert">Age must be between 18 and 100</p>
</form>
```

## 3. Mobile Layout Enhancements

### ID Suffixes
- Add -mobile suffix to input IDs in mobile layout
```jsx
<input
  id={`age-input${isMobile ? '-mobile' : ''}`}
  // ...other props
/>
```

### Form Element
- Ensure form element is present in mobile layout
- Add proper role and ARIA attributes
- Handle form submission and reset properly

## 4. Error State Management

### Error Message Association
- Add unique IDs to error messages
- Associate error messages with inputs using aria-errormessage
- Add role="alert" to error messages
```jsx
<div>
  <input
    aria-errormessage={`${id}-error`}
    aria-invalid={hasError}
  />
  {hasError && (
    <p id={`${id}-error`} role="alert" className="text-red-600">
      {errorMessage}
    </p>
  )}
</div>
```

### Error Styling
- Add consistent error classes (bg-red-50, border-red-300)
- Maintain error styling during state changes
- Handle combined error and disabled states

## 5. Disabled State Implementation

### Visual Styling
- Add opacity-50 and cursor-not-allowed classes to disabled elements
- Maintain disabled styling during view transitions
- Handle combined disabled and error states
```jsx
<input
  className={`
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${error ? 'bg-red-50 border-red-300' : ''}
  `}
  disabled={disabled}
/>
```

### State Preservation
- Maintain disabled state during view changes
- Preserve disabled styling after form reset
- Handle disabled state with other states (error, hover, etc.)

## 6. Form Reset Functionality

### Reset Handler
```jsx
const handleReset = () => {
  // Clear error states
  setErrors({});
  
  // Reset to initial values
  setAge('');
  setPvrGrade('');
  setVitrectomyGauge('25g');
  
  // Maintain disabled state if present
  // Call parent reset handler
  onReset?.();
};
```

### State Preservation
- Clear error states on reset
- Maintain disabled state if present
- Reset to initial values
- Preserve parent-controlled state

## 7. Combined State Handling

### Multiple State Classes
```jsx
const getInputClasses = (hasError, isDisabled) => {
  return [
    hasError ? 'bg-red-50 border-red-300' : 'border-gray-300',
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    'w-full p-2 border rounded-md',
    'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  ].filter(Boolean).join(' ');
};
```

### State Hierarchy
- Error states should not appear when disabled
- Disabled state takes precedence over hover states
- Maintain proper state order during transitions

## Implementation Priority

1. High Priority
   - Update input option tests for dual model support
   - Form role and accessibility attributes
   - Error message association

2. Medium Priority
   - Mobile layout improvements
   - Form reset functionality
   - Combined state handling

3. Low Priority
   - Mobile ID suffixes
   - State transition animations
   - Additional error states

## Testing Strategy

1. Update Tests for Dual Model Support
   - Modify gauge option tests
   - Update tamponade option tests
   - Verify data collection for all values

2. Implement Accessibility Changes
   - Add form roles and ARIA attributes
   - Test with screen readers
   - Verify error message association

3. Add State Management
   - Implement form reset
   - Add disabled state styling
   - Handle combined states

## Notes
- All changes should support dual model functionality
- Focus on accessibility and user experience
- Keep state management simple and predictable
- Document any assumptions or limitations
- Follow React and ARIA best practices
