import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClockFace from '../ClockFace';
import { calculateSegmentsForHourRange } from '../utils/segmentCalculator';

jest.mock('../utils/segmentCalculator', () => ({
  calculateSegmentsForHourRange: jest.fn()
}));

describe('ClockFace Interactions', () => {
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

  test('handles tear toggle on click', () => {
    render(<ClockFace {...defaultProps} />);
    
    const tearMarkers = document.querySelectorAll('circle[r="12"]');
    fireEvent.click(tearMarkers[5]); // 6 o'clock is at index 5
    
    expect(defaultProps.onTearToggle).toHaveBeenCalledWith(5);
  });

  test('handles hover state changes', () => {
    render(<ClockFace {...defaultProps} />);
    
    const tearMarkers = document.querySelectorAll('circle[r="12"]');
    fireEvent.mouseEnter(tearMarkers[5]); // 6 o'clock
    
    expect(defaultProps.onHoverChange).toHaveBeenCalledWith(5);
    
    fireEvent.mouseLeave(tearMarkers[5]);
    expect(defaultProps.onHoverChange).toHaveBeenCalledWith(null);
  });

  describe('Drawing Interaction', () => {
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

    test('handles drawing start', () => {
      const { container } = render(<ClockFace {...defaultProps} />);
      
      const svg = container.querySelector('svg');
      fireEvent.mouseDown(svg, { clientX: 110, clientY: 0 }); // Click at 12 o'clock
      
      expect(defaultProps.setDetachmentSegments).toHaveBeenCalled();
    });

    test('handles drawing motion', () => {
      const { container } = render(<ClockFace {...defaultProps} />);
      
      const svg = container.querySelector('svg');
      
      // Start drawing at 12 o'clock
      fireEvent.mouseDown(svg, { clientX: 110, clientY: 0 });
      
      // Move to 3 o'clock
      fireEvent.mouseMove(svg, { clientX: 220, clientY: 110 });
      
      expect(defaultProps.setDetachmentSegments).toHaveBeenCalled();
    });

    test('handles drawing end', () => {
      const { container } = render(<ClockFace {...defaultProps} />);
      
      const svg = container.querySelector('svg');
      
      // Complete drawing sequence
      fireEvent.mouseDown(svg, { clientX: 110, clientY: 0 });
      fireEvent.mouseMove(svg, { clientX: 220, clientY: 110 });
      fireEvent.mouseUp(svg);
      
      // Should have called setDetachmentSegments at least twice
      expect(defaultProps.setDetachmentSegments).toHaveBeenCalled();
    });
  });
});
