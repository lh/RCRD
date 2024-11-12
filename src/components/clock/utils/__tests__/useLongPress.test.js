// src/components/clock/utils/__tests__/useLongPress.test.js
import { renderHook, act } from '@testing-library/react';
import { useLongPress, LONG_PRESS_DURATION } from '../useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createTouchEvent = (x = 0, y = 0) => ({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    touches: [{ clientX: x, clientY: y }],
    changedTouches: [{ clientX: x, clientY: y }]
  });

  test('should handle long press', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));

    // Simulate press start
    act(() => {
      result.current.handleTouchStart(createTouchEvent(100, 100));
    });

    // Fast-forward time
    jest.advanceTimersByTime(LONG_PRESS_DURATION + 100);

    // Simulate press end at same position (no movement)
    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    expect(callback).toHaveBeenCalled();
  });

  test('should not trigger on short press', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));

    act(() => {
      result.current.handleTouchStart(createTouchEvent(100, 100));
    });

    // Only wait less than threshold
    jest.advanceTimersByTime(LONG_PRESS_DURATION - 100);

    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('should not trigger if moved too far', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));

    act(() => {
      result.current.handleTouchStart(createTouchEvent(100, 100));
    });

    jest.advanceTimersByTime(LONG_PRESS_DURATION + 100);

    // End touch 20px away (> 10px movement threshold)
    act(() => {
      result.current.handleTouchEnd(createTouchEvent(120, 100));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('should accept custom threshold', () => {
    const callback = jest.fn();
    const customThreshold = 1000;
    const { result } = renderHook(() => 
      useLongPress(callback, { threshold: customThreshold })
    );

    act(() => {
      result.current.handleTouchStart(createTouchEvent(100, 100));
    });

    // Wait just past custom threshold
    jest.advanceTimersByTime(customThreshold + 100);

    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    expect(callback).toHaveBeenCalled();
  });

  test('should prevent default and stop propagation of events', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));
    
    const startEvent = createTouchEvent(100, 100);
    const endEvent = createTouchEvent(100, 100);

    act(() => {
      result.current.handleTouchStart(startEvent);
    });

    act(() => {
      result.current.handleTouchEnd(endEvent);
    });

    expect(startEvent.preventDefault).toHaveBeenCalled();
    expect(startEvent.stopPropagation).toHaveBeenCalled();
    expect(endEvent.preventDefault).toHaveBeenCalled();
    expect(endEvent.stopPropagation).toHaveBeenCalled();
  });

  test('should handle touchEnd without prior touchStart', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));
    
    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('should reset internal state after touch end', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));

    // Start touch
    act(() => {
      result.current.handleTouchStart(createTouchEvent(100, 100));
    });

    // End touch immediately
    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    // Start another touch
    act(() => {
      result.current.handleTouchStart(createTouchEvent(100, 100));
    });

    // Should work as if it's a fresh start
    jest.advanceTimersByTime(LONG_PRESS_DURATION + 100);
    
    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should handle multiple touches gracefully', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));

    const multiTouchEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 200 }
      ],
      changedTouches: [
        { clientX: 100, clientY: 100 }
      ]
    };

    act(() => {
      result.current.handleTouchStart(multiTouchEvent);
    });

    jest.advanceTimersByTime(LONG_PRESS_DURATION + 100);

    act(() => {
      result.current.handleTouchEnd(createTouchEvent(100, 100));
    });

    // Should still work with first touch point
    expect(callback).toHaveBeenCalled();
  });
});
