/**
 * Tests for mock helper utilities
 */

import {
  assertMockCalled,
  assertMockCalledTimes,
  getLastMockProps,
  getMockPropsFromCall,
  resetAllMocks,
  restoreAllMocks,
  assertOnChangeCalled,
  createMockEvent,
  waitForMockCall,
  assertMockPropsMatch
} from '../mock-helpers';

describe('Mock Helper Utilities', () => {
  let mockComponent;
  let mockFunction;

  beforeEach(() => {
    mockComponent = jest.fn();
    mockFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assertMockCalled', () => {
    it('should assert mock was called with expected props', () => {
      const expectedProps = { id: 1, name: 'Test' };
      mockComponent(expectedProps, {});

      expect(() => {
        assertMockCalled(mockComponent, expectedProps);
      }).not.toThrow();
    });

    it('should assert mock was called with partial props', () => {
      mockComponent({ id: 1, name: 'Test', extra: 'value' }, {});

      expect(() => {
        assertMockCalled(mockComponent, { id: 1 });
      }).not.toThrow();
    });

    it('should fail when props do not match', () => {
      mockComponent({ id: 2, name: 'Other' }, {});

      expect(() => {
        assertMockCalled(mockComponent, { id: 1, name: 'Test' });
      }).toThrow();
    });

    it('should handle context parameter correctly', () => {
      const props = { test: 'value' };
      const context = { someContext: 'data' };
      mockComponent(props, context);

      expect(() => {
        assertMockCalled(mockComponent, props);
      }).not.toThrow();
    });
  });

  describe('assertMockCalledTimes', () => {
    it('should assert correct number of calls', () => {
      mockFunction();
      mockFunction();

      expect(() => {
        assertMockCalledTimes(mockFunction, 2);
      }).not.toThrow();
    });

    it('should fail when call count does not match', () => {
      mockFunction();

      expect(() => {
        assertMockCalledTimes(mockFunction, 2);
      }).toThrow();
    });

    it('should handle zero calls', () => {
      expect(() => {
        assertMockCalledTimes(mockFunction, 0);
      }).not.toThrow();
    });
  });

  describe('getLastMockProps', () => {
    it('should return props from last call', () => {
      const firstProps = { id: 1 };
      const lastProps = { id: 2 };
      
      mockComponent(firstProps);
      mockComponent(lastProps);

      const result = getLastMockProps(mockComponent);
      expect(result).toEqual(lastProps);
    });

    it('should throw error when mock was not called', () => {
      expect(() => {
        getLastMockProps(mockComponent);
      }).toThrow('Mock was not called');
    });

    it('should return props from single call', () => {
      const props = { test: 'data' };
      mockComponent(props);

      const result = getLastMockProps(mockComponent);
      expect(result).toEqual(props);
    });

    it('should handle multiple calls correctly', () => {
      for (let i = 0; i < 5; i++) {
        mockComponent({ index: i });
      }

      const result = getLastMockProps(mockComponent);
      expect(result).toEqual({ index: 4 });
    });
  });

  describe('getMockPropsFromCall', () => {
    it('should return props from specific call', () => {
      const props1 = { id: 1 };
      const props2 = { id: 2 };
      const props3 = { id: 3 };
      
      mockComponent(props1);
      mockComponent(props2);
      mockComponent(props3);

      expect(getMockPropsFromCall(mockComponent, 0)).toEqual(props1);
      expect(getMockPropsFromCall(mockComponent, 1)).toEqual(props2);
      expect(getMockPropsFromCall(mockComponent, 2)).toEqual(props3);
    });

    it('should throw error for invalid call index', () => {
      mockComponent({ id: 1 });

      expect(() => {
        getMockPropsFromCall(mockComponent, 1);
      }).toThrow('Mock was only called 1 times, cannot get call 1');
    });

    it('should throw error when mock was not called', () => {
      expect(() => {
        getMockPropsFromCall(mockComponent, 0);
      }).toThrow('Mock was only called 0 times, cannot get call 0');
    });

    it('should handle negative index gracefully', () => {
      mockComponent({ id: 1 });

      expect(() => {
        getMockPropsFromCall(mockComponent, -1);
      }).toThrow();
    });
  });

  describe('resetAllMocks', () => {
    it('should reset multiple mocks', () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();
      
      mock1();
      mock2();
      
      expect(mock1).toHaveBeenCalledTimes(1);
      expect(mock2).toHaveBeenCalledTimes(1);

      resetAllMocks(mock1, mock2);

      expect(mock1).toHaveBeenCalledTimes(0);
      expect(mock2).toHaveBeenCalledTimes(0);
    });

    it('should handle single mock', () => {
      mockFunction();
      expect(mockFunction).toHaveBeenCalledTimes(1);

      resetAllMocks(mockFunction);
      expect(mockFunction).toHaveBeenCalledTimes(0);
    });

    it('should handle null or undefined mocks safely', () => {
      expect(() => {
        resetAllMocks(null, undefined, mockFunction);
      }).not.toThrow();

      expect(mockFunction).toHaveBeenCalledTimes(0);
    });

    it('should handle non-mock objects safely', () => {
      const notAMock = { someProperty: 'value' };
      
      expect(() => {
        resetAllMocks(notAMock, mockFunction);
      }).not.toThrow();
    });

    it('should handle empty arguments', () => {
      expect(() => {
        resetAllMocks();
      }).not.toThrow();
    });
  });

  describe('restoreAllMocks', () => {
    it('should restore multiple mocks', () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();
      
      mock1.mockRestore = jest.fn();
      mock2.mockRestore = jest.fn();

      restoreAllMocks(mock1, mock2);

      expect(mock1.mockRestore).toHaveBeenCalled();
      expect(mock2.mockRestore).toHaveBeenCalled();
    });

    it('should handle null or undefined mocks safely', () => {
      const mock = jest.fn();
      mock.mockRestore = jest.fn();

      expect(() => {
        restoreAllMocks(null, undefined, mock);
      }).not.toThrow();

      expect(mock.mockRestore).toHaveBeenCalled();
    });

    it('should handle objects without mockRestore', () => {
      const notRestorableMock = jest.fn();
      
      expect(() => {
        restoreAllMocks(notRestorableMock);
      }).not.toThrow();
    });

    it('should handle empty arguments', () => {
      expect(() => {
        restoreAllMocks();
      }).not.toThrow();
    });
  });

  describe('assertOnChangeCalled', () => {
    it('should assert onChange was called with value', () => {
      const onChangeMock = jest.fn();
      const expectedValue = 'test value';
      
      onChangeMock(expectedValue);

      expect(() => {
        assertOnChangeCalled(onChangeMock, expectedValue);
      }).not.toThrow();
    });

    it('should fail when value does not match', () => {
      const onChangeMock = jest.fn();
      
      onChangeMock('actual value');

      expect(() => {
        assertOnChangeCalled(onChangeMock, 'expected value');
      }).toThrow();
    });

    it('should handle complex values', () => {
      const onChangeMock = jest.fn();
      const complexValue = { id: 1, data: [1, 2, 3] };
      
      onChangeMock(complexValue);

      expect(() => {
        assertOnChangeCalled(onChangeMock, complexValue);
      }).not.toThrow();
    });

    it('should handle null and undefined values', () => {
      const onChangeMock = jest.fn();
      
      onChangeMock(null);
      assertOnChangeCalled(onChangeMock, null);

      onChangeMock.mockClear();
      onChangeMock(undefined);
      assertOnChangeCalled(onChangeMock, undefined);
    });
  });

  describe('createMockEvent', () => {
    it('should create event with target value', () => {
      const event = createMockEvent('test value');
      
      expect(event.target.value).toBe('test value');
      expect(event.preventDefault).toBeDefined();
      expect(event.stopPropagation).toBeDefined();
    });

    it('should create event with mock functions', () => {
      const event = createMockEvent('value');
      
      event.preventDefault();
      event.stopPropagation();

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle different value types', () => {
      const stringEvent = createMockEvent('string');
      const numberEvent = createMockEvent(123);
      const objectEvent = createMockEvent({ complex: 'value' });
      const nullEvent = createMockEvent(null);

      expect(stringEvent.target.value).toBe('string');
      expect(numberEvent.target.value).toBe(123);
      expect(objectEvent.target.value).toEqual({ complex: 'value' });
      expect(nullEvent.target.value).toBe(null);
    });

    it('should create independent event objects', () => {
      const event1 = createMockEvent('value1');
      const event2 = createMockEvent('value2');

      event1.preventDefault();
      
      expect(event1.preventDefault).toHaveBeenCalled();
      expect(event2.preventDefault).not.toHaveBeenCalled();
      expect(event1.target.value).not.toBe(event2.target.value);
    });
  });

  describe('waitForMockCall', () => {
    it('should resolve when mock is called', async () => {
      const mock = jest.fn();
      
      setTimeout(() => {
        mock();
      }, 50);

      await expect(waitForMockCall(mock, 200)).resolves.toBeUndefined();
      expect(mock).toHaveBeenCalled();
    });

    it('should reject when timeout is reached', async () => {
      const mock = jest.fn();

      await expect(waitForMockCall(mock, 100)).rejects.toThrow('Mock was not called within 100ms');
      expect(mock).not.toHaveBeenCalled();
    });

    it('should resolve immediately if already called', async () => {
      const mock = jest.fn();
      mock();

      const startTime = Date.now();
      await waitForMockCall(mock);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(50);
    });

    it('should use default timeout', async () => {
      const mock = jest.fn();
      
      setTimeout(() => {
        mock();
      }, 100);

      await expect(waitForMockCall(mock)).resolves.toBeUndefined();
    });

    it('should handle multiple calls', async () => {
      const mock = jest.fn();
      
      setTimeout(() => {
        mock();
        mock();
        mock();
      }, 50);

      await waitForMockCall(mock, 200);
      expect(mock).toHaveBeenCalledTimes(3);
    });

    it('should work with custom timeout values', async () => {
      const mock = jest.fn();
      
      setTimeout(() => {
        mock();
      }, 300);

      await expect(waitForMockCall(mock, 200)).rejects.toThrow('Mock was not called within 200ms');
      await expect(waitForMockCall(mock, 500)).resolves.toBeUndefined();
    });
  });

  describe('assertMockPropsMatch', () => {
    it('should assert when props match pattern', () => {
      mockComponent({ id: 1, name: 'Test' });
      mockComponent({ id: 2, name: 'Other' });

      expect(() => {
        assertMockPropsMatch(mockComponent, props => props.id === 2);
      }).not.toThrow();
    });

    it('should throw when no props match pattern', () => {
      mockComponent({ id: 1, name: 'Test' });
      mockComponent({ id: 2, name: 'Other' });

      expect(() => {
        assertMockPropsMatch(mockComponent, props => props.id === 3);
      }).toThrow('No mock call matched the provided matcher function');
    });

    it('should work with complex matcher functions', () => {
      mockComponent({ values: [1, 2, 3], type: 'array' });
      mockComponent({ values: [4, 5], type: 'array' });
      mockComponent({ values: [], type: 'empty' });

      expect(() => {
        assertMockPropsMatch(mockComponent, props => 
          props.type === 'array' && props.values.length === 3
        );
      }).not.toThrow();
    });

    it('should handle empty mock calls', () => {
      expect(() => {
        assertMockPropsMatch(mockComponent, props => true);
      }).toThrow('No mock call matched the provided matcher function');
    });

    it('should match first occurrence', () => {
      mockComponent({ id: 1 });
      mockComponent({ id: 2 });
      mockComponent({ id: 1 });

      let matchCount = 0;
      assertMockPropsMatch(mockComponent, props => {
        if (props.id === 1) {
          matchCount++;
          return true;
        }
        return false;
      });

      expect(matchCount).toBe(1);
    });

    it('should handle undefined props in matcher', () => {
      mockComponent({});
      
      expect(() => {
        assertMockPropsMatch(mockComponent, props => props.missing === undefined);
      }).not.toThrow();
    });

    it('should handle null props', () => {
      mockComponent(null);
      
      expect(() => {
        assertMockPropsMatch(mockComponent, props => props === null);
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should work with React component mocks', () => {
      const MockComponent = jest.fn(() => null);
      const props = {
        onChange: jest.fn(),
        value: 'test',
        disabled: false
      };

      // Call with both props and context as React would
      MockComponent(props, {});
      
      assertMockCalled(MockComponent, { value: 'test' });
      assertMockCalledTimes(MockComponent, 1);
      
      const lastProps = getLastMockProps(MockComponent);
      expect(lastProps.disabled).toBe(false);

      const event = createMockEvent('new value');
      lastProps.onChange(event.target.value);
      assertOnChangeCalled(lastProps.onChange, 'new value');
    });

    it('should handle async mock scenarios', async () => {
      const asyncMock = jest.fn();
      const triggerAsync = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            asyncMock('async result');
            resolve();
          }, 50);
        });
      };

      const promise = triggerAsync();
      await waitForMockCall(asyncMock, 200);
      
      expect(asyncMock).toHaveBeenCalledWith('async result');
      await promise;
    });

    it('should work with multiple mock resets', () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();
      const mock3 = jest.fn();

      mock1('first');
      mock2('second');
      mock3('third');

      expect(mock1).toHaveBeenCalledTimes(1);
      expect(mock2).toHaveBeenCalledTimes(1);
      expect(mock3).toHaveBeenCalledTimes(1);

      resetAllMocks(mock1, mock2, mock3);

      expect(mock1).toHaveBeenCalledTimes(0);
      expect(mock2).toHaveBeenCalledTimes(0);
      expect(mock3).toHaveBeenCalledTimes(0);

      mock1('again');
      expect(mock1).toHaveBeenCalledWith('again');
    });
  });
});