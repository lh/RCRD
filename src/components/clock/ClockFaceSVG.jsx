import React from "react";
import { CLOCK } from './utils/clockConstants.js';
import {
  polarToCartesian,
  segmentToDegree,
  getPosition,
  createTearPath
} from './utils/clockFaceGeometry.js';
import { getStyles } from './styles/clockFaceStyles.js';
import {
  handleTearToggle,
  handleDrawingStart,
  handleDrawing,
  handleDrawingEnd,
  handleTearTouchStart,
  handleTearTouchEnd
} from './handlers/clockFaceHandlers.js';

const ClockFaceSVG = ({
  svgRef,
  readOnly,
  selectedHours,
  hoveredHour,
  onHoverChange,
  onTearToggle,
  isDrawing,
  setIsDrawing,
  drawStartSegment,
  setDrawStartSegment,
  lastPosition,
  setLastPosition,
  lastAngle,
  setLastAngle,
  drawMode,
  setDrawMode,
  currentDetachmentSegments,
  setCurrentDetachmentSegments,
  initialDetachmentSegments,
  setDetachmentSegments,
  touchStartTime,
  setTouchStartTime,
  touchStartPosition,
  setTouchStartPosition,
  LONG_PRESS_DURATION
}) => {
  // Constants
  const outerRadius = 110;
  const innerRadius = 60;
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 14;
  const tearHitRadius = 20;
  const indicatorExtension = 1;

  return (
    <svg
      ref={svgRef}
      viewBox="-110 -110 220 220"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      onMouseDown={(e) => handleDrawingStart(
        readOnly,
        svgRef,
        initialDetachmentSegments,
        setIsDrawing,
        setDrawStartSegment,
        setLastPosition,
        setLastAngle,
        setDrawMode,
        setCurrentDetachmentSegments,
        setDetachmentSegments,
        e
      )}
      onMouseMove={(e) => handleDrawing(
        isDrawing,
        readOnly,
        drawStartSegment,
        lastAngle,
        drawMode,
        svgRef,
        lastPosition,
        initialDetachmentSegments,
        setCurrentDetachmentSegments,
        setDetachmentSegments,
        setLastPosition,
        setLastAngle,
        e
      )}
      onMouseUp={(e) => handleDrawingEnd(
        isDrawing,
        readOnly,
        setIsDrawing,
        setDrawStartSegment,
        setLastPosition,
        setLastAngle,
        setDrawMode,
        e
      )}
      onMouseLeave={(e) => handleDrawingEnd(
        isDrawing,
        readOnly,
        setIsDrawing,
        setDrawStartSegment,
        setLastPosition,
        setLastAngle,
        setDrawMode,
        e
      )}
      onTouchStart={(e) => handleDrawingStart(
        readOnly,
        svgRef,
        initialDetachmentSegments,
        setIsDrawing,
        setDrawStartSegment,
        setLastPosition,
        setLastAngle,
        setDrawMode,
        setCurrentDetachmentSegments,
        setDetachmentSegments,
        e
      )}
      onTouchMove={(e) => handleDrawing(
        isDrawing,
        readOnly,
        drawStartSegment,
        lastAngle,
        drawMode,
        svgRef,
        lastPosition,
        initialDetachmentSegments,
        setCurrentDetachmentSegments,
        setDetachmentSegments,
        setLastPosition,
        setLastAngle,
        e
      )}
      onTouchEnd={(e) => handleDrawingEnd(
        isDrawing,
        readOnly,
        setIsDrawing,
        setDrawStartSegment,
        setLastPosition,
        setLastAngle,
        setDrawMode,
        e
      )}
    >
      {/* Background circles */}
      <g className="pointer-events-none">
        <circle cx="0" cy="0" r={outerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
        <circle cx="0" cy="0" r={middleRadius} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
        <circle cx="0" cy="0" r={innerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
      </g>

      {/* Detachment segments */}
      <g className="pointer-events-auto" style={{ isolation: 'isolate' }}>
        {[...Array(CLOCK.SEGMENTS)].map((_, i) => {
          const segmentId = `segment${i}`;
          const isHighlighted = currentDetachmentSegments.includes(segmentId);
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
              title={isHighlighted ? 
                "Click and drag to remove detachment" : 
                "Click and drag to add detachment"}
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
                  handleTearToggle(readOnly, onTearToggle, hour, e);
                }
              }}
              onTouchStart={handleTearTouchStart(readOnly, setTouchStartTime, setTouchStartPosition, hour)}
              onTouchEnd={handleTearTouchEnd(readOnly, touchStartTime, touchStartPosition, onTearToggle, LONG_PRESS_DURATION, hour)}
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
  );
};

export default ClockFaceSVG;
