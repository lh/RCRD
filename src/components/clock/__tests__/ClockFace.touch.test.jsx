import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ClockFace from '../ClockFace';
import { calculateSegmentsForHourRange } from '../utils/segmentCalculator';

jest.mock('../utils/segmentCalculator', () => ({
  calculateSegmentsForHourRange: jest.fn()
}));

describe('ClockFace Touch Interactions', () => {
  const defaultProps = {
    selectedHours: [],
    detachmentSegments: [],
    hoveredHour: null,
    onHoverChange: jest.fn(),
    onTearToggle: jest.fn(),
    onSegmentToggle: jest.fn(),
    setDetachmentSegments: jest.fn(),
    readOnly: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    calculateSegmentsForHourRange.mockImplementation((start, end) => {
      const segments = [];
      const startSegment = (start - 1) * 5;
      const endSegment = (end - 1) * 5;
      for (let i = startSegment; i <= endSegment; i++) {
        segments.push(i);
      }
      return segments;
    });
  });

  describe('Long Press Behavior', () => {
    test('handles long press on tear markers', () => {
      jest.useFakeTimers();
      
      render(<ClockFace {...defaultProps} />);
      
      const tearMarkers = document.querySelectorAll('circle[r="12"]');
      
      // Simulate touch start
      fireEvent.touchStart(tearMarkers[5], {
        touches: [{ clientX: 0, clientY: 0 }]
      });
      
      // Fast-forward time to simulate long press
      jest.advanceTimersByTime(500);
      
      // Simulate touch end without movement
      fireEvent.touchEnd(tearMarkers[5], {
        changedTouches: [{ clientX: 0, clientY: 0 }]
      });
      
      expect(defaultProps.onTearToggle).toHaveBeenCalledWith(5);
      
      jest.useRealTimers();
    });

    test('ignores short press on tear markers', () => {
      jest.useFakeTimers();
      
      render(<ClockFace {...defaultProps} />);
      
      const tearMarkers = document.querySelectorAll('circle[r="12"]');
      
      // Simulate touch start
      fireEvent.touchStart(tearMarkers[5], {
        touches: [{ clientX: 0, clientY: 0 }]
      });
      
      // Fast-forward time but not enough for long press
      jest.advanceTimersByTime(200);
      
      // Simulate touch end
      fireEvent.touchEnd(tearMarkers[5], {
        changedTouches: [{ clientX: 0, clientY: 0 }]
      });
      
      expect(defaultProps.onTearToggle).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Touch Drawing', () => {
    const mockBoundingClientRect = {
      left: 0,
      top: 0,
      width: 220,
      height: 220,
      right: 220,
      bottom: 220,
    };

    beforeEach(() => {
      Element.prototype.getBoundingClientRect = jest.fn(() => mockBoundingClientRect);
    });

    test('handles touch drawing sequence', () => {
      render(<ClockFace {...defaultProps} />);
      
      const svg = document.querySelector('svg');
      
      // Start touch
      fireEvent.touchStart(svg, {
        touches: [{ clientX: 110, clientY: 0 }] // 12 o'clock
      });
      
      // Move touch
      fireEvent.touchMove(svg, {
        touches: [{ clientX: 220, clientY: 110 }] // 3 o'clock
      });
      
      // End touch
      fireEvent.touchEnd(svg, {
        changedTouches: [{ clientX: 220, clientY: 110 }]
      });
      
      expect(defaultProps.setDetachmentSegments).toHaveBeenCalled();
    });

    test('cancels drawing on touch cancel', () => {
      render(<ClockFace {...defaultProps} />);
      
      const svg = document.querySelector('svg');
      
      // Start and move touch
      fireEvent.touchStart(svg, {
        touches: [{ clientX: 110, clientY: 0 }]
      });
      
      fireEvent.touchMove(svg, {
        touches: [{ clientX: 220, clientY: 110 }]
      });
      
      // Cancel touch
      fireEvent.touchCancel(svg);
      
      // Should reset drawing state
      fireEvent.touchStart(svg, {
        touches: [{ clientX: 110, clientY: 0 }]
      });
      
      // Expect 3 calls: initial start, move, and new start after cancel
      expect(defaultProps.setDetachmentSegments).toHaveBeenCalledTimes(3);
    });

    test('handles CCW drawing by following draw direction', () => {
      render(<ClockFace {...defaultProps} />);
      
      const svg = document.querySelector('svg');
      
      // Start at 3 o'clock
      fireEvent.touchStart(svg, {
        touches: [{ clientX: 220, clientY: 110 }]
      });
      
      // Move CCW to 1 o'clock
      fireEvent.touchMove(svg, {
        touches: [{ clientX: 190, clientY: 50 }]
      });
      
      // Should follow CCW path (3→2→1) regardless of length
      const lastCall = defaultProps.setDetachmentSegments.mock.calls[1][0];
      const segments = lastCall.map(s => parseInt(s.replace('segment', ''), 10));
      
      // Verify segments are in CCW order
      let prevSegment = segments[0];
      let isCounterClockwise = true;
      for (let i = 1; i < segments.length; i++) {
        const currentSegment = segments[i];
        if (currentSegment > prevSegment) {
          isCounterClockwise = false;
          break;
        }
        prevSegment = currentSegment;
      }
      expect(isCounterClockwise).toBe(true);
    });

    test('handles CCW drawing across 12 o\'clock', () => {
      render(<ClockFace {...defaultProps} />);
      
      const svg = document.querySelector('svg');
      
      // Start at 2 o'clock
      fireEvent.touchStart(svg, {
        touches: [{ clientX: 190, clientY: -50 }]
      });
      
      // Move CCW to 10 o'clock
      fireEvent.touchMove(svg, {
        touches: [{ clientX: -190, clientY: -50 }]
      });
      
      // Should follow CCW path (2→1→12→11→10) across midnight
      const lastCall = defaultProps.setDetachmentSegments.mock.calls[1][0];
      const segments = lastCall.map(s => parseInt(s.replace('segment', ''), 10));
      
      // Verify segments are in CCW order and include the transition across 12
      let prevSegment = segments[0];
      let crossedMidnight = false;
      let isCounterClockwise = true;
      
      for (let i = 1; i < segments.length; i++) {
        const currentSegment = segments[i];
        // When crossing midnight, we'll see a large jump from low numbers to high numbers
        if (currentSegment > 50 && prevSegment < 10) {
          crossedMidnight = true;
        } else if (!crossedMidnight && currentSegment > prevSegment) {
          isCounterClockwise = false;
          break;
        }
        prevSegment = currentSegment;
      }
      
      expect(isCounterClockwise).toBe(true);
      expect(crossedMidnight).toBe(true);
    });

    test('preserves existing segments when drawing new ones', () => {
      // Start with some existing segments
      const existingSegments = ['segment0', 'segment1', 'segment2'];
      render(<ClockFace {...defaultProps} detachmentSegments={existingSegments} />);
      
      const svg = document.querySelector('svg');
      
      // Draw new segments at a different location
      fireEvent.touchStart(svg, {
        touches: [{ clientX: 220, clientY: 110 }] // 3 o'clock
      });
      
      fireEvent.touchMove(svg, {
        touches: [{ clientX: 220, clientY: 150 }] // 4 o'clock
      });
      
      // Verify existing segments are preserved
      const lastCall = defaultProps.setDetachmentSegments.mock.calls[1][0];
      existingSegments.forEach(segment => {
        expect(lastCall).toContain(segment);
      });
    });
  });
});
