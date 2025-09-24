/**
 * @jest-environment jsdom
 */

// Simple test to verify the index file can be imported without errors
// The actual rendering is integration tested through App.test.js

describe('Application Entry Point', () => {
  it('should be importable without errors', () => {
    // Mock the DOM element
    document.body.innerHTML = '<div id="root"></div>';
    
    // Mock ReactDOM to prevent actual rendering
    jest.mock('react-dom/client', () => ({
      createRoot: jest.fn(() => ({
        render: jest.fn()
      }))
    }));
    
    // Should not throw when importing
    expect(() => {
      jest.isolateModules(() => {
        require('../index');
      });
    }).not.toThrow();
  });
});