# Test Development Best Practices

## Core Principles

1. Test-Driven Development Cycle
   - Write/update test for a single, specific change
   - Verify test fails (red)
   - Make minimal code changes to pass test
   - Verify test passes (green)
   - Refactor if needed
   - Get approval before moving to next change

2. Handle Changes Systematically
   - Document current behavior vs. expected behavior
   - Create implementation notes documenting changes
   - Create test improvement documentation
   - Make small, focused changes
   - Verify each change thoroughly

3. Documentation Structure
   - Implementation Notes (meta/*-implementation-notes.md)
     * Current implementation behavior
     * Proposed changes
     * Rationale for changes
   - Test Improvements (meta/*-test-improvements.md)
     * List of tests to update
     * Current vs. expected behavior
     * Rationale for each test
     * Implementation roadmap

4. Test File Organization
   - Group related tests using describe blocks
   - Add detailed comments explaining test purpose
   - Document behavior expectations clearly
   - Include rationale for test cases
   - Keep tests focused and specific

5. Test Development Process
   - Start with simplest components/utilities
   - Work up to more complex components
   - Handle one test file at a time
   - Make small, incremental changes
   - Document everything thoroughly

6. Test Writing Guidelines
   - Write clear, specific test descriptions
   - Test one behavior at a time
   - Include setup and teardown as needed
   - Document any assumptions
   - Keep tests focused and isolated

7. Test Maintenance
   - Keep tests focused on behavior, not implementation
   - Use consistent patterns across similar components
   - Document special testing considerations
   - Maintain test isolation

## Example Workflow

1. Identify specific change needed
2. Write/update test to verify desired behavior
3. Verify test fails appropriately
4. Make minimal code changes to pass test
5. Verify test passes
6. Refactor if needed
7. Document changes and rationale
8. Get approval before moving to next change

## Best Practices

1. Make small, focused changes
2. Test one behavior at a time
3. Document changes thoroughly
4. Get feedback frequently
5. Keep tests clear and specific
6. Maintain consistent patterns
7. Focus on user-facing behavior
8. Consider edge cases
