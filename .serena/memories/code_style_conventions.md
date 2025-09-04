# Code Style and Conventions

## JavaScript/JSX Conventions
- **File Extensions**: `.jsx` for React components, `.js` for utilities
- **Component Structure**: Functional components with React Hooks
- **Naming**: 
  - Components: PascalCase (e.g., `RiskInputForm`)
  - Functions/variables: camelCase (e.g., `calculateRisk`)
  - Constants: UPPER_SNAKE_CASE or camelCase
  - Test files: `ComponentName.test.jsx` or `ComponentName.[type].test.jsx`

## React Patterns
- Functional components with hooks (no class components)
- Props destructuring in function parameters
- Use of custom hooks for shared logic
- Component composition over inheritance
- Controlled components for forms

## Testing Conventions
- Test files located in `__tests__` directories
- Using React Testing Library with user-centric queries
- Mock child components when testing parent components
- Test structure: Arrange-Act-Assert pattern
- Focus on user interactions and behavior
- Use `data-testid` for test selectors when needed

## Import Order
1. React and core libraries
2. Third-party libraries
3. Local components
4. Utils and helpers
5. Constants
6. Styles

## ESLint Rules
- Extends: `react-app` configuration
- React Hooks rules enforced:
  - `react-hooks/rules-of-hooks`: error
  - `react-hooks/exhaustive-deps`: warn

## Component Organization
- Separate mobile and desktop layouts when needed
- Shared logic extracted to utilities
- Reusable form components
- Clear prop interfaces
- JSDoc comments for documentation

## State Management
- Local component state with useState
- Props passing for shared state
- No external state management library