// src/components/clock/utils/useLongPress.test.js
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  test('should handle long press', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));

    // Test implementation here
    act(() => {
      // Simulate press start
      result.current.onTouchStart({ preventDefault: jest.fn() });
    });

    // Fast-forward time
    jest.advanceTimersByTime(600);

    act(() => {
      // Simulate press end
      result.current.onTouchEnd({ preventDefault: jest.fn() });
    });

    expect(callback).toHaveBeenCalled();
  });

  test('should not trigger on short press', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));

    act(() => {
      result.current.onTouchStart({ preventDefault: jest.fn() });
    });

    // Only wait 400ms (less than threshold)
    jest.advanceTimersByTime(400);

    act(() => {
      result.current.onTouchEnd({ preventDefault: jest.fn() });
    });

    expect(callback).not.toHaveBeenCalled();
  });
});