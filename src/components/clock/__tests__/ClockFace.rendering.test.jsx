import React from 'react';
import { render, screen } from '@testing-library/react';
import ClockFace from '../ClockFace';
import { calculateSegmentsForHourRange } from '../utils/segmentCalculator';

// Mock the segment calculator
jest.mock('../utils/segmentCalculator', () => ({
  calculateSegmentsForHourRange: jest.fn()
}));

describe('ClockFace Rendering', () => {
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

  test('renders with correct dimensions', () => {
    const { container } = render(<ClockFace {...defaultProps} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '-110 -110 220 220');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });

  test('renders in read-only mode', () => {
    const { container } = render(<ClockFace {...defaultProps} readOnly={true} />);
    
    const clockContainer = container.querySelector('.relative');
    expect(clockContainer).toHaveClass('pointer-events-none');
  });

  test('renders tear markers for all 12 hours', () => {
    render(<ClockFace {...defaultProps} />);
    
    const tearMarkers = document.querySelectorAll('circle[r="12"]');
    expect(tearMarkers).toHaveLength(12);
  });

  test('renders selected tears correctly', () => {
    render(<ClockFace {...defaultProps} selectedHours={[3, 6]} />);
    
    const tearPaths = document.querySelectorAll('path[d*="M -4 -8"]');
    expect(tearPaths).toHaveLength(2);
  });

  test('renders detachment segments', () => {
    render(<ClockFace {...defaultProps} detachmentSegments={[0, 1, 2]} />);
    
    const highlightedSegments = document.querySelectorAll('path[fill="rgba(59, 130, 246, 0.5)"]');
    expect(highlightedSegments).toHaveLength(3);
  });
});
