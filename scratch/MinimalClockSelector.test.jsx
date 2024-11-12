import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MinimalClockSelector from './MinimalClockSelector';

// Mock child components
jest.mock('../ClockFace', () => {
  return function MockClockFace({ 
    selectedHours,
    detachmentSegments,
    onTearToggle,
    onSegmentToggle,
    onHoverChange 
  }) {
    return (
      <div data-testid="clock-face">
        <button 
          data-testid="tear-toggle"
          onClick={() => onTearToggle(6)}
        >
          Toggle Hour 6
        </button>
        <button 
          data-testid="segment-toggle"
          onClick={() => onSegmentToggle(25)}
        >
          Toggle Segment 25
        </button>
        <button 
          data-testid="hover-change"
          onClick={() => onHoverChange(6)}
        >
          Hover Hour 6
        </button>
        <div>Selected Hours: {selectedHours.join(', ')}</div>
        <div>Detachment Segments: {detachmentSegments.join(', ')}</div>
      </div>
    );
  };
});

jest.mock('../Controls', () => {
  return function MockControls({ 
    isTouchDevice,
    handleClearAll,
    expandDirection 
  }) {
    return (
      <div data-testid="controls">
        <button 
          data-testid="clear-all"
          onClick={handleClearAll}
        >
          Clear All
        </button>
        <div>Touch Device: {isTouchDevice ? 'Yes' : 'No'}</div>
        <div>Expand Direction: {expandDirection}</div>
      </div>
    );
  };
});

describe('MinimalClockSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset touch detection
    Object.defineProperty(window, 'ontouchstart', {
      configurable: true,
      value: undefined
    });
    navigator.maxTouchPoints = 0;
  });

  test('renders with default state', () => {
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    expect(screen.getByTestId('clock-face')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByText('Selected Hours:')).toBeInTheDocument();
    expect(screen.getByText('Detachment Segments:')).toBeInTheDocument();
  });

  test('detects touch device', () => {
    Object.defineProperty(window, 'ontouchstart', {
      configurable: true,
      value: {}
    });
    
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    expect(screen.getByText('Touch Device: Yes')).toBeInTheDocument();
  });

  test('handles tear toggle', () => {
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    const tearToggle = screen.getByTestId('tear-toggle');
    fireEvent.click(tearToggle);
    
    expect(screen.getByText('Selected Hours: 6')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith({
      tears: [6],
      detachment: []
    });
  });

  test('handles segment toggle', () => {
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    const segmentToggle = screen.getByTestId('segment-toggle');
    fireEvent.click(segmentToggle);
    
    expect(screen.getByText('Detachment Segments: 25')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith({
      tears: [],
      detachment: [25]
    });
  });

  test('handles clear all', () => {
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    // Add some selections first
    fireEvent.click(screen.getByTestId('tear-toggle'));
    fireEvent.click(screen.getByTestId('segment-toggle'));
    
    // Clear all
    fireEvent.click(screen.getByTestId('clear-all'));
    
    expect(screen.getByText('Selected Hours:')).toBeInTheDocument();
    expect(screen.getByText('Detachment Segments:')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenLastCalledWith({
      tears: [],
      detachment: []
    });
  });

  test('handles hover changes', () => {
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    const hoverButton = screen.getByTestId('hover-change');
    fireEvent.click(hoverButton);
    
    // Since hover state is internal, we just verify the handler doesn't throw
    expect(hoverButton).toBeInTheDocument();
  });

  test('notifies parent of changes', () => {
    render(<MinimalClockSelector onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByTestId('tear-toggle'));
    expect(mockOnChange).toHaveBeenCalledWith({
      tears: [6],
      detachment: []
    });
    
    fireEvent.click(screen.getByTestId('segment-toggle'));
    expect(mockOnChange).toHaveBeenCalledWith({
      tears: [6],
      detachment: [25]
    });
  });

  test('maintains selections after re-render', () => {
    const { rerender } = render(<MinimalClockSelector onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByTestId('tear-toggle'));
    fireEvent.click(screen.getByTestId('segment-toggle'));
    
    rerender(<MinimalClockSelector onChange={mockOnChange} />);
    
    expect(screen.getByText('Selected Hours: 6')).toBeInTheDocument();
    expect(screen.getByText('Detachment Segments: 25')).toBeInTheDocument();
  });

  test('applies responsive layout classes', () => {
    const { container } = render(<MinimalClockSelector onChange={mockOnChange} />);
    
    expect(container.firstChild).toHaveClass('w-full');
    expect(container.querySelector('.flex')).toHaveClass('flex-col', 'md:flex-row');
  });

  test('positions controls correctly based on viewport', () => {
    const { container } = render(<MinimalClockSelector onChange={mockOnChange} />);
    
    const controlsContainer = container.querySelector('[class*="fixed md:static"]');
    expect(controlsContainer).toHaveClass(
      'fixed',
      'md:static',
      'bottom-4',
      'left-1/2',
      'landscape:left-auto',
      'landscape:right-4'
    );
  });
});
