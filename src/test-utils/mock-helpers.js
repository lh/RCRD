/**
 * Mock Helper Utilities
 * Provides common functions for working with mocked components in tests
 */

/**
 * Assert that a mock component was called with expected props
 * @param {jest.Mock} mock - The mocked component
 * @param {Object} expectedProps - The props we expect the mock to have been called with
 */
export const assertMockCalled = (mock, expectedProps) => {
  expect(mock).toHaveBeenCalledWith(
    expect.objectContaining(expectedProps),
    expect.anything() // context parameter
  );
};

/**
 * Assert that a mock component was called a specific number of times
 * @param {jest.Mock} mock - The mocked component
 * @param {number} times - Expected number of calls
 */
export const assertMockCalledTimes = (mock, times) => {
  expect(mock).toHaveBeenCalledTimes(times);
};

/**
 * Get the props from the last call to a mocked component
 * @param {jest.Mock} mock - The mocked component
 * @returns {Object} The props from the last call
 */
export const getLastMockProps = (mock) => {
  const calls = mock.mock.calls;
  if (calls.length === 0) {
    throw new Error('Mock was not called');
  }
  return calls[calls.length - 1][0];
};

/**
 * Get the props from a specific call to a mocked component
 * @param {jest.Mock} mock - The mocked component
 * @param {number} callIndex - The index of the call (0-based)
 * @returns {Object} The props from the specified call
 */
export const getMockPropsFromCall = (mock, callIndex) => {
  const calls = mock.mock.calls;
  if (calls.length <= callIndex) {
    throw new Error(`Mock was only called ${calls.length} times, cannot get call ${callIndex}`);
  }
  return calls[callIndex][0];
};

/**
 * Reset all provided mocks
 * @param {...jest.Mock} mocks - The mocks to reset
 */
export const resetAllMocks = (...mocks) => {
  mocks.forEach(mock => {
    if (mock && typeof mock.mockClear === 'function') {
      mock.mockClear();
    }
  });
};

/**
 * Reset and restore all provided mocks
 * @param {...jest.Mock} mocks - The mocks to restore
 */
export const restoreAllMocks = (...mocks) => {
  mocks.forEach(mock => {
    if (mock && typeof mock.mockRestore === 'function') {
      mock.mockRestore();
    }
  });
};

/**
 * Assert that a mock's onChange handler was called with a specific value
 * @param {jest.Mock} onChangeMock - The onChange mock function
 * @param {any} expectedValue - The expected value
 */
export const assertOnChangeCalled = (onChangeMock, expectedValue) => {
  expect(onChangeMock).toHaveBeenCalledWith(expectedValue);
};

/**
 * Create a mock event object for testing
 * @param {string} value - The value for the event target
 * @returns {Object} A mock event object
 */
export const createMockEvent = (value) => ({
  target: { value },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
});

/**
 * Wait for mock to be called (useful for async operations)
 * @param {jest.Mock} mock - The mock to wait for
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise} Resolves when mock is called
 */
export const waitForMockCall = (mock, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkMock = () => {
      if (mock.mock.calls.length > 0) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Mock was not called within ${timeout}ms`));
      } else {
        setTimeout(checkMock, 10);
      }
    };
    
    checkMock();
  });
};

/**
 * Assert that mock props match a specific pattern
 * @param {jest.Mock} mock - The mocked component
 * @param {Function} matcher - A function that returns true if props match
 */
export const assertMockPropsMatch = (mock, matcher) => {
  const calls = mock.mock.calls;
  const matchingCall = calls.find(call => matcher(call[0]));
  
  if (!matchingCall) {
    throw new Error('No mock call matched the provided matcher function');
  }
  
  expect(matchingCall).toBeDefined();
};