import { useState, useCallback } from 'react';
import { CLOCK } from '../utils/clockConstants.js';
import { getSegmentsBetween } from '../utils/clockGeometry.js';

const useDrawingInteractions = (initialDetachmentSegments, setDetachmentSegments, getSegmentFromPoint, isMobile) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartSegment, setDrawStartSegment] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);
  const [lastAngle, setLastAngle] = useState(null);
  const [currentDetachmentSegments, setCurrentDetachmentSegments] = useState(initialDetachmentSegments);
  const [drawMode, setDrawMode] = useState(null); // 'add' or 'remove'

  const handleDrawingStart = useCallback((e, readOnly) => {
    if (readOnly) return;
    e.preventDefault();

    const pointer = e.touches?.[0] || e;
    const { segment, angle } = getSegmentFromPoint(pointer.clientX, pointer.clientY);

    if (segment !== null) {
      const segmentId = `segment${segment}`;
      const isSegmentSelected = initialDetachmentSegments.includes(segmentId);
      
      setIsDrawing(true);
      setDrawStartSegment(segment);
      setLastPosition(segment);
      setLastAngle(angle);
      
      // On mobile, we only allow adding segments
      setDrawMode(isMobile ? 'add' : (isSegmentSelected ? 'remove' : 'add'));

      // Update segments based on draw mode
      const newSegments = isMobile ? 
        // On mobile, always add segments
        [...new Set([...initialDetachmentSegments, segmentId])] :
        // On desktop, toggle segments
        (isSegmentSelected ? 
          initialDetachmentSegments.filter(s => s !== segmentId) :
          [...initialDetachmentSegments, segmentId]);

      setCurrentDetachmentSegments(newSegments);
      setDetachmentSegments(newSegments);
    }
  }, [getSegmentFromPoint, setDetachmentSegments, initialDetachmentSegments, isMobile]);

  const handleDrawing = useCallback((e, readOnly) => {
    if (!isDrawing || readOnly || drawStartSegment === null || lastAngle === null || drawMode === null) return;
    e.preventDefault();

    const pointer = e.touches?.[0] || e;
    const { segment: currentSegment, angle: currentAngle } = getSegmentFromPoint(pointer.clientX, pointer.clientY);

    if (currentSegment !== null && currentSegment !== lastPosition) {
      // Determine drawing direction based on angle change
      let angleDiff = currentAngle - lastAngle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      const isCounterClockwise = angleDiff < 0;

      // Calculate segments between start and current
      const segmentsToProcess = getSegmentsBetween(lastPosition, currentSegment, isCounterClockwise, CLOCK.SEGMENTS);

      // Create a Set of existing segments (without the "segment" prefix)
      const existingSegments = new Set(
        initialDetachmentSegments.map(s => parseInt(s.replace('segment', ''), 10))
      );

      // Add or remove segments based on draw mode
      segmentsToProcess.forEach(segment => {
        if (isMobile || drawMode === 'add') {
          existingSegments.add(segment);
        } else if (!isMobile && drawMode === 'remove') {
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
  }, [isDrawing, drawStartSegment, lastPosition, lastAngle, drawMode, getSegmentFromPoint, setDetachmentSegments, initialDetachmentSegments, isMobile]);

  const handleDrawingEnd = useCallback((e, readOnly) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    setIsDrawing(false);
    setDrawStartSegment(null);
    setLastPosition(null);
    setLastAngle(null);
    setDrawMode(null);
  }, [isDrawing]);

  const resetDetachments = useCallback(() => {
    setCurrentDetachmentSegments([]);
    setDetachmentSegments([]);
  }, [setDetachmentSegments]);

  return {
    isDrawing,
    currentDetachmentSegments,
    handleDrawingStart,
    handleDrawing,
    handleDrawingEnd,
    resetDetachments
  };
};

export default useDrawingInteractions;
