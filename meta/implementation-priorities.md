# Implementation Priorities

## High Priority

### 1. Test Organization Restructuring
- Move tests closer to their implementation files
- Adopt consistent test file organization:
  * Place test files within component directories
  * Name pattern: ComponentName.test.jsx
  * Group related test files (e.g., ComponentName.rendering.test.jsx)
- Benefits:
  * Better discoverability
  * Clear relationship between tests and code
  * Easier maintenance
  * Follows React community best practices
Status: Ready for implementation

### 2. RiskInputForm Accessibility
- Add proper label associations
- Add ARIA attributes
- Implement age validation (18-100)
- Fix form submission handling
Status: Tests written and skipped, implementation notes ready

### 3. Code Cleanup
- Remove oldClockFace.jsx
- Remove debug logging from Segment.jsx
- Remove duplicate clockCalculations.js
- Remove legacy clockTests.js
Status: Documentation ready, no blocking issues

## Medium Priority

### 1. Component Improvements
- InterpolateSegments behavior enhancements
- Clock hour notation improvements
- Segment component refinements
- Consolidate clock utility files
Status: Tests passing, implementation notes ready

### 2. Test Coverage
- Add edge case tests
- Improve error state coverage
- Add visual regression tests
- Standardize test patterns across components
Status: Core functionality covered, enhancements planned

### 3. Documentation
- Update component documentation
- Add usage examples
- Document test patterns
- Document component hierarchy
Status: In progress, being updated with changes

## Low Priority

### 1. Performance Optimization
- Optimize test runs
- Reduce setup overhead
- Improve mock efficiency
- Consolidate duplicate functionality
Status: No current issues, future improvement

### 2. Code Organization
- Review scratch directory
- Clean up unused utilities
- Standardize file structure
- Consolidate styles
- Organize hooks consistently
Status: No blocking issues, maintenance task

## Test Organization Strategy

### 1. File Location
- Tests should be located within their component directories
- Example structure:
  ```
  components/
  └── MyComponent/
      ├── MyComponent.jsx
      ├── MyComponent.test.jsx
      ├── MyComponent.rendering.test.jsx
      ├── MyComponent.interactions.test.jsx
      └── __tests__/                   # Optional: for many test files
          ├── rendering.test.jsx
          └── interactions.test.jsx
  ```

### 2. Naming Conventions
- Base test file: ComponentName.test.jsx
- Split test files: ComponentName.{category}.test.jsx
- Test helpers: ComponentName.helpers.js
- Test utilities: ComponentName.utils.test.js

### 3. Organization Benefits
- Clear ownership and relationship
- Easy to find related files
- Simpler imports and relative paths
- Better IDE support
- Follows React community standards

## Implementation Strategy

### 1. Systematic Changes
- Handle one component at a time
- Focus on highest priority items first
- Document changes thoroughly
- Get approval before implementation
- Maintain consistent directory structure

### 2. Test First Approach
- Write tests before making changes
- Skip failing tests with clear comments
- Document current vs expected behavior
- Update tests to match implementation
- Keep tests close to implementation

### 3. Documentation
- Create implementation notes
- Document test improvements
- Update test organization
- Maintain change history
- Document component relationships

## Current Status

### Passing Tests
- RetinalCalculator (split into multiple files)
- Clock Components (ClockFace, Controls, Segment)
- Utility Functions (all passing)
- Hook Tests (useClockInteractions)

### Skipped Tests
- RiskInputForm (6 skipped tests)
  * Age input validation
  * Form submission
  * Mobile layout
  * Accessibility features

### File Organization Issues
- Tests need to be moved closer to implementation
- Legacy files present
- Duplicate utilities
- Inconsistent directory structure

### Documentation
- Implementation notes complete
- Test improvement docs ready
- Best practices documented
- Change strategy defined

## Next Steps

1. Reorganize Test Files
   - Create component directories
   - Move tests next to implementation
   - Update import paths
   - Verify all tests still pass

2. Address RiskInputForm accessibility
   - Enable skipped tests one at a time
   - Implement changes after approval
   - Verify each change thoroughly

3. Clean up codebase
   - Remove legacy files
   - Delete duplicate utilities
   - Update documentation

4. Review and enhance components
   - Address documented behaviors
   - Improve error handling
   - Add missing features
   - Consolidate utilities

## Notes
- All changes follow test-driven development
- Documentation kept up to date
- Changes made systematically
- High test coverage maintained
- Follow React community best practices
