import React, { useState, useRef, useCallback } from "react";

const ClockFace = ({
  selectedHours,
  detachmentSegments: initialDetachmentSegments,
  hoveredHour,
  onHoverChange,
  onTearToggle,
  onSegmentToggle,
  setDetachmentSegments,
  readOnly = false
}) => {
  // Constants
  const outerRadius = 110;
  const innerRadius = 60;
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 14;
  const tearHitRadius = 20;
  const indicatorExtension = 1;
  const LONG_PRESS_DURATION = 500; // ms

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartSegment, setDrawStartSegment] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const [lastAngle, setLastAngle] = useState(null);
  const [currentDetachmentSegments, setCurrentDetachmentSegments] = useState(initialDetachmentSegments);
  const svgRef = useRef(null);

  // Utility functions
  const polarToCartesian = (angle, r) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: r * Math.cos(radian),
      y: r * Math.sin(radian)
    };
  };

  const cartesianToPolar = (x, y) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return (90 - angle + 360) % 360;
  };

  const degreeToSegment = (degree) => {
    return Math.floor(degree / 6) % 60;
  };

  const segmentToDegree = (segment) => {
    return (segment * 6) % 360;
  };

  const getSegmentFromPoint = useCallback((clientX, clientY) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;
    const relX = clientX - centerX;
    const relY = -(clientY - centerY);
    const angle = cartesianToPolar(relX, relY);
    return { segment: degreeToSegment(angle), angle };
  }, []);

  const getSegmentsBetween = (start, end, isCounterClockwise) => {
    const segments = [];
    if (isCounterClockwise) {
      let i = start;
      while (i !== end) {
        segments.push(i);
        i = (i - 1 + 60) % 60;
      }
      segments.push(end);
    } else {
      let i = start;
      while (i !== end) {
        segments.push(i);
        i = (i + 1) % 60;
      }
      segments.push(end);
    }
    return segments;
  };

  // Event handlers for tears
  const handleTearToggle = useCallback((hour, e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    onTearToggle(hour);
    return false;
  }, [readOnly, onTearToggle]);

  const handleDrawingStart = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();

    const pointer = e.touches?.[0] || e;
    const { segment, angle } = getSegmentFromPoint(pointer.clientX, pointer.clientY);

    if (segment !== null) {
      setIsDrawing(true);
      setDrawStartSegment(segment);
      setLastPosition(segment);
      setLastAngle(angle);
      setCurrentDetachmentSegments([...initialDetachmentSegments, `segment${segment}`]);
      setDetachmentSegments([...initialDetachmentSegments, `segment${segment}`]);

      if (document.getElementById('touch-debug')) {
        document.getElementById('touch-debug').textContent = JSON.stringify({
          action: 'start',
          segment,
          segments: [`segment${segment}`]
        }, null, 2);
      }
    }
  }, [getSegmentFromPoint, readOnly, setDetachmentSegments, initialDetachmentSegments]);

  const handleDrawing = useCallback((e) => {
    if (!isDrawing || readOnly || drawStartSegment === null || lastAngle === null) return;
    e.preventDefault();

    const pointer = e.touches?.[0] || e;
    const { segment: currentSegment, angle: currentAngle } = getSegmentFromPoint(pointer.clientX, pointer.clientY);

    if (currentSegment !== null && currentSegment !== lastPosition) {
      const debugEl = document.getElementById('touch-debug');

      // Determine drawing direction based on angle change
      let angleDiff = currentAngle - lastAngle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      const isCounterClockwise = angleDiff < 0;

      // Calculate segments between start and current
      const segmentsToAdd = getSegmentsBetween(lastPosition, currentSegment, isCounterClockwise);

      if (debugEl) {
        debugEl.textContent = JSON.stringify({
          action: 'draw',
          startSegment: drawStartSegment,
          currentSegment,
          segmentsToAdd,
          totalSegments: segmentsToAdd.length,
          isCounterClockwise
        }, null, 2);
      }

      // Create a Set of existing segments (without the "segment" prefix)
      const existingSegments = new Set(
        initialDetachmentSegments.map(s => parseInt(s.replace('segment', '')))
      );

      // Add new segments to the set
      segmentsToAdd.forEach(segment => existingSegments.add(segment));

      // Convert back to array with "segment" prefix
      const newSegments = Array.from(existingSegments).map(s => `segment${s}`);

      setCurrentDetachmentSegments(newSegments);
      setDetachmentSegments(newSegments);
      setLastPosition(currentSegment);
      setLastAngle(currentAngle);
    }
  }, [isDrawing, drawStartSegment, lastPosition, lastAngle, getSegmentFromPoint, readOnly, setDetachmentSegments, initialDetachmentSegments]);

  const handleDrawingEnd = useCallback((e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    setIsDrawing(false);
    setDrawStartSegment(null);
    setLastPosition(null);
    setLastAngle(null);
  }, [isDrawing, readOnly]);

