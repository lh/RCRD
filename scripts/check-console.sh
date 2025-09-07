#!/bin/bash

# Script to check for console statements in production code
# Excludes test files and properly wrapped development-only logs

echo "Checking for console statements in production code..."
echo "======================================================"

# Check for unwrapped console statements
# This is a simplified check - manually verify any findings
FOUND_ISSUES=false

# Check critical production files
echo "Checking critical files..."

# Check index.js - should only have console in dev/test blocks
if grep -q "console\." src/index.js 2>/dev/null; then
  if ! grep -B2 "console\." src/index.js | grep -q "NODE_ENV" 2>/dev/null; then
    echo "⚠️  src/index.js may have unwrapped console statements"
    FOUND_ISSUES=true
  fi
fi

# Check ErrorBoundary
if grep -q "console\." src/components/ErrorBoundary.jsx 2>/dev/null; then
  if ! grep -B2 "console\." src/components/ErrorBoundary.jsx | grep -q "NODE_ENV" 2>/dev/null; then
    echo "⚠️  src/components/ErrorBoundary.jsx may have unwrapped console statements"
    FOUND_ISSUES=true
  fi
fi

# Check riskCalculations
if grep -q "console\." src/utils/riskCalculations.js 2>/dev/null; then
  if ! grep -B2 "console\." src/utils/riskCalculations.js | grep -q "NODE_ENV" 2>/dev/null; then
    echo "⚠️  src/utils/riskCalculations.js may have unwrapped console statements"
    FOUND_ISSUES=true
  fi
fi

# Quick scan for other files (excluding tests and known safe files)
echo "Scanning other source files..."
OTHER_FILES=$(find src -name "*.js" -o -name "*.jsx" | \
  grep -v "__tests__" | \
  grep -v "test-utils" | \
  grep -v "setupTests" | \
  grep -v "clockTests" | \
  grep -v "segmentHourTest" | \
  grep -v "actualStandardErrors" | \
  grep -v "derivedStandardErrors" | \
  xargs grep -l "console\." 2>/dev/null | \
  grep -v "index.js" | \
  grep -v "ErrorBoundary" | \
  grep -v "riskCalculations")

if [ ! -z "$OTHER_FILES" ]; then
  echo "⚠️  These files contain console statements (verify they're wrapped):"
  echo "$OTHER_FILES"
  FOUND_ISSUES=true
fi

if [ "$FOUND_ISSUES" = false ]; then
  echo "✅ No obvious unwrapped console statements found!"
  echo "Note: This is a basic check. Always manually verify critical files."
  exit 0
else
  echo ""
  echo "❌ Potential issues found. Please verify all console statements are wrapped with:"
  echo "  if (process.env.NODE_ENV === 'development') { ... }"
  exit 1
fi