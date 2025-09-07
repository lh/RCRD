/**
 * Jest Configuration
 * 
 * IMPORTANT: Tests are configured to run sequentially (maxWorkers=1) because
 * performance benchmarks can be affected by parallel test execution, causing
 * timing-related failures.
 * 
 * If you need to run tests in parallel for faster execution, use:
 * npm run test:parallel
 */

module.exports = {
  // Run tests sequentially to avoid performance test timing issues
  maxWorkers: 1,
  
  // Other configurations can be added here as needed
  testEnvironment: 'jsdom',
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],
  
  // Module name mapping for CSS and file imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  }
};