import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TearMarker from '../TearMarker';

describe('TearMarker Component', () => {
    const defaultProps = {
        hour: 3,
        isSelected: false,
        hoveredHour: null,
        readOnly: false,
        onHoverChange: jest.fn(),
        onTearToggle: jest.fn(),
        touchStartTime: null,
        touchStartPosition: null,
        setTouchStartTime: jest.fn(),
        setTouchStartPosition: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders without crashing', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} />
                </svg>
            );
            const tearGroup = container.querySelector('g');
            expect(tearGroup).toBeInTheDocument();
        });

        it('renders a circle when not selected', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} isSelected={false} />
                </svg>
            );
            const circles = container.querySelectorAll('circle');
            // Should have at least the visible circle
            expect(circles.length).toBeGreaterThanOrEqual(1);
        });

        it('renders a path (tear shape) when selected', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} isSelected={true} />
                </svg>
            );
            const path = container.querySelector('path');
            expect(path).toBeInTheDocument();
        });

        it('renders hit area circle when not readonly', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} readOnly={false} />
                </svg>
            );
            // Should have transparent hit area
            const transparentCircle = Array.from(container.querySelectorAll('circle'))
                .find(circle => circle.getAttribute('fill') === 'transparent');
            expect(transparentCircle).toBeInTheDocument();
        });

        it('does not render hit area circle when readonly', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} readOnly={true} />
                </svg>
            );
            // Should not have transparent hit area
            const transparentCircle = Array.from(container.querySelectorAll('circle'))
                .find(circle => circle.getAttribute('fill') === 'transparent');
            expect(transparentCircle).toBeUndefined();
        });
    });

    describe('Interactions - Desktop', () => {
        beforeEach(() => {
            // Mock desktop environment
            delete window.ontouchstart;
        });

        it('calls onTearToggle when clicked', () => {
            const onTearToggle = jest.fn();
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} onTearToggle={onTearToggle} />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            fireEvent.click(tearGroup);
            
            expect(onTearToggle).toHaveBeenCalledWith(3);
            expect(onTearToggle).toHaveBeenCalledTimes(1);
        });

        it('does not call onTearToggle when readonly', () => {
            const onTearToggle = jest.fn();
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} onTearToggle={onTearToggle} readOnly={true} />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            fireEvent.click(tearGroup);
            
            expect(onTearToggle).not.toHaveBeenCalled();
        });

        it('calls onHoverChange on mouse enter', () => {
            const onHoverChange = jest.fn();
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} onHoverChange={onHoverChange} />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            fireEvent.mouseEnter(tearGroup);
            
            expect(onHoverChange).toHaveBeenCalledWith(3);
        });

        it('calls onHoverChange(null) on mouse leave', () => {
            const onHoverChange = jest.fn();
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} onHoverChange={onHoverChange} />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            fireEvent.mouseLeave(tearGroup);
            
            expect(onHoverChange).toHaveBeenCalledWith(null);
        });

        it('does not trigger hover events when readonly', () => {
            const onHoverChange = jest.fn();
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} onHoverChange={onHoverChange} readOnly={true} />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            fireEvent.mouseEnter(tearGroup);
            fireEvent.mouseLeave(tearGroup);
            
            expect(onHoverChange).not.toHaveBeenCalled();
        });
    });

    describe('Interactions - Touch/Mobile', () => {
        beforeEach(() => {
            // Mock mobile environment
            window.ontouchstart = jest.fn();
        });

        it('handles long press to toggle tear', () => {
            const onTearToggle = jest.fn();
            const setTouchStartTime = jest.fn();
            const setTouchStartPosition = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps} 
                        onTearToggle={onTearToggle}
                        setTouchStartTime={setTouchStartTime}
                        setTouchStartPosition={setTouchStartPosition}
                        touchStartTime={Date.now() - 600} // Started 600ms ago
                        touchStartPosition={{ x: 100, y: 100 }}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            // Simulate touch end at same position
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ clientX: 100, clientY: 100 }],
                bubbles: true
            });
            
            fireEvent(tearGroup, touchEndEvent);
            
            expect(onTearToggle).toHaveBeenCalledWith(3);
        });

        it('does not toggle if touch duration is too short', () => {
            const onTearToggle = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps} 
                        onTearToggle={onTearToggle}
                        touchStartTime={Date.now() - 100} // Only 100ms ago
                        touchStartPosition={{ x: 100, y: 100 }}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ clientX: 100, clientY: 100 }],
                bubbles: true
            });
            
            fireEvent(tearGroup, touchEndEvent);
            
            expect(onTearToggle).not.toHaveBeenCalled();
        });

        it('does not toggle if touch moved too much', () => {
            const onTearToggle = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps} 
                        onTearToggle={onTearToggle}
                        touchStartTime={Date.now() - 600} // Long enough
                        touchStartPosition={{ x: 100, y: 100 }}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            // Touch ended 20px away
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ clientX: 120, clientY: 100 }],
                bubbles: true
            });
            
            fireEvent(tearGroup, touchEndEvent);
            
            expect(onTearToggle).not.toHaveBeenCalled();
        });

        it('records touch start position and time', () => {
            const setTouchStartTime = jest.fn();
            const setTouchStartPosition = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps}
                        setTouchStartTime={setTouchStartTime}
                        setTouchStartPosition={setTouchStartPosition}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 150, clientY: 200 }],
                bubbles: true
            });
            
            fireEvent(tearGroup, touchStartEvent);
            
            expect(setTouchStartTime).toHaveBeenCalled();
            expect(setTouchStartPosition).toHaveBeenCalledWith({ x: 150, y: 200 });
        });

        it('does not handle touch events when readonly', () => {
            const onTearToggle = jest.fn();
            const setTouchStartTime = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps} 
                        onTearToggle={onTearToggle}
                        setTouchStartTime={setTouchStartTime}
                        readOnly={true}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 150, clientY: 200 }],
                bubbles: true
            });
            
            fireEvent(tearGroup, touchStartEvent);
            
            expect(setTouchStartTime).not.toHaveBeenCalled();
            expect(onTearToggle).not.toHaveBeenCalled();
        });
    });

    describe('Visual States', () => {
        it('applies correct cursor style when readonly', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} readOnly={true} />
                </svg>
            );
            const tearGroup = container.querySelector('g');
            expect(tearGroup).toHaveStyle({ cursor: 'default' });
        });

        it('applies pointer cursor when not readonly', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} readOnly={false} />
                </svg>
            );
            const tearGroup = container.querySelector('g');
            expect(tearGroup).toHaveStyle({ cursor: 'pointer' });
        });

        it('stops propagation on mouseDown events', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} />
                </svg>
            );
            
            const circle = container.querySelector('circle[r="12"]');
            if (circle) {
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true
                });
                
                const stopPropagation = jest.spyOn(mouseDownEvent, 'stopPropagation');
                fireEvent(circle, mouseDownEvent);
                
                expect(stopPropagation).toHaveBeenCalled();
            }
        });
    });

    describe('PropTypes validation', () => {
        const originalError = console.error;
        
        beforeAll(() => {
            console.error = jest.fn();
        });

        afterAll(() => {
            console.error = originalError;
        });

        it('validates required props', () => {
            // Should render without errors even with minimal props
            const { container } = render(
                <svg>
                    <TearMarker 
                        hour={6}
                        onTearToggle={jest.fn()}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            expect(tearGroup).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles hour 12 correctly', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} hour={12} />
                </svg>
            );
            const tearGroup = container.querySelector('g');
            expect(tearGroup).toBeInTheDocument();
        });

        it('handles hour 1 correctly', () => {
            const { container } = render(
                <svg>
                    <TearMarker {...defaultProps} hour={1} />
                </svg>
            );
            const tearGroup = container.querySelector('g');
            expect(tearGroup).toBeInTheDocument();
        });

        it('handles missing touch start data gracefully', () => {
            const onTearToggle = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps} 
                        onTearToggle={onTearToggle}
                        touchStartTime={null}
                        touchStartPosition={null}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ clientX: 100, clientY: 100 }],
                bubbles: true
            });
            
            // Should not throw error
            fireEvent(tearGroup, touchEndEvent);
            
            expect(onTearToggle).not.toHaveBeenCalled();
        });

        it('cleans up touch state after touch end', () => {
            const setTouchStartTime = jest.fn();
            const setTouchStartPosition = jest.fn();
            
            const { container } = render(
                <svg>
                    <TearMarker 
                        {...defaultProps}
                        setTouchStartTime={setTouchStartTime}
                        setTouchStartPosition={setTouchStartPosition}
                        touchStartTime={Date.now() - 600}
                        touchStartPosition={{ x: 100, y: 100 }}
                    />
                </svg>
            );
            
            const tearGroup = container.querySelector('g');
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ clientX: 100, clientY: 100 }],
                bubbles: true
            });
            
            fireEvent(tearGroup, touchEndEvent);
            
            expect(setTouchStartTime).toHaveBeenCalledWith(null);
            expect(setTouchStartPosition).toHaveBeenCalledWith(null);
        });
    });
});