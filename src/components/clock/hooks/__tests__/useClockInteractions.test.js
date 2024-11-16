/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useClockInteractions } from '../useClockInteractions';

// Mock clockCalculations module with implementation
jest.mock('../../utils/clockCalculations', () => ({
  segmentToHour: (segment) => {
    // Convert segment number to hour (5 segments per hour)
    const num = parseInt(segment.replace('segment', ''), 10);
    const hour = Math.floor(num / 5) + 1;
    // Handle hour 12 (segments 55-59 and 0-4)
    if (num >= 55 || num <= 4) return hour === 12 ? 12 : 1;
    return hour;
  }
}));

describe('useClockInteractions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Ensure no touch device by default
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetModules();
  });

  test('returns initial state values', () => {
    const mockOnChange = jest.fn();
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    expect(result.current).toEqual({
      selectedHours: [],
      detachmentSegments: [],
      hoveredHour: null,
      isAddMode: true,
      isDrawing: false,
      isTouchDevice: false,
      handleTearTouchMove: expect.any(Function),
      handleTearTouchEnd: expect.any(Function),
      handleSegmentInteraction: expect.any(Function),
      handleStartDrawing: expect.any(Function),
      handleDrawing: expect.any(Function),
      handleMouseDown: expect.any(Function),
      handleTearClick: expect.any(Function),
      handleTearTouchStart: expect.any(Function),
      handleEndDrawing: expect.any(Function),
      handleClearAll: expect.any(Function),
      setHoveredHour: expect.any(Function),
      setIsAddMode: expect.any(Function)
    });
  });

  test('detects touch device via ontouchstart', () => {
    window.ontouchstart = {};
    
    const mockOnChange = jest.fn();
    const { result } = renderHook(() => useClockInteractions(mockOnChange));
    
    act(() => {
      jest.runAllTimers();
    });
    
    expect(result.current.isTouchDevice).toBe(true);
  });

  test('detects touch device via maxTouchPoints', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true });
    
    const mockOnChange = jest.fn();
    const { result } = renderHook(() => useClockInteractions(mockOnChange));
    
    act(() => {
      jest.runAllTimers();
    });
    
    expect(result.current.isTouchDevice).toBe(true);
  });

  test('handles segment interaction in add mode', () => {
    const mockOnChange = jest.fn();
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    act(() => {
      result.current.handleSegmentInteraction('segment1');
      jest.runAllTimers();
    });

    expect(result.current.detachmentSegments).toEqual(['segment1']);
    expect(mockOnChange).toHaveBeenCalledWith({
      tears: [],
      detachment: [1] // Mocked segmentToHour converts 'segment1' to 1
    });
  });

  test('handles segment interaction in remove mode', () => {
    const mockOnChange = jest.fn();
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    // First add a segment
    act(() => {
      result.current.handleSegmentInteraction('segment1');
      jest.runAllTimers();
    });

    // Then switch to remove mode and remove it
    act(() => {
      result.current.setIsAddMode(false);
      result.current.handleSegmentInteraction('segment1', true);
      jest.runAllTimers();
    });

    expect(result.current.detachmentSegments).toEqual([]);
    expect(mockOnChange).toHaveBeenLastCalledWith({
      tears: [],
      detachment: []
    });
  });

  test('handles drawing state', () => {
    const mockOnChange = jest.fn();
    const mockEvent = { preventDefault: jest.fn() };
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    // Start drawing
    act(() => {
      result.current.handleStartDrawing('segment50', mockEvent);
      jest.runAllTimers();
    });

    // Verify drawing started
    expect(result.current.isDrawing).toBe(true);
    console.log('After start:', result.current.detachmentSegments);

    // Draw through segments one by one
    for (let i = 51; i <= 59; i++) {
      act(() => {
        result.current.handleDrawing(`segment${i}`);
        jest.runAllTimers();
      });
      console.log(`After segment${i}:`, result.current.detachmentSegments);
      // Verify segment was added
      expect(result.current.detachmentSegments).toContain(`segment${i}`);
    }

    // End drawing
    act(() => {
      result.current.handleEndDrawing();
      jest.runAllTimers();
    });

    console.log('Final segments:', result.current.detachmentSegments);

    // Verify final state
    const expectedSegments = Array.from({ length: 10 }, (_, i) => `segment${i + 50}`).sort();
    expect([...result.current.detachmentSegments].sort()).toEqual(expectedSegments);
    expect(mockOnChange).toHaveBeenLastCalledWith({
      tears: [],
      detachment: [11, 12]
    });
  });

  test('accumulates segments during drawing between hours 11-12-1', () => {
    const mockOnChange = jest.fn();
    const mockEvent = { preventDefault: jest.fn() };
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    // Start drawing
    act(() => {
      result.current.handleStartDrawing('segment50', mockEvent);
      jest.runAllTimers();
    });

    console.log('After start:', result.current.detachmentSegments);

    // Draw through segments 50-59
    for (let i = 51; i <= 59; i++) {
      act(() => {
        result.current.handleDrawing(`segment${i}`);
        jest.runAllTimers();
      });
      console.log(`After segment${i}:`, result.current.detachmentSegments);
      expect(result.current.detachmentSegments).toContain(`segment${i}`);
    }

    // Draw through segments 0-4
    for (let i = 0; i <= 4; i++) {
      act(() => {
        result.current.handleDrawing(`segment${i}`);
        jest.runAllTimers();
      });
      console.log(`After segment${i}:`, result.current.detachmentSegments);
      expect(result.current.detachmentSegments).toContain(`segment${i}`);
    }

    // End drawing
    act(() => {
      result.current.handleEndDrawing();
      jest.runAllTimers();
    });

    console.log('Final segments:', result.current.detachmentSegments);

    // Verify final state
    const expectedSegments = [
      ...Array.from({ length: 10 }, (_, i) => `segment${i + 50}`),
      ...Array.from({ length: 5 }, (_, i) => `segment${i}`)
    ].sort();
    expect([...result.current.detachmentSegments].sort()).toEqual(expectedSegments);
    expect(mockOnChange).toHaveBeenLastCalledWith({
      tears: [],
      detachment: [11, 12, 1]
    });
  });
});
