/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useClockInteractions } from '../useClockInteractions';

// Mock clockCalculations module with implementation
jest.mock('../../utils/clockCalculations', () => ({
  segmentToHour: (segment) => {
    const num = parseInt(segment.replace('segment', ''), 10);
    return isNaN(num) ? 0 : num;
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

    act(() => {
      result.current.handleStartDrawing('segment1', mockEvent);
      jest.runAllTimers();
    });

    expect(result.current.isDrawing).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('handles clear all', () => {
    const mockOnChange = jest.fn();
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    // Add a segment and a tear
    act(() => {
      result.current.handleSegmentInteraction('segment1');
      result.current.handleTearClick(1, { stopPropagation: jest.fn() });
      jest.runAllTimers();
    });

    // Clear all
    act(() => {
      result.current.handleClearAll();
      jest.runAllTimers();
    });

    expect(result.current.selectedHours).toEqual([]);
    expect(result.current.detachmentSegments).toEqual([]);
    expect(mockOnChange).toHaveBeenLastCalledWith({
      tears: [],
      detachment: []
    });
  });

  test('handles tear click in non-touch mode', () => {
    const mockOnChange = jest.fn();
    const mockEvent = { stopPropagation: jest.fn() };
    const { result } = renderHook(() => useClockInteractions(mockOnChange));

    // Verify we're not in touch mode
    expect(result.current.isTouchDevice).toBe(false);

    // Click to add a tear
    act(() => {
      result.current.handleTearClick(1, mockEvent);
      jest.runAllTimers();
    });

    expect(result.current.selectedHours).toEqual([1]);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith({
      tears: [1],
      detachment: []
    });

    // Click again to remove the tear
    act(() => {
      result.current.handleTearClick(1, mockEvent);
      jest.runAllTimers();
    });

    expect(result.current.selectedHours).toEqual([]);
    expect(mockOnChange).toHaveBeenLastCalledWith({
      tears: [],
      detachment: []
    });
  });
});
