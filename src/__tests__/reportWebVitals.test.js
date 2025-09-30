/**
 * @jest-environment jsdom
 */

import reportWebVitals from '../reportWebVitals';

// Mock the web-vitals module with a factory function
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFID: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn()
}));

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof reportWebVitals).toBe('function');
  });

  it('should handle being called without a callback', () => {
    expect(() => reportWebVitals()).not.toThrow();
    expect(() => reportWebVitals(null)).not.toThrow();
    expect(() => reportWebVitals(undefined)).not.toThrow();
  });

  it('should not throw when called with non-function values', () => {
    expect(() => reportWebVitals('string')).not.toThrow();
    expect(() => reportWebVitals(123)).not.toThrow();
    expect(() => reportWebVitals({})).not.toThrow();
    expect(() => reportWebVitals([])).not.toThrow();
    expect(() => reportWebVitals(true)).not.toThrow();
    expect(() => reportWebVitals(false)).not.toThrow();
  });

  it('should accept a callback function', () => {
    const mockCallback = jest.fn();
    expect(() => reportWebVitals(mockCallback)).not.toThrow();
  });

  it('should handle async operations without throwing', () => {
    const mockCallback = jest.fn();
    
    // The function should handle its async operations internally
    expect(() => {
      reportWebVitals(mockCallback);
      // The import happens asynchronously, but the function returns immediately
    }).not.toThrow();
  });
});