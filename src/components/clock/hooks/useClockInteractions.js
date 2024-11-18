import { useState, useRef, useEffect } from 'react';
import { segmentToHour } from '../utils/clockCalculations';
import { ClockHourNotation } from '../utils/clockHourNotation';

export const useClockInteractions = (onChange) => {
  const [selectedHours, setSelectedHours] = useState([]);
  const [detachmentSegments, setDetachmentSegments] = useState([]);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [isAddMode, setIsAddMode] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);

  const drawingRef = useRef(false);
  const touchStartTime = useRef(null);
  const touchStartPosition = useRef(null);
  const drawStartSegment = useRef(null);
  const longPressThreshold = 300;
  const moveThreshold = 10;

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTearTouchMove = (event) => {
    if (touchStartPosition.current) {
      const moveX = Math.abs(event.touches[0].clientX - touchStartPosition.current.x);
      const moveY = Math.abs(event.touches[0].clientY - touchStartPosition.current.y);
      
      if (moveX > moveThreshold || moveY > moveThreshold) {
        clearTimeout(pressTimer);
        setPressTimer(null);
      }
    }
  };

  const handleTearTouchEnd = () => {
    clearTimeout(pressTimer);
    setPressTimer(null);
    touchStartTime.current = null;
    touchStartPosition.current = null;
  };

  const getSegmentsBetween = (start, end) => {
    // Calculate both possible paths
    const cwPath = [];
    const ccwPath = [];

    // Clockwise path
    let i = start;
    while (i !== end) {
      cwPath.push(i);
      i = (i + 1) % 60;
    }
    cwPath.push(end);

    // Counter-clockwise path
    i = start;
    while (i !== end) {
      ccwPath.push(i);
      i = (i - 1 + 60) % 60;
    }
    ccwPath.push(end);

    // Return the shorter path
    return cwPath.length <= ccwPath.length ? cwPath : ccwPath;
  };

  const handleSegmentInteraction = (segment, isRightClick = false) => {
    // Extract segment number from segment ID
    const currentSegment = parseInt(segment.replace('segment', ''), 10);
    
    // If this is the start of drawing, store the start segment
    if (drawingRef.current && drawStartSegment.current === null) {
      drawStartSegment.current = currentSegment;
    }

    // Calculate segments to add based on drawing path
    let segmentsToAdd = [];
    if (drawingRef.current && drawStartSegment.current !== null) {
      segmentsToAdd = getSegmentsBetween(drawStartSegment.current, currentSegment);
    } else {
      segmentsToAdd = [currentSegment];
    }

    // Convert segments to IDs
    const segmentIds = segmentsToAdd.map(s => `segment${s}`);
    
    let newSelection;
    const shouldRemove = (isTouchDevice && !isAddMode) || (!isTouchDevice && isRightClick);
    
    if (shouldRemove) {
      newSelection = detachmentSegments.filter(s => !segmentIds.includes(s));
    } else {
      // Work with segment IDs consistently
      const existingIds = new Set(detachmentSegments);
      segmentIds.forEach(id => existingIds.add(id));
      newSelection = Array.from(existingIds).sort();
    }
    
    setDetachmentSegments(newSelection);

    // Get raw segment numbers for formatting
    const rawSegments = newSelection.map(s => parseInt(s.replace('segment', ''), 10));
    const hours = Array.from(new Set(rawSegments.map(segmentToHour))).sort((a, b) => a - b);
    const formattedDetachment = ClockHourNotation.formatDetachment(rawSegments);

    onChange?.({ 
      tears: selectedHours, 
      detachment: hours,
      formattedDetachment
    });
  };

  const handleStartDrawing = (segment, event) => {
    event.preventDefault();
    drawingRef.current = true;
    drawStartSegment.current = parseInt(segment.replace('segment', ''), 10);
    setIsDrawing(true);
    handleSegmentInteraction(segment, event.button === 2);
  };

  const handleDrawing = (segment) => {
    if (drawingRef.current) {
      handleSegmentInteraction(segment, drawingRef.current === 'right');
    }
  };

  const handleMouseDown = (segment, event) => {
    event.preventDefault();
    drawingRef.current = event.button === 2 ? 'right' : 'left';
    drawStartSegment.current = parseInt(segment.replace('segment', ''), 10);
    setIsDrawing(true);
    handleSegmentInteraction(segment, event.button === 2);
  };

  const handleTearClick = (hour, event) => {
    if (!isTouchDevice) {
      event.stopPropagation();
      const newSelection = selectedHours.includes(hour)
        ? selectedHours.filter(h => h !== hour)
        : [...selectedHours, hour];
      setSelectedHours(newSelection);

      // Get raw segment numbers for formatting
      const rawSegments = detachmentSegments.map(s => parseInt(s.replace('segment', ''), 10));
      const hours = Array.from(new Set(rawSegments.map(segmentToHour))).sort((a, b) => a - b);
      const formattedDetachment = ClockHourNotation.formatDetachment(rawSegments);

      onChange?.({ 
        tears: newSelection, 
        detachment: hours,
        formattedDetachment
      });
    }
  };

  const handleTearTouchStart = (hour, event) => {
    if (!isTouchDevice) return;
    event.preventDefault();
    
    if (isAddMode && selectedHours.includes(hour)) return;
    if (!isAddMode && !selectedHours.includes(hour)) return;

    touchStartTime.current = Date.now();
    touchStartPosition.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };

    const timer = setTimeout(() => {
      const newSelection = isAddMode
        ? [...selectedHours, hour]
        : selectedHours.filter(h => h !== hour);
      setSelectedHours(newSelection);

      // Get raw segment numbers for formatting
      const rawSegments = detachmentSegments.map(s => parseInt(s.replace('segment', ''), 10));
      const hours = Array.from(new Set(rawSegments.map(segmentToHour))).sort((a, b) => a - b);
      const formattedDetachment = ClockHourNotation.formatDetachment(rawSegments);

      onChange?.({ 
        tears: newSelection, 
        detachment: hours,
        formattedDetachment
      });
    }, longPressThreshold);

    setPressTimer(timer);
  };

  const handleEndDrawing = () => {
    drawingRef.current = false;
    drawStartSegment.current = null;
    setIsDrawing(false);
  };

  const handleClearAll = () => {
    setSelectedHours([]);
    setDetachmentSegments([]);
    onChange?.({ 
      tears: [], 
      detachment: [],
      formattedDetachment: "None"
    });
  };

  useEffect(() => {
    const preventDefault = (e) => {
      if (drawingRef.current) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  useEffect(() => {
    const cleanUp = () => {
      handleEndDrawing();
    };
    
    window.addEventListener('mouseup', cleanUp);
    window.addEventListener('touchend', cleanUp);
    
    return () => {
      window.removeEventListener('mouseup', cleanUp);
      window.removeEventListener('touchend', cleanUp);
    };
  }, []);

  return {
    selectedHours,
    detachmentSegments,
    hoveredHour,
    setHoveredHour,
    isAddMode,
    setIsAddMode,
    isDrawing,
    isTouchDevice,
    handleTearTouchMove,
    handleTearTouchEnd,
    handleSegmentInteraction,
    handleStartDrawing,
    handleDrawing,
    handleMouseDown,
    handleTearClick,
    handleTearTouchStart,
    handleEndDrawing,
    handleClearAll
  };
};
