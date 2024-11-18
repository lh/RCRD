# Risk Coefficient Discrepancies Analysis

[Previous content remains unchanged until UI Impact Analysis section...]

## UI Impact Analysis

After reviewing RiskInputForm.test.jsx, we found that removing unpublished gauge coefficients will have significant UI implications:

### Current UI Implementation
```javascript
// From riskCalculatorConstants.js
export const gaugeOptions = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' },
    { value: 'not_recorded', label: 'Not recorded' }
];
```

The RiskInputForm component:
1. Displays all gauge options as radio buttons
2. Has tests verifying each option is rendered
3. Handles gauge selection through setVitrectomyGauge callback
4. Supports both desktop and mobile layouts

### Required UI Changes

1. **Gauge Selection Options**
   - Remove 23g, 27g, and not_recorded options
   - Keep only validated options (20g and 25g)
   - Add new "Other" option using reference value (20g)
   ```javascript
   export const gaugeOptions = [
       { value: '20g', label: '20 gauge' },
       { value: '25g', label: '25 gauge' },
       { value: 'other', label: 'Other gauge (uses 20g reference)' }
   ];
   ```

2. **Form Component Updates**
   - Update RiskInputForm tests to reflect new options
   - Add explanation text for "Other" option
   - Add warning when "Other" is selected
   - Update mobile layout tests

3. **Migration Handling**
   - Add UI for viewing original gauge selection
   - Show recalculated risk with reference value
   - Highlight when reference substitution occurs

4. **Documentation Updates**
   - Add UI notes explaining gauge limitations
   - Document reason for reference value use
   - Update help text and tooltips

### Test Updates Required

1. **RiskInputForm.test.jsx**
   ```javascript
   describe('Vitrectomy Gauge Selection', () => {
     test('renders only validated gauge options', () => {
       render(<RiskInputForm {...mockProps} position="right" />);
       
       // Should only find validated options
       expect(screen.getByRole('radio', { name: '20 gauge' })).toBeInTheDocument();
       expect(screen.getByRole('radio', { name: '25 gauge' })).toBeInTheDocument();
       expect(screen.getByRole('radio', { name: 'Other gauge (uses 20g reference)' })).toBeInTheDocument();
       
       // Should not find removed options
       expect(screen.queryByRole('radio', { name: '23 gauge' })).not.toBeInTheDocument();
       expect(screen.queryByRole('radio', { name: '27 gauge' })).not.toBeInTheDocument();
       expect(screen.queryByRole('radio', { name: 'Not recorded' })).not.toBeInTheDocument();
     });

     test('shows warning when selecting Other gauge', () => {
       render(<RiskInputForm {...mockProps} position="right" />);
       
       const otherOption = screen.getByRole('radio', { name: /other gauge/i });
       fireEvent.click(otherOption);
       
       expect(screen.getByText(/using 20g reference value/i)).toBeInTheDocument();
     });
   });
   ```

2. **Mobile Layout Tests**
   ```javascript
   test('renders validated gauge options in mobile layout', () => {
     render(<RiskInputForm {...mockProps} isMobile={true} />);
     
     expect(screen.getByRole('radio', { name: '20 gauge' })).toBeInTheDocument();
     expect(screen.getByRole('radio', { name: '25 gauge' })).toBeInTheDocument();
     expect(screen.getByRole('radio', { name: 'Other gauge (uses 20g reference)' })).toBeInTheDocument();
   });
   ```

### Implementation Priority

1. **Phase 1: Warning Mode**
   - Add warnings for non-validated gauges
   - Keep all options but highlight reference substitution
   - Update help text

2. **Phase 2: Strict Mode**
   - Remove non-validated options
   - Add "Other" option
   - Update all tests
   - Add explanation text

3. **Phase 3: Migration Support**
   - Add original value display
   - Show recalculation explanation
   - Update mobile layout

4. **Phase 4: Documentation**
   - Update UI text
   - Add tooltips
   - Update help documentation

[Rest of previous content remains unchanged...]
