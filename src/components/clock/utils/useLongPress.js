// src/components/clock/utils/useLongPress.js
import { useState, useCallback } from 'react';

export const LONG_PRESS_DURATION = 500;

export const useLongPress = (onLongPress, { threshold = LONG_PRESS_DURATION } = {}) => {
    const [touchStartTime, setTouchStartTime] = useState(null);
    const [touchStartPosition, setTouchStartPosition] = useState(null);

    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        setTouchStartTime(Date.now());
        setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!touchStartTime || !touchStartPosition) return;

        const touchEndTime = Date.now();
        const pressDuration = touchEndTime - touchStartTime;
        const touch = e.changedTouches[0];
        
        const moveDistance = Math.hypot(
            touch.clientX - touchStartPosition.x,
            touch.clientY - touchStartPosition.y
        );

        if (pressDuration >= threshold && moveDistance < 10) {
            onLongPress();
        }

        setTouchStartTime(null);
        setTouchStartPosition(null);
    }, [touchStartTime, touchStartPosition, threshold, onLongPress]);

    return {
        handleTouchStart,
        handleTouchEnd
    };
};