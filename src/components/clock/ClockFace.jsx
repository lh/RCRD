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
  const mobileInnerRadius = 40;
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 14;
  const tearHitRadius = 20;
  const indicatorExtension = 1;
  const LONG_PRESS_DURATION = 500; // ms

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const svgRef = useRef(null);

  // Detect touch device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsTouchDevice(isMobile && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }, []);

  const segmentCount = isTouchDevice ? 12 : 60;

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

  // Style constants
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

  const segmentToHour = (segment) => {
    const hour = Math.floor(segment / 5) % 12;
    return hour === 0 ? 12 : hour;
  };

  const getSegmentFromPoint = useCallback((clientX, clientY) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRef.current.getBoundingClientRect().top + svgRect.height / 2;
    const relX = clientX - centerX;
    const relY = -(clientY - centerY);
    const angle = cartesianToPolar(relX, relY);
    const segment = degreeToSegment(angle);

    if (isTouchDevice) {
      const snappedSegment = Math.round(segment / (60 / 12)) * (60 / 12);
      return snappedSegment % 60;
    }

    return segment;
  }, [isTouchDevice]);

  // Touch event handlers for tears
  const handleTouchStart = useCallback((hour) => (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();


    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
    return false;
  }, [readOnly]);

  const handleTouchEnd = useCallback((hour) => (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();


    if (!touchStartTime || !touchStartPosition) return;

    const touchEndTime = Date.now();
    const pressDuration = touchEndTime - touchStartTime;

    // Only toggle if it was a long press and the finger didn't move much
    if (pressDuration >= LONG_PRESS_DURATION) {
      onTearToggle(hour);
    }

    setTouchStartTime(null);
    setTouchStartPosition(null);
    return false;
  }, [readOnly, touchStartTime, touchStartPosition, onTearToggle]);

  // Drawing event handlers
  const handleDrawingStart = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();

    const touch = e.touches?.[0] || e;
    const segment = getSegmentFromPoint(touch.clientX, touch.clientY);
    if (segment !== null) {
      setIsDrawing(true);
      setLastPosition(segment);
      onSegmentToggle(segment);
    }
  }, [getSegmentFromPoint, onSegmentToggle, readOnly]);

  const handleDrawing = useCallback((e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();

    const touch = e.touches?.[0] || e;
    const currentSegment = getSegmentFromPoint(touch.clientX, touch.clientY);
    if (currentSegment !== null && currentSegment !== lastPosition) {
      onSegmentToggle(currentSegment);
      setLastPosition(currentSegment);
    }
  }, [isDrawing, lastPosition, getSegmentFromPoint, onSegmentToggle, readOnly]);

  const handleDrawingEnd = useCallback((e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    setIsDrawing(false);
    setLastPosition(null);
  }, [isDrawing, readOnly]);

  const effectiveInnerRadius = isTouchDevice ? mobileInnerRadius : innerRadius;

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
          <g className="pointer-events-auto" style={{ isolation: 'isolate' }}>
            {[...Array(segmentCount)].map((_, i) => {
              const logicalSegmentStart = Math.floor(i * (60 / segmentCount));
              const logicalSegmentEnd = Math.floor((i + 1) * (60 / segmentCount));

              const isHighlighted = detachmentSegments.some(
                (segment) => segment >= logicalSegmentStart && segment < logicalSegmentEnd
              );

              const degreeStart = segmentToDegree(logicalSegmentStart);
              const degreeEnd = segmentToDegree(logicalSegmentEnd);
              const posStart = polarToCartesian(degreeStart, effectiveInnerRadius);
              const posOuterStart = polarToCartesian(degreeStart, outerRadius);
              const posEnd = polarToCartesian(degreeEnd, effectiveInnerRadius);
              const posOuterEnd = polarToCartesian(degreeEnd, outerRadius);

              return (
                <path
                  key={`segment-${i}`}
                  d={`M ${posStart.x} ${posStart.y} 
      L ${posOuterStart.x} ${posOuterStart.y} 
      A ${outerRadius} ${outerRadius} 0 0 1 ${posOuterEnd.x} ${posOuterEnd.y}
      L ${posEnd.x} ${posEnd.y}
      A ${effectiveInnerRadius} ${effectiveInnerRadius} 0 0 0 ${posStart.x} ${posStart.y}`}
                  fill={isHighlighted ? "rgba(59, 130, 246, 0.5)" : "transparent"}
                  className={`cursor-pointer hover:fill-blue-200 transition-colors ${readOnly ? '' : 'pointer-events-auto'}`}
                  style={{ pointerEvents: readOnly ? 'none' : 'auto' }}
                />
              );
            })}
          </g>

          {/* Tear markers layer */}
          <g className="pointer-events-auto" style={{ isolation: 'isolate' }}>
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
                    return false;
                  } : undefined}
                  onTouchStart={isTouchDevice && !readOnly ? handleTouchStart(hour) : undefined}
                  onTouchEnd={isTouchDevice && !readOnly ? handleTouchEnd(hour) : undefined}
                  onMouseEnter={!readOnly ? () => onHoverChange(hour) : undefined}
                  onMouseLeave={!readOnly ? () => onHoverChange(null) : undefined}
                  style={{
                    cursor: readOnly ? 'default' : 'pointer'
                  }}
                >
                  {/* Invisible larger hit area for all devices */}
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