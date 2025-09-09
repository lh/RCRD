# RCRD Code Quality Review
Last updated: 2025-09-09

## Overview
The application has progressed meaningfully since the last review. The core risk engine now validates inputs and handles errors, confidence intervals are implemented and visualized, an ErrorBoundary protects the UI, and tests cover statistics, performance, and build integrity. Technical debt is explicitly tracked.

## What Improved
- Robust calculations:
  - Input validation and try/catch in `calculateRiskWithSteps`; consistent rounding and error returns.
  - Confidence intervals calculated and returned (logit and probability) with formatted strings for display.
- Statistical layer:
  - `confidenceIntervals.js` uses standard errors derived from BEAVRS paper CIs; tests include extremes and confidence-level variation.
- Error resilience:
  - `ErrorBoundary.jsx` added and used in `App`, with dev-only logging details and safe fallback.
- Testing depth:
  - New suites validate medical coefficients, CI math, build/import health, and performance benchmarks.
  - Performance helpers underpin micro- and batch-level timing checks.
- Meta discipline:
  - `TECHNICAL-DEBT.md` categorizes debt with severity/effort and tracks fixes.

## Current Issues
- Segment system consistency (correctness):
  - UI clock uses 24 segments (`CLOCK.SEGMENTS=24`), while `ClockHourNotation.segmentsTouchHour` assumes 60 (5/ hour).
  - `riskCalculations.getInferiorDetachment` depends on `ClockHourNotation` ranges, risking inferior-hour misclassification and total-RD misreporting when given 24-segment inputs.
- Broken/dead clock component imports:
  - `clock/TearMarker.jsx` imports `DIMENSIONS` and `createTearPath` from `styles/clockStyles.js` (not exported) and `getPosition` from `utils/clockGeometry.js`.
  - Tests document these issues instead of exercising behavior.
- Build tooling gaps:
  - Tailwind is configured (`tailwind.config.js`, `postcss.config.js`, `@tailwind` in CSS) but `tailwindcss` and `autoprefixer` are not in `package.json` dependencies. Fresh installs/builds likely fail.
  - CRA 5 sometimes ignores PostCSS customization without additional setup; confirm Tailwind pipeline runs in CRA.
- Dependency hygiene:
  - `@shadcn/ui` pinned to `"latest"` (brittle).
  - Multiple `resolutions`/`overrides`, including pinning `webpack-dev-server`, indicate unresolved dependency drift/security hotfixing.
- Jest setup confusion:
  - Two setup files exist: root `setupTests.js` (fake timers) and CRA’s `src/setupTests.js`. CRA loads only the latter; the root file is misleading.
  - `jest.config.js` won’t be used by `react-scripts test`; sequential mode is correctly enforced via a dedicated npm script.
- Memoization comparator risk:
  - `ClockFace.jsx` custom comparator references `onHourSelectionChange` (not a prop), risking stale renders or missed updates.
- Inconsistent model messaging:
  - `riskResultsText.js` states “only includes coefficients with p < 0.05” irrespective of selected model; the app supports FULL (p < 0.10) and SIGNIFICANT (p < 0.05).
- Validation inconsistency:
  - UI enforces age 18–100; core validation allows 0–120. Divergent behavior across layers.
- Legacy/destructive deployment script:
  - `deploy.js` uses CJS in an ESM project and runs destructive `git rm -rf .`. CI via GitHub Actions already deploys; this script is redundant and hazardous.
- Docs & onboarding:
  - Root `README.md` remains minimal; recent capabilities and scripts aren’t documented for contributors.

## Strengths To Keep
- Modular architecture: clear separation across `components`, `utils`, `constants`, and clock `handlers/utils/styles`.
- Statistical transparency: step-by-step coefficient accumulation and CI presentation are clinically useful.
- Accessibility attention: ARIA, keyboard support, and dedicated accessibility tests for forms/toggles.
- Test philosophy: integration over mocks for business logic; performance and statistical tests add real value.
- Meta reporting: debt tracking and testing/validation summaries increase maintainability.

