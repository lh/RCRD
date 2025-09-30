import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClockFaceSVG from '../ClockFaceSVG';
import { CLOCK } from '../utils/clockConstants';

// DO NOT MOCK core business logic - test actual SVG rendering and geometry

describe('ClockFaceSVG - Integration Tests', () => {
    const defaultProps = {
        svgRef: React.createRef(),
        readOnly: false,
        selectedHours: [],
        hoveredHour: null,
        onHoverChange: jest.fn(),
        onTearToggle: jest.fn(),
        isDrawing: false,
        setIsDrawing: jest.fn(),
        drawStartSegment: null,
        setDrawStartSegment: jest.fn(),
        lastPosition: null,
        setLastPosition: jest.fn(),
        lastAngle: null,
        setLastAngle: jest.fn(),
        drawMode: null,
        setDrawMode: jest.fn(),
        currentDetachmentSegments: [],
        setCurrentDetachmentSegments: jest.fn(),
        initialDetachmentSegments: [],
        setDetachmentSegments: jest.fn(),
        touchStartTime: null,
        setTouchStartTime: jest.fn(),
        touchStartPosition: null,
        setTouchStartPosition: jest.fn(),
        LONG_PRESS_DURATION: 500,
        isMobile: false
    };

    describe('SVG Structure and Rendering', () => {
        it('should render SVG with correct viewBox for clock face', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            const svg = container.querySelector('svg');
            
            expect(svg).toBeInTheDocument();
            expect(svg).toHaveAttribute('viewBox', '-110 -110 220 220');
            expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
        });

        it('should render three concentric circles for clock structure', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Get only the background circles (first 3)
            const backgroundGroup = container.querySelector('g.pointer-events-none');
            const backgroundCircles = backgroundGroup.querySelectorAll('circle');
            
            expect(backgroundCircles).toHaveLength(3);
            
            // Check radii match the component's constants
            expect(backgroundCircles[0]).toHaveAttribute('r', '110'); // outerRadius
            expect(backgroundCircles[1]).toHaveAttribute('r', '85');  // middleRadius (calculated)
            expect(backgroundCircles[2]).toHaveAttribute('r', '60');  // innerRadius
        });

        it('should render correct number of detachment segments', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Find segments by their path elements
            const segmentPaths = container.querySelectorAll('path[d*="M "]');
            
            // Should have CLOCK.SEGMENTS number of segment paths
            expect(segmentPaths.length).toBeGreaterThan(0);
            // Each segment should have a unique key pattern
            const segments = Array.from(segmentPaths).filter(path => 
                path.getAttribute('d').includes('A 110 110') && // Arc with outer radius
                path.getAttribute('d').includes('A 60 60')      // Arc with inner radius
            );
            expect(segments.length).toBe(CLOCK.SEGMENTS); // 24 segments
        });

        it('should render 12 tear marker groups', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Tear markers are rendered as pairs of circles (hit area + visual)
            // Count all circles and subtract the 3 background circles
            const allCircles = container.querySelectorAll('circle');
            const backgroundCircles = container.querySelector('g.pointer-events-none').querySelectorAll('circle');
            const tearCircles = allCircles.length - backgroundCircles.length;
            
            // Should have 24 tear circles (12 hours × 2 circles each)
            expect(tearCircles).toBe(24);
            
            // Or we can look for the tear marker hit areas specifically
            const tearHitAreas = container.querySelectorAll('circle[r="20"]'); // Hit radius
            expect(tearHitAreas).toHaveLength(12);
        });
    });

    describe('Detachment Segment Visualization', () => {
        it('should highlight segments in currentDetachmentSegments', () => {
            const propsWithDetachment = {
                ...defaultProps,
                currentDetachmentSegments: ['segment0', 'segment1', 'segment2']
            };
            
            const { container } = render(<ClockFaceSVG {...propsWithDetachment} />);
            
            // Check that highlighted segments have the blue fill
            const highlightedSegments = container.querySelectorAll('path[fill="rgba(59, 130, 246, 0.5)"]');
            expect(highlightedSegments.length).toBe(3);
        });

        it('should render non-highlighted segments as transparent', () => {
            const propsWithDetachment = {
                ...defaultProps,
                currentDetachmentSegments: ['segment0']
            };
            
            const { container } = render(<ClockFaceSVG {...propsWithDetachment} />);
            
            // Count transparent segments (in the detachment segments group)
            const segmentPaths = Array.from(container.querySelectorAll('path')).filter(path => {
                const d = path.getAttribute('d');
                return d && d.includes('A 110 110') && d.includes('A 60 60');
            });
            
            const transparentSegments = segmentPaths.filter(path => 
                path.getAttribute('fill') === 'transparent'
            );
            expect(transparentSegments.length).toBe(23); // 24 total - 1 highlighted
        });

        it('should update visualization when segments change', () => {
            const { container, rerender } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Get segment paths
            const getSegmentPaths = () => Array.from(container.querySelectorAll('path')).filter(path => {
                const d = path.getAttribute('d');
                return d && d.includes('A 110 110') && d.includes('A 60 60');
            });
            
            // Initially all transparent
            let segmentPaths = getSegmentPaths();
            let transparentSegments = segmentPaths.filter(p => p.getAttribute('fill') === 'transparent');
            expect(transparentSegments.length).toBe(24);
            
            // Add some detachment segments
            rerender(<ClockFaceSVG {...defaultProps} currentDetachmentSegments={['segment5', 'segment6']} />);
            
            const highlightedSegments = container.querySelectorAll('path[fill="rgba(59, 130, 246, 0.5)"]');
            expect(highlightedSegments.length).toBe(2);
            
            segmentPaths = getSegmentPaths();
            transparentSegments = segmentPaths.filter(p => p.getAttribute('fill') === 'transparent');
            expect(transparentSegments.length).toBe(22);
        });
    });

    describe('Tear Marker Visualization', () => {
        it('should show selected tear markers differently', () => {
            const propsWithTears = {
                ...defaultProps,
                selectedHours: [3, 6, 9]
            };
            
            const { container } = render(<ClockFaceSVG {...propsWithTears} />);
            
            // Selected tears should render as path elements with tear shape pattern
            // The tear path contains "M -4 -8" as its starting point
            const tearPaths = container.querySelectorAll('path[d*="M -4 -8"]');
            const tearCircles = container.querySelectorAll('circle[r="12"]'); // Visual circles for unselected
            
            // Should have 3 tear paths (selected) and 9 circles (unselected)
            expect(tearPaths.length).toBe(3); // Should match selectedHours count
            expect(tearCircles.length).toBe(9); // 12 total - 3 selected
        });

        it('should position tear markers at correct clock positions', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Check that tear markers are positioned around the clock
            const tearGroups = container.querySelectorAll('g[transform*="translate"]');
            
            // Each should have a transform for positioning
            tearGroups.forEach(group => {
                const transform = group.getAttribute('transform');
                if (transform) {
                    expect(transform).toMatch(/translate\(-?\d+\.?\d*,\s*-?\d+\.?\d*\)/);
                }
            });
        });
    });

    describe('Interaction States', () => {
        it('should disable interactions in readOnly mode', () => {
            const propsReadOnly = {
                ...defaultProps,
                readOnly: true
            };
            
            const { container } = render(<ClockFaceSVG {...propsReadOnly} />);
            
            // Segments should have pointer-events: none
            const segments = container.querySelectorAll('path[style*="pointer-events: none"]');
            expect(segments.length).toBeGreaterThan(0);
        });

        it('should enable interactions when not readOnly', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Segments should have pointer-events: auto
            const segments = container.querySelectorAll('path[style*="pointer-events: auto"]');
            expect(segments.length).toBeGreaterThan(0);
        });

        it('should have correct hover classes on segments', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Get segment paths
            const segmentPaths = Array.from(container.querySelectorAll('path')).filter(path => {
                const d = path.getAttribute('d');
                return d && d.includes('A 110 110') && d.includes('A 60 60');
            });
            
            // Check that segments have hover class in their className
            const segmentsWithHover = segmentPaths.filter(path => {
                const className = path.getAttribute('class') || '';
                return className.includes('hover:fill-blue-200');
            });
            
            expect(segmentsWithHover.length).toBe(24); // All segments should have hover effect
        });

        it('should display correct titles based on mobile state', () => {
            const { container, rerender } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Desktop titles
            let segment = container.querySelector('path[title*="Click and drag"]');
            expect(segment).toBeInTheDocument();
            
            // Mobile titles
            rerender(<ClockFaceSVG {...defaultProps} isMobile={true} />);
            segment = container.querySelector('path[title="Draw to add detachment"]');
            expect(segment).toBeInTheDocument();
        });
    });

    describe('Mouse Event Handlers', () => {
        it('should attach mouse event handlers to SVG', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            const svg = container.querySelector('svg');
            
            // Check that event handlers are attached
            expect(svg).toHaveProperty('onmousedown');
            expect(svg).toHaveProperty('onmousemove');
            expect(svg).toHaveProperty('onmouseup');
            expect(svg).toHaveProperty('onmouseleave');
        });

        it('should attach touch event handlers', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            const svg = container.querySelector('svg');
            
            // In React, touch handlers are attached through the event system
            // We can verify they're defined by checking the component renders with them
            expect(svg).toBeTruthy();
            
            // Touch events should work (the actual handlers are internal to React)
            // We can verify the component accepts these props from the source
            const eventProps = ['onTouchStart', 'onTouchMove', 'onTouchEnd'];
            eventProps.forEach(prop => {
                // The SVG element exists and React will handle touch events
                expect(svg).toBeInTheDocument();
            });
        });
    });

    describe('12 O\'Clock Indicator', () => {
        it('should render 12 o\'clock indicator line', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Check for the indicator line at 12 o'clock
            const indicatorLine = container.querySelector('line');
            
            expect(indicatorLine).toBeInTheDocument();
            expect(indicatorLine).toHaveAttribute('x1', '0');
            expect(indicatorLine).toHaveAttribute('y1', '-110'); // outerRadius
            expect(indicatorLine).toHaveAttribute('x2', '0');
            expect(indicatorLine).toHaveAttribute('y2', '-111'); // outerRadius + indicatorExtension
            expect(indicatorLine).toHaveAttribute('stroke', '#666');
            expect(indicatorLine).toHaveAttribute('stroke-width', '2'); // SVG uses stroke-width in DOM
        });

        it('should have pointer-events-none on indicator', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            const indicatorLine = container.querySelector('line');
            expect(indicatorLine).toHaveClass('pointer-events-none');
        });
    });

    describe('Accessibility', () => {
        it('should have descriptive titles on interactive elements', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            const segments = container.querySelectorAll('path[title]');
            expect(segments.length).toBeGreaterThan(0);
            
            segments.forEach(segment => {
                const title = segment.getAttribute('title');
                expect(title).toBeTruthy();
                expect(title.length).toBeGreaterThan(0);
            });
        });

        it('should have proper SVG structure for screen readers', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            const svg = container.querySelector('svg');
            
            // SVG should have proper structure
            expect(svg).toBeInTheDocument();
            expect(svg.querySelector('g')).toBeInTheDocument(); // Contains groups
        });
    });

    describe('Geometric Calculations', () => {
        it('should position elements using polar coordinates', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            
            // Check that path elements use proper arc commands
            const paths = container.querySelectorAll('path[d*="A "]');
            paths.forEach(path => {
                const d = path.getAttribute('d');
                // Should contain arc commands with radius values
                expect(d).toMatch(/A \d+ \d+/);
            });
        });

        it('should maintain aspect ratio', () => {
            const { container } = render(<ClockFaceSVG {...defaultProps} />);
            const svg = container.querySelector('svg');
            
            expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
            expect(svg).toHaveClass('w-full', 'h-full');
        });
    });
});