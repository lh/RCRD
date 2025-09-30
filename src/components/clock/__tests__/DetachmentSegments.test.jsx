import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetachmentSegments from '../DetachmentSegments';
import { CLOCK } from '../utils/clockConstants';

describe('DetachmentSegments Component', () => {
    const defaultProps = {
        currentDetachmentSegments: [],
        readOnly: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders without crashing', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} />
                </svg>
            );
            const segmentGroup = container.querySelector('g');
            expect(segmentGroup).toBeInTheDocument();
        });

        it('renders correct number of segments', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} />
                </svg>
            );
            const segments = container.querySelectorAll('path');
            expect(segments).toHaveLength(CLOCK.SEGMENTS);
        });

        it('renders all segments as transparent when none are selected', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} currentDetachmentSegments={[]} />
                </svg>
            );
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                expect(segment).toHaveAttribute('fill', 'transparent');
            });
        });

        it('highlights selected segments', () => {
            const selectedSegments = ['segment0', 'segment5', 'segment10'];
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={selectedSegments} 
                    />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            const highlightedSegments = Array.from(segments).filter(
                segment => segment.getAttribute('fill') === 'rgba(59, 130, 246, 0.5)'
            );
            
            expect(highlightedSegments).toHaveLength(3);
        });

        it('renders segments with correct arc paths', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                const d = segment.getAttribute('d');
                expect(d).toContain('M'); // Move command
                expect(d).toContain('L'); // Line command
                expect(d).toContain('A'); // Arc command
            });
        });
    });

    describe('Interactivity', () => {
        it('applies pointer cursor when not readonly', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} readOnly={false} />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                expect(segment).toHaveClass('cursor-pointer');
                expect(segment).toHaveStyle({ pointerEvents: 'auto' });
            });
        });

        it('disables pointer events when readonly', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} readOnly={true} />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                expect(segment).toHaveStyle({ pointerEvents: 'none' });
            });
        });

        it('shows correct title for highlighted segments', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={['segment0']} 
                    />
                </svg>
            );
            
            const firstSegment = container.querySelector('path');
            expect(firstSegment).toHaveAttribute('title', 'Click and drag to remove detachment');
        });

        it('shows correct title for non-highlighted segments', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={[]} 
                    />
                </svg>
            );
            
            const firstSegment = container.querySelector('path');
            expect(firstSegment).toHaveAttribute('title', 'Click and drag to add detachment');
        });

        it('applies hover styles correctly', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} readOnly={false} />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                expect(segment).toHaveClass('hover:fill-blue-200');
                expect(segment).toHaveClass('transition-colors');
            });
        });
    });

    describe('Visual States', () => {
        it('applies correct isolation mode', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} />
                </svg>
            );
            
            const group = container.querySelector('g');
            expect(group).toHaveStyle({ isolation: 'isolate' });
        });

        it('has pointer-events-auto class on group', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments {...defaultProps} />
                </svg>
            );
            
            const group = container.querySelector('g');
            expect(group).toHaveClass('pointer-events-auto');
        });
    });

    describe('Edge Cases', () => {
        it('handles empty currentDetachmentSegments array', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={[]} 
                    />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                expect(segment).toHaveAttribute('fill', 'transparent');
            });
        });

        it('handles all segments being selected', () => {
            const allSegments = Array.from({ length: CLOCK.SEGMENTS }, (_, i) => `segment${i}`);
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={allSegments} 
                    />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            segments.forEach(segment => {
                expect(segment).toHaveAttribute('fill', 'rgba(59, 130, 246, 0.5)');
            });
        });

        it('handles invalid segment IDs gracefully', () => {
            const invalidSegments = ['invalid', 'segment999', 'test'];
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={invalidSegments} 
                    />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            // Should render all segments, none highlighted
            expect(segments).toHaveLength(CLOCK.SEGMENTS);
            segments.forEach(segment => {
                expect(segment).toHaveAttribute('fill', 'transparent');
            });
        });

        it('renders correctly at segment boundaries', () => {
            // Test segments at clock boundaries (0 and 23)
            const boundarySegments = ['segment0', 'segment23'];
            const { container } = render(
                <svg>
                    <DetachmentSegments 
                        {...defaultProps} 
                        currentDetachmentSegments={boundarySegments} 
                    />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            const firstSegment = segments[0];
            const lastSegment = segments[23];
            
            expect(firstSegment).toHaveAttribute('fill', 'rgba(59, 130, 246, 0.5)');
            expect(lastSegment).toHaveAttribute('fill', 'rgba(59, 130, 246, 0.5)');
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

        it('renders with minimal props', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments />
                </svg>
            );
            
            const group = container.querySelector('g');
            expect(group).toBeInTheDocument();
        });

        it('handles undefined currentDetachmentSegments', () => {
            const { container } = render(
                <svg>
                    <DetachmentSegments readOnly={false} />
                </svg>
            );
            
            const segments = container.querySelectorAll('path');
            expect(segments).toHaveLength(CLOCK.SEGMENTS);
        });
    });
});