// Event handlers for tears
const handleTearTouchStart = useCallback((hour) => (e) => {
  if (readOnly) return;
  e.preventDefault();
  e.stopPropagation();

  const touch = e.touches[0];
  setTouchStartTime(Date.now());
  setTouchStartPosition({ x: touch.clientX, y: touch.clientY });

  // Add debug output
  if (document.getElementById('touch-debug')) {
    document.getElementById('touch-debug').textContent = JSON.stringify({
      action: 'tear-touch-start',
      hour,
      timestamp: Date.now()
    }, null, 2);
  }
  return false;
}, [readOnly]);

// Event handlers for tears
const handleTearTouchEnd = useCallback((hour) => (e) => {
  if (readOnly) return;
  e.preventDefault();
  e.stopPropagation();

  if (!touchStartTime || !touchStartPosition) return;

  const touchEndTime = Date.now();
  const pressDuration = touchEndTime - touchStartTime;
  const touch = e.changedTouches[0];

  // Calculate movement distance
  const moveDistance = touchStartPosition ? Math.hypot(
    touch.clientX - touchStartPosition.x,
    touch.clientY - touchStartPosition.y
  ) : 0;

  // Only toggle if it was a long press and finger didn't move much
  if (pressDuration >= LONG_PRESS_DURATION && moveDistance < 10) {
    onTearToggle(hour);
  }

  // Add debug output
  if (document.getElementById('touch-debug')) {
    document.getElementById('touch-debug').textContent = JSON.stringify({
      action: 'tear-touch-end',
      hour,
      duration: pressDuration,
      moveDistance,
      wasLongPress: pressDuration >= LONG_PRESS_DURATION,
      timestamp: Date.now()
    }, null, 2);
  }

  setTouchStartTime(null);
  setTouchStartPosition(null);
  return false;
}, [readOnly, touchStartTime, touchStartPosition, onTearToggle]);

  // Style constants and helper functions
  const styles = {
    transition: 'fill 0.2s ease, stroke 0.2s ease',
    tear: {
      default: {
        fill: '#dc2626',
        stroke: '#dc2626',
        strokeWidth: '0.5'
      },
      hover: {
        fill: '#b91c1c',
        stroke: '#b91c1c',
        strokeWidth: '0.5'
      }
    },
    circle: {
      default: {
        fill: 'white',
        stroke: '#d1d5db',
        strokeWidth: '1.5'
      },
      hover: {
        fill: '#fee2e2',
        stroke: '#d1d5db',
        strokeWidth: '1.5'
      }
    }
  };

  const getStyles = (hour, hoveredHour, isSelected) => {
    const isHovered = hoveredHour === hour;
    if (isSelected) {
      return {
        ...styles.tear.default,
        ...(isHovered && !readOnly ? styles.tear.hover : {}),
        transition: styles.transition
      };
    }
    return {
      ...styles.circle.default,
      ...(isHovered && !readOnly ? styles.circle.hover : {}),
      transition: styles.transition
    };
  };

  // SVG path helpers
  const createTearPath = (x, y, angle) => {
    const tearPath = `
        M -4 -8
        c -0.091 -0.936 0.333 -1.232 0.777 0.658
        c 0.389 1.655 1.060 3.281 1.060 3.281
        s 0 0.254 1.022 0.617
        c 0.793 0.282 2.183 -2.882 2.183 -2.882
        s 1.953 -4.433 1.437 -1.294
        c -1.217 7.410 -1.640 6.716 -1.664 6.897
        c -0.024 0.181 -0.510 0.596 -0.510 0.596
        s -0.178 0.183 -0.585 0.327
        c -3.121 1.110 -3.163 -3.001 -3.163 -3.001
        L -4 -8
    `;
    return {
      d: tearPath,
      transform: `translate(${x}, ${y}) scale(1.5) rotate(${angle})`
    };
  };

  const getPosition = (hour, radius) => {
    const angle = hour * 30;
    const point = polarToCartesian(angle, radius);
    return {
      ...point,
      angle
    };
  };

  // Render component
  return (
    <div className="flex justify-center items-center w-full">
      <div
        className={`relative touch-none select-none ${readOnly ? 'pointer-events-none' : ''}`}
        style={{
          width: readOnly ? "200px" : "min(80vw, min(80vh, 500px))",
          aspectRatio: "1",
          minWidth: readOnly ? "200px" : "200px",
          maxWidth: readOnly ? "200px" : "500px",
          margin: "0 auto"
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg
          ref={svgRef}
          viewBox="-110 -110 220 220"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleDrawingStart}
          onMouseMove={handleDrawing}
          onMouseUp={handleDrawingEnd}
          onMouseLeave={handleDrawingEnd}
          onTouchStart={handleDrawingStart}
          onTouchMove={handleDrawing}
          onTouchEnd={handleDrawingEnd}
        >
          {/* Background circles */}
          <g className="pointer-events-none">
            <circle cx="0" cy="0" r={outerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
            <circle cx="0" cy="0" r={middleRadius} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
            <circle cx="0" cy="0" r={innerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
          </g>

          {/* Detachment segments */}
          <g className="pointer-events-auto" style={{ isolation: 'isolate' }}>
            {[...Array(60)].map((_, i) => {
              const isHighlighted = currentDetachmentSegments.includes(`segment${i}`);
              const degreeStart = segmentToDegree(i);
              const degreeEnd = segmentToDegree(i + 1);
              const posStart = polarToCartesian(degreeStart, innerRadius);
              const posOuterStart = polarToCartesian(degreeStart, outerRadius);
              const posEnd = polarToCartesian(degreeEnd, innerRadius);
              const posOuterEnd = polarToCartesian(degreeEnd, outerRadius);

              return (
                <path
                  key={`segment-${i}`}
                  d={`M ${posStart.x} ${posStart.y} 
                      L ${posOuterStart.x} ${posOuterStart.y} 
                      A ${outerRadius} ${outerRadius} 0 0 1 ${posOuterEnd.x} ${posOuterEnd.y}
                      L ${posEnd.x} ${posEnd.y}
                      A ${innerRadius} ${innerRadius} 0 0 0 ${posStart.x} ${posStart.y}`}
                  fill={isHighlighted ? "rgba(59, 130, 246, 0.5)" : "transparent"}
                  className={`cursor-pointer hover:fill-blue-200 transition-colors ${readOnly ? '' : 'pointer-events-auto'}`}
                  style={{ pointerEvents: readOnly ? 'none' : 'auto' }}
                />
              );
            })}
          </g>

          {/* Tear markers */}
          <g className="pointer-events-auto" style={{ isolation: 'isolate' }}>
            {[...Array(12)].map((_, i) => {
              const hour = i === 0 ? 12 : i;
              const visualPos = getPosition(hour, tearRadius);
              const isSelected = selectedHours.includes(hour);

              return (
                <g
                  key={`tear-${hour}`}
                  onClick={(e) => {
                    // Keep click handling for desktop
                    if (!('ontouchstart' in window)) {
                      handleTearToggle(hour, e);
                    }
                  }}
                  onTouchStart={handleTearTouchStart(hour)}
                  onTouchEnd={handleTearTouchEnd(hour)}
                  onMouseEnter={() => !readOnly && onHoverChange(hour)}
                  onMouseLeave={() => !readOnly && onHoverChange(null)}
                  style={{ cursor: readOnly ? 'default' : 'pointer' }}
                >
                  {!readOnly && (
                    <circle
                      cx={visualPos.x}
                      cy={visualPos.y}
                      r={tearHitRadius}
                      fill="transparent"
                      className="pointer-events-auto"
                    />
                  )}

                  {isSelected ? (
                    <path
                      {...createTearPath(visualPos.x, visualPos.y, visualPos.angle)}
                      style={{
                        ...getStyles(hour, hoveredHour, true),
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
                        ...getStyles(hour, hoveredHour, false),
                        pointerEvents: 'all',
                        zIndex: 10
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 12 o'clock indicator */}
          <line
            className="pointer-events-none"
            x1="0"
            y1={-outerRadius}
            x2="0"
            y2={-(outerRadius + indicatorExtension)}
            stroke="#666"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default ClockFace;
