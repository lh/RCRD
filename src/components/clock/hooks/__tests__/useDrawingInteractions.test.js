/**
 * Tests for useDrawingInteractions hook
 * Tests touch/mouse drawing interactions for segment selection
 */

import { renderHook, act } from '@testing-library/react';
import useDrawingInteractions from '../useDrawingInteractions';

describe('useDrawingInteractions', () => {
  let setDetachmentSegments;
  let getSegmentFromPoint;

  beforeEach(() => {
    setDetachmentSegments = jest.fn();
    getSegmentFromPoint = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      expect(result.current.isDrawing).toBe(false);
      expect(result.current.currentDetachmentSegments).toEqual([]);
    });

    it('should initialize with provided segments', () => {
      const initialSegments = ['segment1', 'segment2'];
      const { result } = renderHook(() => 
        useDrawingInteractions(initialSegments, setDetachmentSegments, getSegmentFromPoint, false)
      );

      expect(result.current.currentDetachmentSegments).toEqual(initialSegments);
    });
  });

  describe('Desktop Drawing Interactions', () => {
    it('should start drawing and add segment on desktop', () => {
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(mockEvent, false);
      });

      expect(result.current.isDrawing).toBe(true);
      expect(setDetachmentSegments).toHaveBeenCalledWith(['segment5']);
      expect(result.current.currentDetachmentSegments).toEqual(['segment5']);
    });

    it('should toggle segment on desktop when already selected', () => {
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      
      const { result } = renderHook(() => 
        useDrawingInteractions(['segment5'], setDetachmentSegments, getSegmentFromPoint, false)
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(mockEvent, false);
      });

      expect(setDetachmentSegments).toHaveBeenCalledWith([]);
      expect(result.current.currentDetachmentSegments).toEqual([]);
    });

    it('should not start drawing when segment is null', () => {
      getSegmentFromPoint.mockReturnValue({ segment: null, angle: null });
      
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(mockEvent, false);
      });

      expect(result.current.isDrawing).toBe(false);
      expect(setDetachmentSegments).not.toHaveBeenCalled();
    });

    it('should not start drawing when readonly', () => {
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(mockEvent, true);
      });

      expect(result.current.isDrawing).toBe(false);
      expect(setDetachmentSegments).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Drawing Interactions', () => {
    it('should always add segments on mobile', () => {
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, true)
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        touches: [{ clientX: 100, clientY: 100 }]
      };

      act(() => {
        result.current.handleDrawingStart(mockEvent, false);
      });

      expect(result.current.isDrawing).toBe(true);
      expect(setDetachmentSegments).toHaveBeenCalledWith(['segment5']);
    });

    it('should not remove segments on mobile even if already selected', () => {
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      
      const { result } = renderHook(() => 
        useDrawingInteractions(['segment5'], setDetachmentSegments, getSegmentFromPoint, true)
      );

      const mockEvent = {
        preventDefault: jest.fn(),
        touches: [{ clientX: 100, clientY: 100 }]
      };

      act(() => {
        result.current.handleDrawingStart(mockEvent, false);
      });

      expect(setDetachmentSegments).toHaveBeenCalledWith(['segment5']);
      expect(result.current.currentDetachmentSegments).toEqual(['segment5']);
    });

    it('should handle touch events correctly', () => {
      getSegmentFromPoint.mockReturnValue({ segment: 3, angle: 90 });
      
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, true)
      );

      const touchEvent = {
        preventDefault: jest.fn(),
        touches: [{ clientX: 50, clientY: 50 }]
      };

      act(() => {
        result.current.handleDrawingStart(touchEvent, false);
      });

      expect(getSegmentFromPoint).toHaveBeenCalledWith(50, 50);
      expect(result.current.currentDetachmentSegments).toEqual(['segment3']);
    });
  });

  describe('Drawing Movement', () => {
    it('should handle drawing movement and add segments', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start drawing
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      // Move to different segment
      getSegmentFromPoint.mockReturnValue({ segment: 7, angle: 210 });
      const moveEvent = {
        preventDefault: jest.fn(),
        clientX: 150,
        clientY: 150
      };

      act(() => {
        result.current.handleDrawing(moveEvent, false);
      });

      // Should have added segments between 5 and 7
      expect(setDetachmentSegments).toHaveBeenCalledTimes(2);
    });

    it('should not process movement when not drawing', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      getSegmentFromPoint.mockReturnValue({ segment: 7, angle: 210 });
      const moveEvent = {
        preventDefault: jest.fn(),
        clientX: 150,
        clientY: 150
      };

      act(() => {
        result.current.handleDrawing(moveEvent, false);
      });

      expect(setDetachmentSegments).not.toHaveBeenCalled();
    });

    it('should handle drawing movement in remove mode', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions(['segment5', 'segment6', 'segment7'], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start drawing on existing segment (remove mode)
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      // First call removes segment5
      expect(setDetachmentSegments).toHaveBeenCalledWith(['segment6', 'segment7']);

      // Move to segment 7
      getSegmentFromPoint.mockReturnValue({ segment: 7, angle: 210 });
      const moveEvent = {
        preventDefault: jest.fn(),
        clientX: 150,
        clientY: 150
      };

      act(() => {
        result.current.handleDrawing(moveEvent, false);
      });

      // Should have removed segments between 5 and 7
      expect(setDetachmentSegments).toHaveBeenCalledTimes(2);
    });

    it('should not move when readonly', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start drawing
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      setDetachmentSegments.mockClear();

      // Try to move while readonly
      getSegmentFromPoint.mockReturnValue({ segment: 7, angle: 210 });
      const moveEvent = {
        preventDefault: jest.fn(),
        clientX: 150,
        clientY: 150
      };

      act(() => {
        result.current.handleDrawing(moveEvent, true);
      });

      expect(setDetachmentSegments).not.toHaveBeenCalled();
    });
  });

  describe('Drawing End', () => {
    it('should end drawing and reset state', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start drawing
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      expect(result.current.isDrawing).toBe(true);

      // End drawing
      const endEvent = { preventDefault: jest.fn() };
      act(() => {
        result.current.handleDrawingEnd(endEvent, false);
      });

      expect(result.current.isDrawing).toBe(false);
    });

    it('should not end drawing when not currently drawing', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      const endEvent = { preventDefault: jest.fn() };
      act(() => {
        result.current.handleDrawingEnd(endEvent, false);
      });

      expect(endEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should not end drawing when readonly', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start drawing
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      // Try to end while readonly
      const endEvent = { preventDefault: jest.fn() };
      act(() => {
        result.current.handleDrawingEnd(endEvent, true);
      });

      expect(result.current.isDrawing).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all detachments', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions(['segment1', 'segment2', 'segment3'], setDetachmentSegments, getSegmentFromPoint, false)
      );

      act(() => {
        result.current.resetDetachments();
      });

      expect(setDetachmentSegments).toHaveBeenCalledWith([]);
      expect(result.current.currentDetachmentSegments).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle angle wraparound correctly', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start at angle near 360
      getSegmentFromPoint.mockReturnValue({ segment: 59, angle: 355 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      // Move to angle near 0 (crosses 360/0 boundary)
      getSegmentFromPoint.mockReturnValue({ segment: 2, angle: 10 });
      const moveEvent = {
        preventDefault: jest.fn(),
        clientX: 150,
        clientY: 150
      };

      act(() => {
        result.current.handleDrawing(moveEvent, false);
      });

      expect(setDetachmentSegments).toHaveBeenCalledTimes(2);
    });

    it('should handle duplicate segments in initial array', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions(
          ['segment1', 'segment1', 'segment2'], 
          setDetachmentSegments, 
          getSegmentFromPoint, 
          true
        )
      );

      // Add segment 1 on mobile (should not duplicate)
      getSegmentFromPoint.mockReturnValue({ segment: 1, angle: 30 });
      const event = {
        preventDefault: jest.fn(),
        touches: [{ clientX: 100, clientY: 100 }]
      };

      act(() => {
        result.current.handleDrawingStart(event, false);
      });

      const calledSegments = setDetachmentSegments.mock.calls[0][0];
      const uniqueSegments = [...new Set(calledSegments)];
      expect(calledSegments.length).toBe(uniqueSegments.length);
    });

    it('should handle same position movement', () => {
      const { result } = renderHook(() => 
        useDrawingInteractions([], setDetachmentSegments, getSegmentFromPoint, false)
      );

      // Start drawing
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const startEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(startEvent, false);
      });

      setDetachmentSegments.mockClear();

      // Move to same segment
      getSegmentFromPoint.mockReturnValue({ segment: 5, angle: 150 });
      const moveEvent = {
        preventDefault: jest.fn(),
        clientX: 101,
        clientY: 101
      };

      act(() => {
        result.current.handleDrawing(moveEvent, false);
      });

      expect(setDetachmentSegments).not.toHaveBeenCalled();
    });
  });

  describe('Hook Dependency Changes', () => {
    it('should update when initial segments change', () => {
      const { result, rerender } = renderHook(
        ({ segments }) => useDrawingInteractions(segments, setDetachmentSegments, getSegmentFromPoint, false),
        { initialProps: { segments: ['segment1'] } }
      );

      expect(result.current.currentDetachmentSegments).toEqual(['segment1']);

      rerender({ segments: ['segment2', 'segment3'] });
      
      // Start drawing to trigger dependency update
      getSegmentFromPoint.mockReturnValue({ segment: 4, angle: 120 });
      const event = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(event, false);
      });

      expect(setDetachmentSegments).toHaveBeenCalledWith(['segment2', 'segment3', 'segment4']);
    });

    it('should update when mobile flag changes', () => {
      const { result, rerender } = renderHook(
        ({ isMobile }) => useDrawingInteractions(['segment1'], setDetachmentSegments, getSegmentFromPoint, isMobile),
        { initialProps: { isMobile: false } }
      );

      // Desktop mode - should toggle
      getSegmentFromPoint.mockReturnValue({ segment: 1, angle: 30 });
      const event = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
      };

      act(() => {
        result.current.handleDrawingStart(event, false);
      });

      expect(setDetachmentSegments).toHaveBeenCalledWith([]);

      // Change to mobile mode
      rerender({ isMobile: true });
      setDetachmentSegments.mockClear();

      // Mobile mode - should always add
      act(() => {
        result.current.handleDrawingStart(event, false);
      });

      expect(setDetachmentSegments).toHaveBeenCalledWith(['segment1']);
    });
  });
});