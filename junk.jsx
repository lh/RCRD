import React, { useState, useRef, useCallback, useEffect } from "react";

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

  // State
  const [lastTearSelection, setLastTearSelection] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const svgRef = useRef(null);
  
  // Add cooldown tracking
  const lastSelectionTime = useRef(null);
  const COOLDOWN_PERIOD = 500; // 500ms cooldown

  // Detect touch device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsTouchDevice(isMobile && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
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

  const handleTearSelection = useCallback((hour) => {
    const now = Date.now();
    
    // If this is the same tear that was just selected and we're within cooldown
    if (hour === lastTearSelection && 
        lastSelectionTime.current && 
        (now - lastSelectionTime.current) < COOLDOWN_PERIOD) {
      return; // Ignore the selection
    }
    
    onTearToggle(hour);
    setLastTearSelection(hour);
    lastSelectionTime.current = now;
  }, [onTearToggle, lastTearSelection]);

  const handleTouchStart = useCallback((hour) => (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    
    const timer = setTimeout(() => {
      handleTearSelection(hour);
    }, 500);
    
    setLongPressTimer(timer);
  }, [handleTearSelection, readOnly]);

  const handleTouchEnd = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer, readOnly]);

  // Get segment from point
  const getSegmentFromPoint = useCallback((clientX, clientY) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = centerX;
    const relX = clientX - centerX;
    const relY = -(clientY - centerY);
    const angle = cartesianToPolar(relX, relY);
    const segment = Math.floor(angle / 6) % 60;

    if (isTouchDevice) {
      return Math.round(segment / 5) * 5 % 60;
    }

    return segment;
  }, [isTouchDevice]);

  // Drawing handlers
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // Rest of the component (styles, rendering logic, etc.) remains unchanged
  // Include all the existing code for tear styles, paths, and rendering...

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
          {/* Keep all existing SVG elements (grid circles, segments, tears, etc.) */}
          {/* The rendering part of your component stays exactly the same */}
          
          {/* Only modify the touch event handlers in the tear markers section */}
          <g className="pointer-events-auto">
            {[...Array(12)].map((_, i) => {
              const hour = i === 0 ? 12 : i;
              const visualPos = getPosition(hour, tearRadius);
              const isSelected = selectedHours.includes(hour);

              return (
                <g
                  key={`tear-${hour}`}
                  onClick={!readOnly ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isTouchDevice) {
                      handleTearSelection(hour);
                    }
                  } : undefined}
                  onTouchStart={isTouchDevice && !readOnly ? handleTouchStart(hour) : undefined}
                  onTouchEnd={isTouchDevice && !readOnly ? handleTouchEnd : undefined}
                  onMouseEnter={!readOnly ? () => onHoverChange(hour) : undefined}
                  onMouseLeave={!readOnly ? () => onHoverChange(null) : undefined}
                  style={{
                    cursor: readOnly ? 'default' : 'pointer'
                  }}
                >
                  {/* Keep existing tear/circle rendering code */}
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
        </svg>
      </div>
    </div>
  );
};

export default ClockFace;