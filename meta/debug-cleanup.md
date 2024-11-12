# Debug and Cleanup Notes

## Duplicate Files
1. clockCalculations.js
   - Location: src/components/clock/utils/clockCalculations.js
   - Issue: Exact duplicate of ClockFace.jsx
   - Recommendation: Remove this file since ClockFace.jsx is the primary component file
   - Risk: Low (duplicate file, not imported anywhere)

## Legacy Test Files
1. clockTests.js
   - Location: src/components/clock/utils/clockTests.js
   - Issue: Old test file using console.log output instead of Jest
   - Dependencies: Imports from files now in scratch directory
   - Recommendation: Remove this file as all tests have been properly migrated to Jest
   - Risk: Low (all test cases covered by proper Jest tests)

## Debug Logging
1. Segment.jsx
   - Issue: Contains debug logging in production code
   - Location: src/components/clock/Segment.jsx
   - Recommendation: Remove or wrap in development-only condition
   - Risk: Low (only logging, no functional impact)

## Moved to Scratch
The following files have been moved to the scratch directory and are no longer active:
- clockConversions.js
- endClockConversions.js
- formatDetachmentHours.js
- getClockHour.js
- getSegmentRanges.js
- interpolateSegments.js
- MinimalClockSelector.jsx
- MinimalClockSelector.test.jsx

## Recommendations
1. Remove duplicate files
   - Delete clockCalculations.js
   - Ensure no imports are referencing it

2. Remove legacy test files
   - Delete clockTests.js
   - Verify all test cases are covered in Jest tests

3. Clean up debug logging
   - Remove console.log from Segment.jsx
   - Or wrap in process.env.NODE_ENV === 'development'

4. Review scratch directory
   - Confirm no active code depends on scratched files
   - Consider full removal if no longer needed

5. Documentation updates
   - Remove references to moved/deleted files
   - Update component documentation
   - Update test documentation

## Priority
1. High: Remove duplicate clockCalculations.js
2. High: Remove legacy clockTests.js
3. Medium: Clean up debug logging
4. Low: Review scratch directory

## Notes
- All changes should be made after verifying no active imports
- Consider adding ESLint rule to catch debug logs
- Document any file moves/deletions in git commit messages
- Verify test coverage remains complete after cleanup
