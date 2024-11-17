import React from "react";
import { CLOCK } from './utils/clockConstants.js';
import { polarToCartesian, createTearPath, getPosition, getStyles, segmentToDegree } from './ClockFaceUtils';

const ClockFaceSVG = ({
  svgRef,
  outerRadius,
  innerRadius,
  middleRadius,
  tearRadius,
  tearHitRadius,
  indicatorExtension,
  currentDetachmentSegments,
  selectedHours,
  hoveredHour,
  readOnly,
  handleDrawingStart,
  handleDrawing,
  handleDrawingEnd,
  handleTearToggle,
  handleTearTouchStart,
  handleTearTouchEnd,
  onHoverChange
}) => (
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

export default ClockFaceSVG;
