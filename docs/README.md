# RCRD Documentation

This directory contains the auto-generated documentation for the Retinal Calculator Retinal Detachment (RCRD) application.

## Documentation Structure

- `components.md`: Documentation for React components, including props, examples, and usage information
- `utils.md`: Documentation for utility functions and helper modules

## Key Areas Documented

### Components
- RetinalCalculator: Main application component
- Form Components: CryotherapySelection, GaugeSelection, TamponadeSelection
- UI Components: Toggle, Clock Face components
- Layout Components: Mobile and Desktop views

### Utilities
- Risk Calculations: Core logic for calculating detachment risk
- Clock Face Utils: Functions for handling clock hour calculations and segment mapping
- Formatting Utils: Functions for formatting detachment descriptions and results

## Maintaining Documentation

The documentation is automatically generated from JSDoc comments in the source code. To maintain and update the documentation:

1. Add JSDoc comments to your code following the existing patterns
2. Run `npm run docs` to regenerate documentation
3. Commit both code and documentation changes

### JSDoc Comment Examples

For Components:
```jsx
/**
 * @module ComponentName
 * @description Brief description of the component
 * 
 * @component
 * @example
 * return (
 *   <ComponentName prop="value" />
 * )
 */
```

For Utilities:
```javascript
/**
 * @description Function description
 * @param {type} paramName - Parameter description
 * @returns {type} Description of return value
 * @example
 * const result = functionName(param)
 */
```

## Generating Documentation

To regenerate documentation after making changes:

1. Run `npm run docs` to generate all documentation
2. Run `npm run docs:components` to only update component documentation
3. Run `npm run docs:utils` to only update utility documentation

The documentation uses jsdoc-to-markdown for generation, which creates clean, readable markdown files that can be viewed directly on GitHub or in any markdown viewer.
