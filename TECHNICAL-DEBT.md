# Technical Debt Tracker

## Overview
This document tracks technical debt in the RCRD (Risk Calculator Retinal Detachment) application. Each item is categorized by severity and effort to help prioritize remediation.

## Severity Levels
- **CRITICAL**: Production issues, security risks, or major performance impacts
- **HIGH**: Significant code quality issues that could lead to bugs
- **MEDIUM**: Code maintainability and best practice violations
- **LOW**: Minor improvements and nice-to-haves

## Effort Estimates
- **XS**: < 1 hour
- **S**: 1-4 hours
- **M**: 4-8 hours
- **L**: 1-3 days
- **XL**: > 3 days

## Debt Inventory

| ID | Category | Description | Severity | Effort | Impact | Status | Location |
|----|----------|-------------|----------|--------|--------|--------|----------|
| TD-001 | Logging | ~~Production console.log in calculations~~ | ~~CRITICAL~~ | ~~XS~~ | ~~High~~ | ✅ FIXED | ~~src/utils/riskCalculations.js:112~~ |
| TD-002 | Logging | 111 remaining console.log statements | MEDIUM | S | Medium | Open | Multiple files |
| TD-003 | Error Handling | ~~Missing ErrorBoundary component~~ | ~~HIGH~~ | ~~M~~ | ~~High~~ | ✅ FIXED | ~~src/components/~~ |
| TD-004 | Code Duplication | Mobile/Desktop calculator duplication (~70%) | MEDIUM | L | Medium | Open | src/components/{Mobile,Desktop}RetinalCalculator.jsx |
| TD-005 | Code Quality | Unused isTouchDevice state variable | LOW | XS | Low | Open | src/components/MobileRetinalCalculator.jsx:10 |
| TD-006 | Dead Code | Commented console.log statements | LOW | XS | Low | Open | Multiple test files |
| TD-007 | Type Safety | No TypeScript - using plain JavaScript | MEDIUM | XL | High | Open | Entire codebase |
| TD-008 | Dependencies | Unpinned @shadcn/ui version ("latest") | MEDIUM | XS | Medium | Open | package.json |
| TD-009 | Dependencies | Security overrides suggesting outdated deps | HIGH | M | High | Open | package.json |
| TD-010 | Validation | ~~No input validation in calculateRiskWithSteps~~ | ~~HIGH~~ | ~~S~~ | ~~High~~ | ✅ FIXED | ~~src/utils/riskCalculations.js~~ |
| TD-011 | Error Handling | ~~No try-catch in risk calculations~~ | ~~HIGH~~ | ~~S~~ | ~~High~~ | ✅ FIXED | ~~src/utils/riskCalculations.js~~ |
| TD-012 | Testing | Console.logs in test files | LOW | S | Low | Open | src/components/__tests__/*.test.jsx |
| TD-013 | Code Quality | ESLint suppression comments | LOW | XS | Low | Open | src/components/MobileRetinalCalculator.jsx:9 |
| TD-014 | Architecture | No state management (Redux/Context) | LOW | L | Medium | Open | N/A - uses prop drilling |
| TD-015 | Performance | No memoization of expensive calculations | MEDIUM | M | Medium | Open | src/utils/riskCalculations.js |

## Detailed Issue Descriptions

### TD-001: Production Console.log [✅ FIXED]
**Fixed on**: 2025-09-03
**Description**: Debug console.log statement was logging every calculation in production.
**Resolution**: Removed the console.log statement from addCoefficient function.

### TD-002: Remaining Console.log Statements
**Files affected**:
- src/utils/segmentHourTest.js (4 instances)
- src/utils/__tests__/*.test.js (multiple)
- src/components/__tests__/*.test.jsx (multiple)
- src/components/clock/utils/*.js (commented out)

**Recommendation**: 
1. Remove or comment test-specific logs
2. Use proper test reporters instead
3. Add build step to strip console statements in production

### TD-003: Missing ErrorBoundary [✅ FIXED]
**Fixed on**: 2025-09-03
**Description**: No error boundary existed to catch React component errors.
**Resolution**: Created ErrorBoundary component with fallback UI, wrapped main app components.

### TD-004: Code Duplication
**Issue**: MobileRetinalCalculator and DesktopRetinalCalculator share ~70% identical code.
**Duplicated logic**:
- useRetinalCalculator hook usage
- Form props handling
- Calculate button logic
- Results display

**Solution**:
1. Extract shared logic to BaseCalculator
2. Use composition for layout differences
3. Reduce to ~100 lines total from current ~300

### TD-005: Unused Variable
**Issue**: `isTouchDevice` state is set but never used
```javascript
const [isTouchDevice, setIsTouchDevice] = useState(false);
```
**Solution**: Remove if truly unused, or implement touch-specific behavior

### TD-007: No TypeScript
**Impact**: 
- No compile-time type checking
- Potential runtime errors
- Poor IDE intellisense
- Harder refactoring

**Migration strategy**:
1. Start with critical utilities (riskCalculations.js)
2. Add type definitions for constants
3. Gradually migrate components
4. Use JSDoc comments as interim solution

### TD-008-009: Dependency Issues
**Problems**:
- `@shadcn/ui": "latest"` - could break on updates
- Multiple security overrides in package.json
- Resolutions and overrides indicate dependency conflicts

**Solution**:
1. Pin all dependencies to specific versions
2. Run `npm audit fix`
3. Update outdated packages
4. Remove unnecessary overrides

### TD-010-011: Missing Validation & Error Handling [✅ FIXED]
**Fixed on**: 2025-09-03
**Description**: No validation or error handling in calculateRiskWithSteps
**Resolution**: 
- Added comprehensive input validation function
- Added try-catch error handling
- Returns error object with detailed messages
- Validates age, PVR grade, gauge, hours, segments, cryotherapy, tamponade

## Resolution Priority

### Phase 1: Critical & High Impact (Week 1)
1. ✅ TD-001: Critical console.log (COMPLETED)
2. TD-003: Add ErrorBoundary
3. TD-010: Add input validation
4. TD-011: Add error handling

### Phase 2: Code Quality (Week 2)
5. TD-004: Refactor duplicate calculators
6. TD-002: Clean up remaining console.logs
7. TD-009: Fix dependency security issues
8. TD-008: Pin dependency versions

### Phase 3: Long-term Improvements (Month 2)
9. TD-015: Add calculation memoization
10. TD-007: Begin TypeScript migration
11. TD-014: Consider state management if app grows

### Phase 4: Nice-to-haves (As time permits)
12. TD-005: Remove unused variables
13. TD-006: Clean dead code
14. TD-012: Clean test console.logs
15. TD-013: Remove ESLint suppressions

## Tracking

### Completed
- [x] TD-001: Critical console.log removed (2025-09-03)
- [x] TD-003: ErrorBoundary component added (2025-09-03)
- [x] TD-010: Input validation added (2025-09-03)
- [x] TD-011: Error handling with try-catch added (2025-09-03)

### In Progress
- [ ] None currently

### Metrics
- **Total Issues**: 15
- **Resolved**: 4 (26.7%)
- **Critical/High**: 1 remaining (TD-009: Security deps)
- **Medium**: 5 remaining  
- **Low**: 5 remaining

## Verification Steps

For each resolved item:
1. Verify fix doesn't break tests
2. Test in development environment
3. Code review if available
4. Update this document
5. Commit with reference to TD number

## Notes

- This document should be updated whenever technical debt is added or resolved
- Consider adding automated tooling to detect new debt (ESLint rules, etc.)
- Review quarterly to reprioritize based on product direction
- Consider "tech debt Friday" sessions to chip away at the backlog

---

*Last Updated: 2025-09-03*
*Next Review: 2025-10-03*