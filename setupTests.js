// src/setupTests.js
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock timers for all tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
