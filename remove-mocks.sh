#!/bin/bash

# Script to remove riskCalculations and formatDetachmentHours mocks from test files

echo "Removing business logic mocks from test files..."

# List of files that need updating
files=(
  "src/components/__tests__/RetinalCalculator.results.test.jsx"
  "src/components/__tests__/RetinalCalculator.interactions.test.jsx" 
  "src/components/__tests__/RetinalCalculator.helpers.test.jsx"
  "src/components/__tests__/RetinalCalculator.form.test.jsx"
  "src/components/__tests__/ErrorBoundary.test.jsx"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  
  # Remove the import line for calculateRiskWithSteps if it exists
  sed -i '' '/^import.*calculateRiskWithSteps.*from.*riskCalculations/d' "$file"
  
  # Remove the mock lines
  sed -i '' "/jest\.mock('\.\.\/\.\.\/utils\/riskCalculations')/d" "$file"
  sed -i '' "/jest\.mock('\.\.\/clock\/utils\/formatDetachmentHours')/d" "$file"
  
  # Add comment about not mocking business logic (if not already present)
  if ! grep -q "NO LONGER MOCKING BUSINESS LOGIC" "$file"; then
    sed -i '' '/^describe(/i\
// NO LONGER MOCKING BUSINESS LOGIC - using real calculations\
' "$file"
  fi
  
  # Remove mock setup/reset code
  sed -i '' '/calculateRiskWithSteps\.mock/d' "$file"
  sed -i '' '/formatDetachmentHours\.mock/d' "$file"
done

echo "Done removing mocks!"