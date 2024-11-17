import React from 'react';
import { DIMENSIONS, getStyles, createTearPath } from './styles/clockStyles.js';
import { getPosition } from './utils/clockGeometry.js';

const TearMarker = ({
  hour,
  isSelected,
  hoveredHour,
  readOnly,
  onHoverChange,
  onTearToggle,
  touchStartTime,
  touchStartPosition,
  setTouchStartTime,
  setTouchStartPosition
}) => {
  const LONG_PRESS_DURATION = 500; // ms
  const visualPos = getPosition(hour, DIMENSIONS.tearRadius);

  const handleTearToggle = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    onTearToggle(hour);
    return false;
  };

  const handleTearTouchStart = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
    return false;
  };

  const handleTearTouchEnd = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();

    if (!touchStartTime || !touchStartPosition) return;

    const touchEndTime = Date.now();
    const pressDuration = touchEndTime - touchStartTime;
    const touch = e.changedTouches[0];

    const moveDistance = touchStartPosition ? Math.hypot(
      touch.clientX - touchStartPosition.x,
      touch.clientY - touchStartPosition.y
    ) : 0;

    if (pressDuration >= LONG_PRESS_DURATION && moveDistance < 10) {
      onTearToggle(hour);
    }

    setTouchStartTime(null);
    setTouchStartPosition(null);
    return false;
  };

  return (
    <g
      onClick={(e) => {
        // Keep click handling for desktop
        if (!('ontouchstart' in window)) {
          handleTearToggle(e);
        }
      }}
      onTouchStart={handleTearTouchStart}
      onTouchEnd={handleTearTouchEnd}
      onMouseEnter={() => !readOnly && onHoverChange(hour)}
      onMouseLeave={() => !readOnly && onHoverChange(null)}
      style={{ cursor: readOnly ? 'default' : 'pointer' }}
    >
      {!readOnly && (
        <circle
          cx={visualPos.x}
          cy={visualPos.y}
          r={DIMENSIONS.tearHitRadius}
          fill="transparent"
          className="pointer-events-auto"
        />
      )}

      {isSelected ? (
        <path
          {...createTearPath(visualPos.x, visualPos.y, visualPos.angle)}
          style={{
            ...getStyles(hour, hoveredHour, true, readOnly),
            zIndex: 10
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <circle
          cx={visualPos.x}
          cy={visualPos.y}
          r="12"
          style={{
            ...getStyles(hour, hoveredHour, false, readOnly),
            pointerEvents: 'all',
            zIndex: 10
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}
    </g>
  );
};

export default TearMarker;
