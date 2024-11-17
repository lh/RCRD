import React, { useState, useRef } from "react";
import ClockFaceSVG from './ClockFaceSVG.jsx';

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
  const LONG_PRESS_DURATION = 500; // ms

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartSegment, setDrawStartSegment] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const [lastAngle, setLastAngle] = useState(null);
  const [currentDetachmentSegments, setCurrentDetachmentSegments] = useState(initialDetachmentSegments);
  const [drawMode, setDrawMode] = useState(null); // 'add' or 'remove'
  const svgRef = useRef(null);

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
        <ClockFaceSVG
          svgRef={svgRef}
          readOnly={readOnly}
          selectedHours={selectedHours}
          hoveredHour={hoveredHour}
          onHoverChange={onHoverChange}
          onTearToggle={onTearToggle}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          drawStartSegment={drawStartSegment}
          setDrawStartSegment={setDrawStartSegment}
          lastPosition={lastPosition}
          setLastPosition={setLastPosition}
          lastAngle={lastAngle}
          setLastAngle={setLastAngle}
          drawMode={drawMode}
          setDrawMode={setDrawMode}
          currentDetachmentSegments={currentDetachmentSegments}
          setCurrentDetachmentSegments={setCurrentDetachmentSegments}
          initialDetachmentSegments={initialDetachmentSegments}
          setDetachmentSegments={setDetachmentSegments}
          touchStartTime={touchStartTime}
          setTouchStartTime={setTouchStartTime}
          touchStartPosition={touchStartPosition}
          setTouchStartPosition={setTouchStartPosition}
          LONG_PRESS_DURATION={LONG_PRESS_DURATION}
        />
      </div>
    </div>
  );
};

export default ClockFace;
