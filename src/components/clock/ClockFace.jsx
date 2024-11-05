import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  segmentToClockHour,
  clockHourToSegmentsMap
} from "./utils/clockMapping";

const ClockFace = ({
  selectedHours,
  detachmentSegments,
  hoveredHour,
  onHoverChange,
  onTearToggle,
  onSegmentToggle,
  readOnly = false
}) => {
  // Constants
  const outerRadius = 110;
  const innerRadius = 60;
  const mobileInnerRadius = 40; // Smaller inner radius for mobile
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 14;
  const tearHitRadius = 20; // Larger hit area for tears on mobile
  const indicatorExtension = 1;

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const svgRef = useRef(null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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

  // Check if a point is within tear hit area
  const isWithinTearArea = useCallback((x, y) => {
    if (!isTouchDevice) return false;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;
    const relX = x - centerX;
    const relY = -(y - centerY);
    const angle = cartesianToPolar(relX, relY);
    const hourAngle = Math.floor((angle + 15) / 30) % 12;
    const hour = hourAngle === 0 ? 12 : hourAngle;
    
    const tearPos = getPosition(hour, tearRadius);
    const dx = relX - tearPos.x;
    const dy = -relY - tearPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= tearHitRadius;
  }, [isTouchDevice]);

  // Style constants for tears
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

  // Style helper for tears
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

  // Tear path creation
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

  // Position calculation for hours
  const getPosition = (hour, radius) => {
    const angle = hour * 30; // 360/12 = 30 degrees per hour
    const point = polarToCartesian(angle, radius);
    return {
      ...point,
      angle
    };
  };

  // Event handlers
  const getSegmentFromPoint = useCallback((clientX, clientY) => {
    if (isWithinTearArea(clientX, clientY)) return null;

    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;
    const relX = clientX - centerX;
    const relY = -(clientY - centerY);
    const angle = cartesianToPolar(relX, relY);
    return degreeToSegment(angle);
  }, [isWithinTearArea]);

  const handleDrawingStart = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();
    
    const touch = e.touches?.[0] || e;
    if (isWithinTearArea(touch.clientX, touch.clientY)) return;

    setIsDrawing(true);
    const segment = getSegmentFromPoint(touch.clientX, touch.clientY);
    if (segment !== null) {
      setLastPosition(segment);
      onSegmentToggle(segment);
    }
  }, [getSegmentFromPoint, onSegmentToggle, readOnly, isWithinTearArea]);

  const handleDrawing = useCallback((e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    
    const touch = e.touches?.[0] || e;
    if (isWithinTearArea(touch.clientX, touch.clientY)) return;

    const currentSegment = getSegmentFromPoint(touch.clientX, touch.clientY);
    if (currentSegment !== null && currentSegment !== lastPosition) {
      onSegmentToggle(currentSegment);
      setLastPosition(currentSegment);
    }
  }, [isDrawing, lastPosition, getSegmentFromPoint, onSegmentToggle, readOnly, isWithinTearArea]);

  const handleDrawingEnd = useCallback((e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    setIsDrawing(false);
    setLastPosition(null);
  }, [isDrawing, readOnly]);

  // Long press handlers for mobile
  const handleTouchStart = useCallback((hour) => (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    const timer = setTimeout(() => {
      onTearToggle(hour);
    }, 500);
    setLongPressTimer(timer);
  }, [onTearToggle, readOnly]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const effectiveInnerRadius = isTouchDevice ? mobileInnerRadius : innerRadius;

  return (
    <div className={`relative touch-none select-none ${readOnly ? 'pointer-events-none' : ''}`}
      style={{
        width: readOnly ? "200px" : "min(80vw, min(80vh, 500px))",
        aspectRatio: "1",
        minWidth: readOnly ? "200px" : "200px",
        maxWidth: readOnly ? "200px" : "500px",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg
        ref={svgRef}
        viewBox="-110 -110 220 220"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={!isTouchDevice ? handleDrawingStart : undefined}
        onMouseMove={!isTouchDevice ? handleDrawing : undefined}
        onMouseUp={!isTouchDevice ? handleDrawingEnd : undefined}
        onMouseLeave={!isTouchDevice ? handleDrawingEnd : undefined}
        onTouchStart={isTouchDevice ? handleDrawingStart : undefined}
        onTouchMove={isTouchDevice ? handleDrawing : undefined}
        onTouchEnd={isTouchDevice ? handleDrawingEnd : undefined}
      >
        {/* Background and grid circles */}
        <g className="pointer-events-none">
          <circle cx="0" cy="0" r={outerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
          <circle cx="0" cy="0" r={middleRadius} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
          <circle cx="0" cy="0" r={effectiveInnerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
        </g>

        {/* Detachment segments layer */}
        <g className="pointer-events-auto">
          {[...Array(60)].map((_, i) => {
            const degree = segmentToDegree(i);
            const pos = polarToCartesian(degree, effectiveInnerRadius);
            const posOuter = polarToCartesian(degree, outerRadius);
            const nextDegree = segmentToDegree(i + 1);
            const nextPos = polarToCartesian(nextDegree, effectiveInnerRadius);
            const nextPosOuter = polarToCartesian(nextDegree, outerRadius);

            return (
              <path
                key={`segment-${i}`}
                d={`M ${pos.x} ${pos.y} 
                    L ${posOuter.x} ${posOuter.y} 
                    A ${outerRadius} ${outerRadius} 0 0 1 ${nextPosOuter.x} ${nextPosOuter.y}
                    L ${nextPos.x} ${nextPos.y}
                    A ${effectiveInnerRadius} ${effectiveInnerRadius} 0 0 0 ${pos.x} ${pos.y}`}
                fill={detachmentSegments.includes(i) ? "rgba(59, 130, 246, 0.5)" : "transparent"}
                className={`cursor-pointer hover:fill-blue-200 transition-colors ${readOnly ? '' : 'pointer-events-auto'}`}
              />
            );
          })}
        </g>

        {/* Tear markers layer */}
        <g className="pointer-events-auto">
          {[...Array(12)].map((_, i) => {
            const hour = i === 0 ? 12 : i;
            const visualPos = getPosition(hour, tearRadius);
            const isSelected = selectedHours.includes(hour);

            return (
              <g
                key={`tear-${hour}`}
                onClick={!isTouchDevice && !readOnly ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTearToggle(hour);
                } : undefined}
                onTouchStart={isTouchDevice && !readOnly ? handleTouchStart(hour) : undefined}
                onTouchEnd={isTouchDevice && !readOnly ? handleTouchEnd : undefined}
                onMouseEnter={!isTouchDevice && !readOnly ? () => onHoverChange(hour) : undefined}
                onMouseLeave={!isTouchDevice && !readOnly ? () => onHoverChange(null) : undefined}
                style={{
                  cursor: readOnly ? 'default' : 'pointer'
                }}
              >
                {/* Invisible larger hit area for mobile */}
                {isTouchDevice && !readOnly && (
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
                    style={getStyles(hour, hoveredHour, true)}
                  />
                ) : (
                  <circle
                    cx={visualPos.x}
                    cy={visualPos.y}
                    r="12"
                    style={getStyles(hour, hoveredHour, false)}
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
  );
};

export default ClockFace;
