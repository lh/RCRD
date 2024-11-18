# HTML vs JSX Attribute Testing

## Issue
When testing HTML attributes in React components, there's an important distinction between JSX property names and their corresponding HTML attribute names. This can lead to confusing test failures when using `toHaveAttribute()`.

## Example
```jsx
// In React JSX, we use htmlFor:
<label htmlFor="age-input">Age</label>

// But when testing with toHaveAttribute(), we need to use 'for':
expect(label).toHaveAttribute('for', 'age-input');  // ✅ Correct
expect(label).toHaveAttribute('htmlFor', 'age-input');  // ❌ Incorrect
```

## Common JSX to HTML Attribute Mappings
1. Label Association
   - JSX: `htmlFor`
   - HTML: `for`
   - Test: `toHaveAttribute('for', value)`

2. Class Names
   - JSX: `className`
   - HTML: `class`
   - Test: `toHaveAttribute('class', value)`

3. Tab Index
   - JSX: `tabIndex`
   - HTML: `tabindex`
   - Test: `toHaveAttribute('tabindex', value)`

## Debugging Tips
If a toHaveAttribute test is failing unexpectedly:

1. Use getAttribute() to check both versions:
```js
console.log('JSX name:', element.getAttribute('htmlFor'));
console.log('HTML name:', element.getAttribute('for'));
```

2. Inspect the rendered HTML:
```js
console.log('Element:', element);
console.log('HTML:', element.outerHTML);
```

## Best Practices

1. Test Attributes
   - Use HTML attribute names with toHaveAttribute()
   - Remember that React converts camelCase JSX props to lowercase HTML attributes

2. Component Props
   - Continue using JSX property names in your React components
   - React handles the conversion to HTML attributes automatically

3. Documentation
   - Document this distinction in test files
   - Add comments when testing attributes that have different JSX/HTML names

## Example Test Pattern
```jsx
describe('Label Accessibility', () => {
  test('label is properly associated with input', () => {
    render(<MyComponent />);
    
    const label = screen.getByText('Age');
    const input = screen.getByLabelText('Age');
    
    // Use HTML 'for' attribute name, not JSX 'htmlFor'
    expect(label).toHaveAttribute('for', 'age-input');
    expect(input).toHaveAttribute('id', 'age-input');
  });
});
```

## Related Resources
- [React DOM Elements Documentation](https://reactjs.org/docs/dom-elements.html)
- [Testing Library toHaveAttribute Documentation](https://testing-library.com/docs/queries/about/#tohaveattribute)
- [HTML vs JSX Differences](https://reactjs.org/docs/dom-elements.html#differences-in-attributes)

## Impact on Test Development
Understanding this distinction helps:
1. Write more accurate tests
2. Debug attribute-related test failures
3. Maintain consistency between component props and tests
4. Avoid confusion about seemingly missing attributes

Remember: When testing, think in terms of the final HTML output, not the JSX input.
