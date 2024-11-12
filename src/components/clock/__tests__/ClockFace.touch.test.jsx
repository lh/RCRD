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
      
      expect(defaultProps.setDetachmentSegments).toHaveBeenCalledTimes(2);
    });
  });
});
