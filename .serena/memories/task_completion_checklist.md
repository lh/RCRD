# Task Completion Checklist

## When Adding or Modifying Tests

### Before Starting
1. Understand the component/function being tested
2. Check existing test coverage
3. Follow TDD approach when possible

### During Development
1. Write tests alongside or before implementation
2. Use appropriate test categories (unit, integration, etc.)
3. Mock dependencies appropriately
4. Follow existing test patterns and conventions

### Before Committing
1. **Run all tests**: `npm test`
2. **Check test coverage**: `npm test -- --coverage --watchAll=false`
3. **Verify no console errors or warnings**
4. **Ensure all tests pass**
5. **Check that new tests follow naming conventions**

### Quality Checks
- [ ] Tests are readable and self-documenting
- [ ] Tests cover happy path and edge cases
- [ ] Tests focus on behavior, not implementation
- [ ] Mocks are properly cleaned up
- [ ] No hardcoded timeouts or flaky tests
- [ ] Test descriptions are clear and meaningful

### Important Notes
- **DO NOT modify production code** (as per current directive)
- Focus only on test additions and improvements
- Maintain existing test structure and patterns
- Ensure backward compatibility
- Keep test files co-located with components

## Command Sequence for Validation
```bash
# 1. Run tests in watch mode during development
npm test

# 2. Run full test suite with coverage before finishing
npm test -- --coverage --watchAll=false

# 3. Check git status
git status

# 4. Stage and review changes
git add .
git diff --staged
```