# Test Development Best Practices

## Core Principles

1. Never modify source code to make tests pass
   - Document needed implementation changes in meta/*.md files
   - Skip failing tests with detailed comments about current vs. expected behavior
   - Wait for explicit approval before modifying implementation

2. Handle Test Failures Systematically
   - Document current behavior vs. expected behavior
   - Create implementation notes documenting needed changes
   - Create test improvement documentation
   - Skip problematic tests with clear comments
   - Adjust passing test expectations to match current behavior

3. Documentation Structure
   - Implementation Notes (meta/*-implementation-notes.md)
     * Current implementation behavior
     * Required changes
     * Rationale for changes
   - Test Improvements (meta/*-test-improvements.md)
     * List of skipped tests
     * Current vs. expected behavior
     * Rationale for each test
     * Implementation roadmap

4. Test File Organization
   - Group related tests using describe blocks
   - Add detailed comments explaining skipped tests
   - Document current behavior in test expectations
   - Include rationale for test cases
   - Keep passing tests that match current behavior

5. Test Development Process
   - Start with simplest components/utilities
   - Work up to more complex components
   - Handle one test file at a time
   - Ensure all tests either pass or are properly skipped
   - Document everything thoroughly

6. When Skipping Tests
   - Add clear comments explaining why test is skipped
   - Document current vs. expected behavior
   - Reference implementation notes
   - Preserve test for future improvements

7. Test Maintenance
   - Keep tests focused on behavior, not implementation
   - Use consistent patterns across similar components
   - Document special testing considerations
   - Maintain test isolation

## Example Workflow

1. Analyze failing tests
2. Create implementation notes documenting needed changes
3. Create test improvements documentation
4. Update test file:
   - Skip problematic tests with comments
   - Adjust passing test expectations
   - Add detailed documentation
5. Verify all tests pass or are properly skipped
6. Document completion without modifying source code
