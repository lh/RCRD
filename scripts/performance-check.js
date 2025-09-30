#!/usr/bin/env node

/**
 * Performance Check Script
 * Runs performance tests and reports any regressions
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

// Add chalk as optional dependency - gracefully degrade if not available
let green = (text) => text;
let red = (text) => text;
let yellow = (text) => text;
let bold = (text) => text;

try {
  const chalk = require('chalk');
  green = chalk.green;
  red = chalk.red;
  yellow = chalk.yellow;
  bold = chalk.bold;
} catch (e) {
  // Chalk not installed, use plain text
}

console.log(bold('\n🚀 Running Performance Tests...\n'));

try {
  // Run performance tests
  const output = execSync('npm run test:performance 2>&1', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  // Check if tests passed
  if (output.includes('failed')) {
    console.log(red('❌ Performance regression detected!'));
    console.log(yellow('\nFailing tests indicate code has gotten slower than acceptable thresholds.'));
    console.log(yellow('Review recent changes that might have impacted performance.\n'));
    
    // Extract failed test names
    const failedTests = output.match(/✕ .+/g);
    if (failedTests) {
      console.log(red('Failed tests:'));
      failedTests.forEach(test => console.log(`  ${test}`));
    }
    
    process.exit(1);
  } else {
    console.log(green('✅ All performance tests passed!'));
    
    // Extract test summary
    const summaryMatch = output.match(/Tests:.*passed.*/);
    if (summaryMatch) {
      console.log(green(`\n${summaryMatch[0]}`));
    }
    
    console.log(green('\n✨ No performance regressions detected. Code is running efficiently!\n'));
  }

} catch (error) {
  if (error.status === 1) {
    // Test failure exit code
    console.log(red('\n❌ Performance tests failed. See output above for details.\n'));
  } else {
    // Other errors
    console.log(red(`\n❌ Error running performance tests: ${error.message}\n`));
  }
  process.exit(1);
}

// Also check bundle size if build exists
console.log(bold('\n📦 Checking Bundle Size...\n'));

try {
  const sizeOutput = execSync('npm run size 2>&1', {
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  // Extract size information
  const mainJsMatch = sizeOutput.match(/Main JS Bundle[\s\S]*?Size:\s*([^\n]+)/);
  const cssMatch = sizeOutput.match(/CSS Bundle[\s\S]*?Size:\s*([^\n]+)/);
  const totalMatch = sizeOutput.match(/Total Bundle Size[\s\S]*?Size:\s*([^\n]+)/);

  if (mainJsMatch || cssMatch || totalMatch) {
    console.log(green('Bundle Sizes:'));
    if (mainJsMatch) console.log(`  Main JS: ${mainJsMatch[1]}`);
    if (cssMatch) console.log(`  CSS: ${cssMatch[1]}`);
    if (totalMatch) console.log(bold(`  Total: ${totalMatch[1]}`));
    console.log(green('\n✅ All bundles within size limits!\n'));
  }

} catch (error) {
  if (error.message.includes('no such file')) {
    console.log(yellow('⚠️  Build not found. Run `npm run build` first to check bundle sizes.\n'));
  } else if (error.status === 1) {
    console.log(red('❌ Bundle size exceeds limits!\n'));
    process.exit(1);
  }
}

console.log(bold('🎉 All performance checks passed!\n'));