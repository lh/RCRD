// src/components/clock/utils/useLongPress.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { useLongPress, LONG_PRESS_DURATION } from './useLongPress';

describe('useLongPress', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should trigger callback on long press', () => {
        const onLongPress = jest.fn();
        const { result } = renderHook(() => useLongPress(onLongPress));

        // Simulate touch start
        act(() => {
            result.current.handleTouchStart({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                touches: [{ clientX: 100, clientY: 100 }]
            });
        });

        // Advance timer
        act(() => {
            jest.advanceTimersByTime(LONG_PRESS_DURATION);
        });

        // Simulate touch end
        act(() => {
            result.current.handleTouchEnd({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                changedTouches: [{ clientX: 101, clientY: 101 }]
            });
        });

        expect(onLongPress).toHaveBeenCalled();
    });

    it('should not trigger on short press', () => {
        const onLongPress = jest.fn();
        const { result } = renderHook(() => useLongPress(onLongPress));

        act(() => {
            result.current.handleTouchStart({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                touches: [{ clientX: 100, clientY: 100 }]
            });
        });

        act(() => {
            jest.advanceTimersByTime(LONG_PRESS_DURATION - 100);
            result.current.handleTouchEnd({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                changedTouches: [{ clientX: 101, clientY: 101 }]
            });
        });

        expect(onLongPress).not.toHaveBeenCalled();
    });
});