## Recommendations (Prioritized)
1) Unify segment model (High)
- Pick 24 or 60 segments and apply consistently across:
  - UI geometry/drawing and constants,
  - `ClockHourNotation` hour detection,
  - `getInferiorDetachment` and `isTotalRD` logic.
- If keeping 24 segments, either:
  - Replace `segmentsTouchHour` with a 24-compatible function, or
  - Map UI segments to hours via a dedicated converter (e.g., `segmentHourMapping`) before clinical classification.
- Add tests verifying inferior-hour counts and total RD across representative shapes, boundary cases, and wrap-around.

2) Fix or retire broken clock components (High)
- `TearMarker.jsx`:
  - Source `createTearPath` from the canonical geometry module (`utils/clockFaceGeometry.js`).
  - Provide a single `DIMENSIONS` source or pass sizes via props.
- Remove duplicate geometry/style modules:
  - Prefer `utils/clockFaceGeometry.js` and `styles/clockFaceStyles.js`; delete stale duplicates once migrated.

3) Stabilize build pipeline (High)
- Add `tailwindcss` and `autoprefixer` to dependencies and verify CRA + PostCSS integration.
- Pin `@shadcn/ui` to a known-good version.
- Reassess `resolutions/overrides`; update dependencies to reduce the need for forced pins.

4) Simplify Jest setup (Medium)
- Keep only `src/setupTests.js` and remove the root `setupTests.js` (or clearly note it’s unused).
- Continue using `test:sequential` for performance suites; ensure any non-CRA runner would consume equivalent config.

5) Correct `ClockFace` comparator (Medium)
- Replace the custom comparator with one comparing actual used props (e.g., `selectedHours`, `detachmentSegments`, `hoveredHour`, handlers), or remove it to rely on default shallow memoization.

6) Align model messaging (Medium)
- Make UI text (e.g., in `riskResultsText.js`) reflect `MODEL_TYPE` so p-value thresholds and copy are accurate for Full vs Significant models.

7) Harmonize validation bounds (Medium)
- Decide clinical age range (likely 18–100) and enforce consistently in both UI and core validation. Document the rationale.

8) Retire `deploy.js` (Medium)
- Rely solely on `.github/workflows/deploy.yaml` for Pages. Remove or archive `deploy.js` to avoid accidental destructive usage.

9) Documentation & onboarding (Medium)
- Expand `README.md` with:
  - Quick start, scripts (`test:ci`, `test:sequential`, `test:performance`), and Tailwind setup notes,
  - CI/CD overview and deployment,
  - How CIs are computed and interpreted, including intercept assumptions,
  - Known limitations and open technical debt.

## Nice-To-Haves
- Performance polish: Memoize expensive formatting/calculations in `useRetinalCalculator` and heavy SVG render layers if profiling identifies hotspots.
- Type safety: Gradual TypeScript migration for `riskCalculations`, `confidenceIntervals`, and clock utils to guard segment/hour mapping.
- CI tests: Add a separate GitHub Actions job running `npm run test:ci` on PRs; optionally integrate `scripts/check-console.sh` to enforce dev-only logging patterns.

## Notable Files Reviewed
- Core logic: `src/utils/riskCalculations.js`, `src/constants/paperCoefficients.js`, `src/constants/modelTypes.js`
- Statistics: `src/utils/confidenceIntervals.js`, `src/utils/actualStandardErrors.js`
- Clock: `src/components/clock/**` (utils, handlers, styles), `ClockHourNotation.js`, `ClockFace*.jsx`, `TearMarker.jsx`
- UI & state: `src/components/{RetinalCalculator,MobileRetinalCalculator,DesktopRetinalCalculator, RiskResults, ModelToggle, RiskInputForm}.jsx`, `useRetinalCalculator.js`
- Testing: `src/utils/__tests__/*`, `src/components/__tests__/*`, performance and medical validation suites
- Tooling/CI: `package.json`, `tailwind.config.js`, `postcss.config.js`, `.github/workflows/deploy.yaml`, `jest.config.js`
- Meta: `TECHNICAL-DEBT.md`, multiple validation and test summary reports

