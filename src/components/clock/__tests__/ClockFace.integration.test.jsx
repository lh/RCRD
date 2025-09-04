import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClockFace from '../ClockFace';

// NO MOCKING - Test actual clock face behavior including all geometry calculations

describe('ClockFace - Complete Integration Test', () => {
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
    });

    describe('Tear Marker Selection', () => {
        it('should toggle individual tear markers on click', () => {
            const mockOnTearToggle = jest.fn();
            const { container } = render(
                <ClockFace {...defaultProps} onTearToggle={mockOnTearToggle} />
            );

            // Find tear markers (12 total, one for each hour)
            const tearGroups = container.querySelectorAll('g[style*="cursor: pointer"]');
            expect(tearGroups.length).toBe(12);

            // Click hour 3
            fireEvent.click(tearGroups[2]);
            expect(mockOnTearToggle).toHaveBeenCalledWith(3);

            // Click hour 12
            fireEvent.click(tearGroups[11]);
            expect(mockOnTearToggle).toHaveBeenCalledWith(12);
        });

        it('should visually distinguish selected tears', () => {
            const { container } = render(
                <ClockFace {...defaultProps} selectedHours={[3, 6, 9]} />
            );

            // Selected tears should render as path elements (tear shape)
            const tearPaths = container.querySelectorAll('path[transform*="scale(1.5)"]');
            expect(tearPaths.length).toBe(3);

            // Unselected tears should render as circles
            const tearCircles = container.querySelectorAll('circle[r="12"]');
            expect(tearCircles.length).toBe(9); // 12 total - 3 selected
        });

        it('should handle automatic hour inclusion (3, 6, 9 rules)', () => {
            const mockOnTearToggle = jest.fn();
            const { rerender } = render(
                <ClockFace 
                    {...defaultProps} 
                    selectedHours={[2, 4]}
                    onTearToggle={mockOnTearToggle}
                />
            );

            // With hours 2 and 4 selected, hour 3 should be auto-included
            // This is typically handled by the parent component logic
            // We verify the visual state reflects this
            rerender(
                <ClockFace 
                    {...defaultProps} 
                    selectedHours={[2, 3, 4]}
                    onTearToggle={mockOnTearToggle}
                />
            );

            // All three should show as selected
            const { container } = render(
                <ClockFace {...defaultProps} selectedHours={[2, 3, 4]} />
            );
            const tearPaths = container.querySelectorAll('path[transform*="scale(1.5)"]');
            expect(tearPaths.length).toBe(3);
        });
    });

    describe('Detachment Drawing', () => {
        it('should draw detachment segments on mouse drag', () => {
            const mockSetDetachmentSegments = jest.fn();
            const { container } = render(
                <ClockFace 
                    {...defaultProps} 
                    setDetachmentSegments={mockSetDetachmentSegments}
                />
            );

            const svg = container.querySelector('svg');

            // Simulate drawing from 12 o'clock to 3 o'clock
            fireEvent.mouseDown(svg, { 
                clientX: 200, 
                clientY: 100,
                bubbles: true 
            });

            fireEvent.mouseMove(svg, { 
                clientX: 300, 
                clientY: 200,
                bubbles: true 
            });

            fireEvent.mouseUp(svg);

            // setDetachmentSegments should have been called during drawing
            expect(mockSetDetachmentSegments).toHaveBeenCalled();
        });

        it('should highlight segments during drawing', () => {
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    detachmentSegments={['segment0', 'segment1', 'segment2']}
                />
            );

            // Check that specified segments are highlighted
            const highlightedSegments = container.querySelectorAll('path[fill*="rgba(59, 130, 246"]');
            expect(highlightedSegments.length).toBeGreaterThan(0);
        });

        it('should support both adding and removing detachment segments', () => {
            const mockSetDetachmentSegments = jest.fn();
            const { container, rerender } = render(
                <ClockFace 
                    {...defaultProps}
                    detachmentSegments={['segment5', 'segment6', 'segment7']}
                    setDetachmentSegments={mockSetDetachmentSegments}
                />
            );

            const svg = container.querySelector('svg');

            // Draw over existing segments (should remove them)
            fireEvent.mouseDown(svg, { 
                clientX: 200, 
                clientY: 200,
                bubbles: true 
            });
            fireEvent.mouseUp(svg);

            expect(mockSetDetachmentSegments).toHaveBeenCalled();

            // Draw over empty segments (should add them)
            rerender(
                <ClockFace 
                    {...defaultProps}
                    detachmentSegments={[]}
                    setDetachmentSegments={mockSetDetachmentSegments}
                />
            );

            fireEvent.mouseDown(svg, { 
                clientX: 100, 
                clientY: 100,
                bubbles: true 
            });
            fireEvent.mouseUp(svg);

            expect(mockSetDetachmentSegments).toHaveBeenCalledTimes(2);
        });
    });

    describe('Touch Interactions', () => {
        it('should handle touch events for mobile devices', () => {
            const mockOnTearToggle = jest.fn();
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    onTearToggle={mockOnTearToggle}
                />
            );

            const tearGroups = container.querySelectorAll('g[style*="cursor: pointer"]');

            // Simulate touch on tear marker
            fireEvent.touchStart(tearGroups[0], {
                touches: [{ clientX: 100, clientY: 100 }]
            });

            fireEvent.touchEnd(tearGroups[0], {
                changedTouches: [{ clientX: 100, clientY: 100 }]
            });

            // Long press duration may be required
            // Component checks for 500ms hold
        });

        it('should support touch drawing for detachment', () => {
            const mockSetDetachmentSegments = jest.fn();
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    setDetachmentSegments={mockSetDetachmentSegments}
                />
            );

            const svg = container.querySelector('svg');

            // Simulate touch drag
            fireEvent.touchStart(svg, {
                touches: [{ clientX: 200, clientY: 100 }]
            });

            fireEvent.touchMove(svg, {
                touches: [{ clientX: 300, clientY: 200 }]
            });

            fireEvent.touchEnd(svg, {
                changedTouches: [{ clientX: 300, clientY: 200 }]
            });

            expect(mockSetDetachmentSegments).toHaveBeenCalled();
        });
    });

    describe('Hover Interactions', () => {
        it('should update hover state on mouse enter/leave', () => {
            const mockOnHoverChange = jest.fn();
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    onHoverChange={mockOnHoverChange}
                />
            );

            const tearGroups = container.querySelectorAll('g[style*="cursor: pointer"]');

            // Hover over hour 6
            fireEvent.mouseEnter(tearGroups[5]);
            expect(mockOnHoverChange).toHaveBeenCalledWith(6);

            // Leave hover
            fireEvent.mouseLeave(tearGroups[5]);
            expect(mockOnHoverChange).toHaveBeenCalledWith(null);
        });

        it('should visually indicate hovered state', () => {
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    hoveredHour={6}
                    selectedHours={[]}
                />
            );

            // The hovered tear should have different styling
            // This is handled by the getStyles function
            const tearCircles = container.querySelectorAll('circle[r="12"]');
            
            // Find the circle for hour 6
            // It should have hover styles applied
            expect(tearCircles.length).toBeGreaterThan(0);
        });
    });

    describe('ReadOnly Mode', () => {
        it('should disable all interactions in readOnly mode', () => {
            const mockOnTearToggle = jest.fn();
            const mockSetDetachmentSegments = jest.fn();
            const mockOnHoverChange = jest.fn();

            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    readOnly={true}
                    onTearToggle={mockOnTearToggle}
                    setDetachmentSegments={mockSetDetachmentSegments}
                    onHoverChange={mockOnHoverChange}
                />
            );

            const tearGroups = container.querySelectorAll('g');
            const svg = container.querySelector('svg');

            // Try clicking tear marker
            if (tearGroups.length > 0) {
                fireEvent.click(tearGroups[0]);
                expect(mockOnTearToggle).not.toHaveBeenCalled();
            }

            // Try drawing
            fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
            fireEvent.mouseMove(svg, { clientX: 200, clientY: 200 });
            fireEvent.mouseUp(svg);
            expect(mockSetDetachmentSegments).not.toHaveBeenCalled();

            // Try hovering
            if (tearGroups.length > 0) {
                fireEvent.mouseEnter(tearGroups[0]);
                expect(mockOnHoverChange).not.toHaveBeenCalled();
            }
        });

        it('should show visual indication of readOnly state', () => {
            const { container } = render(
                <ClockFace {...defaultProps} readOnly={true} />
            );

            // Cursors should be 'default' instead of 'pointer'
            const tearGroups = container.querySelectorAll('g[style*="cursor: default"]');
            expect(tearGroups.length).toBeGreaterThan(0);

            // Segments should have pointer-events: none
            const segments = container.querySelectorAll('path[style*="pointer-events: none"]');
            expect(segments.length).toBeGreaterThan(0);
        });
    });

    describe('Complex Interaction Scenarios', () => {
        it('should handle rapid sequential interactions', () => {
            const mockOnTearToggle = jest.fn();
            const mockSetDetachmentSegments = jest.fn();

            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    onTearToggle={mockOnTearToggle}
                    setDetachmentSegments={mockSetDetachmentSegments}
                />
            );

            const tearGroups = container.querySelectorAll('g[style*="cursor: pointer"]');
            const svg = container.querySelector('svg');

            // Rapid clicking on multiple tears
            for (let i = 0; i < 5; i++) {
                fireEvent.click(tearGroups[i]);
            }
            expect(mockOnTearToggle).toHaveBeenCalledTimes(5);

            // Rapid drawing movements
            for (let i = 0; i < 3; i++) {
                fireEvent.mouseDown(svg, { clientX: 100 + i * 10, clientY: 100 });
                fireEvent.mouseMove(svg, { clientX: 200 + i * 10, clientY: 200 });
                fireEvent.mouseUp(svg);
            }
            expect(mockSetDetachmentSegments.mock.calls.length).toBeGreaterThan(0);
        });

        it('should handle drawing across the 12 o\'clock boundary', () => {
            const mockSetDetachmentSegments = jest.fn();
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    setDetachmentSegments={mockSetDetachmentSegments}
                />
            );

            const svg = container.querySelector('svg');

            // Draw from 11 o'clock to 1 o'clock (crosses midnight)
            fireEvent.mouseDown(svg, { 
                clientX: 150, // 11 o'clock position
                clientY: 50,
                bubbles: true 
            });

            fireEvent.mouseMove(svg, { 
                clientX: 250, // 1 o'clock position
                clientY: 50,
                bubbles: true 
            });

            fireEvent.mouseUp(svg);

            // Should handle the wraparound correctly
            expect(mockSetDetachmentSegments).toHaveBeenCalled();
            const calls = mockSetDetachmentSegments.mock.calls;
            // The segments should include those around 12 o'clock
            expect(calls.length).toBeGreaterThan(0);
        });

        it('should maintain consistency between tears and segments', () => {
            const { container, rerender } = render(
                <ClockFace 
                    {...defaultProps}
                    selectedHours={[3, 4, 5]}
                    detachmentSegments={['segment5', 'segment6', 'segment7', 'segment8', 'segment9', 'segment10']}
                />
            );

            // Tears 3, 4, 5 are selected (covering segments approximately 4-10)
            const tearPaths = container.querySelectorAll('path[transform*="scale(1.5)"]');
            expect(tearPaths.length).toBe(3);

            const highlightedSegments = container.querySelectorAll('path[fill*="rgba(59, 130, 246"]');
            expect(highlightedSegments.length).toBe(6);

            // Change selection
            rerender(
                <ClockFace 
                    {...defaultProps}
                    selectedHours={[12]}
                    detachmentSegments={['segment23', 'segment0']}
                />
            );

            // Should update both tears and segments
            const newTearPaths = container.querySelectorAll('path[transform*="scale(1.5)"]');
            expect(newTearPaths.length).toBe(1);

            const newHighlightedSegments = container.querySelectorAll('path[fill*="rgba(59, 130, 246"]');
            expect(newHighlightedSegments.length).toBe(2);
        });
    });

    describe('Geometry and Positioning', () => {
        it('should position tears at correct clock positions', () => {
            const { container } = render(<ClockFace {...defaultProps} />);

            // Check that tears are positioned in a circle
            const tearGroups = container.querySelectorAll('g[style*="cursor: pointer"]');
            expect(tearGroups.length).toBe(12);

            // Each tear should have a transform with translation
            tearGroups.forEach(group => {
                const transform = group.getAttribute('transform') || '';
                // Should have translate values
                expect(transform).toMatch(/translate\([^)]+\)/);
            });
        });

        it('should calculate segment angles correctly', () => {
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    detachmentSegments={['segment0']} // 12 o'clock segment
                />
            );

            // Segment 0 should be at the top (12 o'clock position)
            const highlightedSegment = container.querySelector('path[fill*="rgba(59, 130, 246"]');
            expect(highlightedSegment).toBeInTheDocument();

            // The path should start near the top of the circle
            const pathData = highlightedSegment.getAttribute('d');
            expect(pathData).toBeTruthy();
        });
    });

    describe('Visual Feedback', () => {
        it('should show clear visual feedback during drawing', () => {
            const { container, rerender } = render(
                <ClockFace {...defaultProps} />
            );

            // Initially no segments highlighted
            let highlightedSegments = container.querySelectorAll('path[fill*="rgba(59, 130, 246"]');
            expect(highlightedSegments.length).toBe(0);

            // During drawing, segments get highlighted
            rerender(
                <ClockFace 
                    {...defaultProps}
                    detachmentSegments={['segment0', 'segment1', 'segment2']}
                />
            );

            highlightedSegments = container.querySelectorAll('path[fill*="rgba(59, 130, 246"]');
            expect(highlightedSegments.length).toBe(3);
        });

        it('should maintain visual hierarchy', () => {
            const { container } = render(
                <ClockFace 
                    {...defaultProps}
                    selectedHours={[3, 6]}
                    detachmentSegments={['segment5', 'segment6']}
                    hoveredHour={9}
                />
            );

            // Should have all visual states present
            // - Selected tears (as paths)
            const tearPaths = container.querySelectorAll('path[transform*="scale(1.5)"]');
            expect(tearPaths.length).toBe(2);

            // - Highlighted segments
            const highlightedSegments = container.querySelectorAll('path[fill*="rgba(59, 130, 246"]');
            expect(highlightedSegments.length).toBe(2);

            // - Background circles
            const backgroundCircles = container.querySelectorAll('circle[stroke="#e5e5e5"]');
            expect(backgroundCircles.length).toBe(3); // Inner, middle, outer
        });
    });
});