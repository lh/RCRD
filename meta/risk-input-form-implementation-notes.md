# RiskInputForm Implementation Notes

## Current Issues

### 1. Age Input Accessibility
- Missing id/htmlFor association between label and input
- Missing role="spinbutton"
- Missing aria-label
- Missing aria-required="true"
- Missing aria-valuemin/aria-valuemax

### 2. Form Submission
- handleSubmit doesn't return explicit false value
- Only prevents default but doesn't return a value

### 3. Age Validation
- Current behavior allows 0-120
- Should be 18-100 for adult patients
- Missing validation error messages
- Missing aria-invalid state

## Required Changes

### 1. Age Input Accessibility
```jsx
<label 
  htmlFor="age-input"
  className="block text-sm font-medium text-gray-700"
>
  Age (years)
</label>
<input
  id="age-input"
  type="number"
  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${!age ? 'bg-red-50 border-red-300' : 'border-gray-300'}`}
  value={age}
  onChange={(e) => setAge(e.target.value)}
  min="18"
  max="100"
  placeholder="Enter age"
  required
  role="spinbutton"
  aria-label="Age (years)"
  aria-required="true"
  aria-valuemin="18"
  aria-valuemax="100"
  aria-invalid={!age || age < 18 || age > 100}
/>
```

### 2. Form Submission
```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  return false; // Explicitly return false
};
```

### 3. Age Validation
```jsx
const [ageError, setAgeError] = useState('');

const validateAge = (value) => {
  if (!value) {
    setAgeError('Age is required');
    return false;
  }
  if (value < 18) {
    setAgeError('Age must be at least 18');
    return false;
  }
  if (value > 100) {
    setAgeError('Age must be 100 or less');
    return false;
  }
  setAgeError('');
  return true;
};

const handleAgeChange = (e) => {
  const value = e.target.value;
  setAge(value);
  validateAge(value);
};
```

### 4. Mobile Layout
- Add -mobile suffix to age input id in mobile layout
- Maintain consistent accessibility attributes in both layouts

## Rationale

1. Accessibility Improvements
   - Screen reader support is crucial for medical applications
   - ARIA attributes provide better context for assistive technologies
   - Proper label associations improve usability

2. Age Validation
   - Medical context requires adult patients
   - Clear validation messages help users understand requirements
   - aria-invalid helps screen readers announce validation state

3. Form Submission
   - Consistent return value helps with form handling
   - Explicit false return prevents unintended submissions

## Test Status

The following tests are skipped pending implementation:

1. "renders age input with validation"
   - Needs proper accessibility attributes
   - Needs proper label association
   - Needs ARIA attributes

2. "calls setAge when input changes"
   - Needs reliable element selection
   - Needs proper label association

3. "validates age is between 18 and 100"
   - Needs age range validation
   - Needs validation error messages
   - Needs aria-invalid state

4. "renders all inputs in mobile layout"
   - Needs consistent accessibility in mobile layout
   - Needs proper ARIA attributes

5. "renders age and PVR inputs when position is left"
   - Needs reliable element selection
   - Needs proper label association

6. "prevents default form submission in mobile view"
   - Needs explicit false return
   - Needs proper form submission handling

## Implementation Steps

1. Add Accessibility Attributes
   - Add id/htmlFor associations
   - Add ARIA attributes
   - Add proper roles

2. Update Age Validation
   - Change min/max values
   - Add validation logic
   - Add error messages
   - Add aria-invalid state

3. Fix Form Submission
   - Update handleSubmit
   - Add explicit return value

4. Update Mobile Layout
   - Add consistent IDs
   - Maintain accessibility attributes

5. Update Tests
   - Enable skipped tests
   - Verify accessibility improvements
   - Test validation behavior

## Notes
- All changes follow ARIA best practices
- Focus on accessibility and usability
- Maintain consistent behavior across layouts
- Document any assumptions or limitations
