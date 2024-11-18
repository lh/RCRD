# RiskInputForm Test Learnings

## Key Insights

### 1. State Management in Tests
- Using mock functions (jest.fn()) for state setters isn't enough for testing state changes
- Need to use real state management to properly test component behavior
- Solution: Created a TestWrapper component with useState hooks to manage real state

```jsx
const TestWrapper = ({ position = 'left' }) => {
  const [age, setAge] = useState('');
  const [pvrGrade, setPvrGrade] = useState('');
  const [vitrectomyGauge, setVitrectomyGauge] = useState('');

  return (
    <RiskInputForm
      position={position}
      age={age}
      setAge={setAge}
      pvrGrade={pvrGrade}
      setPvrGrade={setPvrGrade}
      vitrectomyGauge={vitrectomyGauge}
      setVitrectomyGauge={setVitrectomyGauge}
    />
  );
};
```

### 2. Async State Updates
- React state updates are asynchronous
- Need to use act() and waitFor() to properly test state changes
- Solution: Wrapped state changes in act() and assertions in waitFor()

```jsx
await act(async () => {
  fireEvent.change(input, { target: { value: '50' } });
});

await waitFor(() => {
  expect(input).toHaveAttribute('aria-invalid', 'false');
});
```

### 3. Component Position Handling
- The RiskInputForm component renders different sections based on position prop
- Tests need to provide the correct position prop to test specific sections
- Solution: Pass position="right" to test vitrectomy gauge section

```jsx
test('radio group has proper ARIA attributes', () => {
  render(<TestWrapper position="right" />);
  const radioGroup = screen.getByRole('radiogroup', { name: /vitrectomy gauge/i });
  expect(radioGroup).toHaveAttribute('aria-required', 'true');
});
```

### 4. Validation State Testing
- Age validation involves multiple states (empty, valid, invalid)
- Need to test both the validation logic and its effect on ARIA attributes
- Solution: Test sequence of state changes with different values

```jsx
// Initially invalid (empty)
expect(input).toHaveAttribute('aria-invalid', 'true');

// Valid age
await act(async () => {
  fireEvent.change(input, { target: { value: '50' } });
});
await waitFor(() => {
  expect(input).toHaveAttribute('aria-invalid', 'false');
});

// Invalid age
await act(async () => {
  fireEvent.change(input, { target: { value: '17' } });
});
await waitFor(() => {
  expect(input).toHaveAttribute('aria-invalid', 'true');
});
```

## Best Practices Identified

1. State Management
   - Use real state management in tests when testing state changes
   - Create wrapper components to manage state when needed
   - Don't rely solely on mock functions for state setters

2. Async Testing
   - Always wrap state changes in act()
   - Use waitFor() for assertions that depend on state updates
   - Be explicit about what you're waiting for

3. Component Structure
   - Test components in all their possible configurations
   - Pass appropriate props to test specific sections
   - Consider how props affect component rendering

4. Validation Testing
   - Test the full range of validation states
   - Verify both the validation logic and UI feedback
   - Include edge cases in validation tests

## Future Improvements

1. Skipped Tests
   - Several ARIA-related tests are currently skipped
   - Could be enabled after implementing additional accessibility features
   - Tests are ready to use once features are implemented

2. Test Organization
   - Tests are split by feature (age input, PVR grade, vitrectomy gauge)
   - Could further split into separate files for better organization
   - Consider creating shared test utilities

3. Error Handling
   - Could add tests for error states
   - Could test form submission validation
   - Could add tests for edge cases

4. Accessibility Testing
   - Could add more comprehensive ARIA testing
   - Could test keyboard navigation
   - Could add screen reader testing

## Notes for Future Development

1. When implementing new features:
   - Start with the skipped tests as requirements
   - Follow the established patterns for state management
   - Maintain the same level of test coverage

2. When adding new tests:
   - Use the TestWrapper pattern for state management
   - Follow the async testing patterns
   - Group related tests logically

3. When refactoring:
   - Keep the test structure as a guide
   - Maintain the separation of concerns
   - Preserve the accessibility features
