import { cartesianToPolar, degreeToSegment, getSegmentsBetween } from '../utils/clockFaceGeometry.js';

export const getSegmentFromPoint = (svgRef, clientX, clientY) => {
  const svgRect = svgRef.current.getBoundingClientRect();
  const centerX = svgRect.left + svgRect.width / 2;
  const centerY = svgRect.top + svgRect.height / 2;
  const relX = clientX - centerX;
  const relY = -(clientY - centerY);
  const angle = cartesianToPolar(relX, relY);
  return { segment: degreeToSegment(angle), angle };
};

export const handleTearToggle = (readOnly, onTearToggle, hour, e) => {
  if (readOnly) return;
  e.preventDefault();
  e.stopPropagation();
  onTearToggle(hour);
  return false;
};

export const handleDrawingStart = (
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
) => {
  if (readOnly) return;
  e.preventDefault();

  const pointer = e.touches?.[0] || e;
  const { segment, angle } = getSegmentFromPoint(svgRef, pointer.clientX, pointer.clientY);

  if (segment !== null) {
    const segmentId = `segment${segment}`;
    const isSegmentSelected = initialDetachmentSegments.includes(segmentId);
    
    setIsDrawing(true);
    setDrawStartSegment(segment);
    setLastPosition(segment);
    setLastAngle(angle);
    setDrawMode(isSegmentSelected ? 'remove' : 'add');

    // Update segments based on draw mode
    const newSegments = isSegmentSelected
      ? initialDetachmentSegments.filter(s => s !== segmentId)
      : [...initialDetachmentSegments, segmentId];

    setCurrentDetachmentSegments(newSegments);
    setDetachmentSegments(newSegments);
  }
};

export const handleDrawing = (
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
) => {
  if (!isDrawing || readOnly || drawStartSegment === null || lastAngle === null || drawMode === null) return;
  e.preventDefault();

  const pointer = e.touches?.[0] || e;
  const { segment: currentSegment, angle: currentAngle } = getSegmentFromPoint(svgRef, pointer.clientX, pointer.clientY);

  if (currentSegment !== null && currentSegment !== lastPosition) {
    // Determine drawing direction based on angle change
    let angleDiff = currentAngle - lastAngle;
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;
    const isCounterClockwise = angleDiff < 0;

    // Calculate segments between start and current
    const segmentsToProcess = getSegmentsBetween(lastPosition, currentSegment, isCounterClockwise);

    // Create a Set of existing segments (without the "segment" prefix)
    const existingSegments = new Set(
      initialDetachmentSegments.map(s => parseInt(s.replace('segment', ''), 10))
    );

    // Add or remove segments based on draw mode
    segmentsToProcess.forEach(segment => {
      if (drawMode === 'add') {
        existingSegments.add(segment);
      } else {
        existingSegments.delete(segment);
      }
    });

    // Convert back to array with "segment" prefix
    const newSegments = Array.from(existingSegments).map(s => `segment${s}`);

    setCurrentDetachmentSegments(newSegments);
    setDetachmentSegments(newSegments);
    setLastPosition(currentSegment);
    setLastAngle(currentAngle);
  }
};

export const handleDrawingEnd = (
  isDrawing,
  readOnly,
  setIsDrawing,
  setDrawStartSegment,
  setLastPosition,
  setLastAngle,
  setDrawMode,
  e
) => {
  if (!isDrawing || readOnly) return;
  e.preventDefault();
  setIsDrawing(false);
  setDrawStartSegment(null);
  setLastPosition(null);
  setLastAngle(null);
  setDrawMode(null);
};

export const handleTearTouchStart = (readOnly, setTouchStartTime, setTouchStartPosition, hour) => (e) => {
  if (readOnly) return;
  e.preventDefault();
  e.stopPropagation();

  const touch = e.touches[0];
  setTouchStartTime(Date.now());
  setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
  return false;
};

export const handleTearTouchEnd = (
  readOnly,
  touchStartTime,
  touchStartPosition,
  onTearToggle,
  LONG_PRESS_DURATION,
  hour
) => (e) => {
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

  return false;
};
