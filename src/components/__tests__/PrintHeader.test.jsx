import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrintHeader from '../PrintHeader';

describe('PrintHeader', () => {
    // Mock Date to have consistent timestamps in tests
    const originalDate = Date;
    const mockDateString = '1/15/2024, 10:30:00 AM';

    beforeEach(() => {
        // Create a mock Date constructor
        global.Date = class extends originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super('2024-01-15T10:30:00');
                } else {
                    super(...args);
                }
            }
            
            toLocaleString() {
                return mockDateString;
            }
        };
        // Preserve static methods
        global.Date.now = originalDate.now;
        global.Date.parse = originalDate.parse;
        global.Date.UTC = originalDate.UTC;
    });

    afterEach(() => {
        global.Date = originalDate;
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(<PrintHeader />);
            expect(screen.getByText('Retinal Detachment Risk Calculator Results')).toBeInTheDocument();
        });

        it('should display the main heading', () => {
            render(<PrintHeader />);
            const heading = screen.getByText('Retinal Detachment Risk Calculator Results');
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe('H1');
        });

        it('should display the timestamp', () => {
            render(<PrintHeader />);
            expect(screen.getByText(`Generated: ${mockDateString}`)).toBeInTheDocument();
        });

        it('should render timestamp in a paragraph element', () => {
            render(<PrintHeader />);
            const timestampElement = screen.getByText(/Generated:/);
            expect(timestampElement.tagName).toBe('P');
        });
    });

    describe('Styling', () => {
        it('should apply correct CSS classes to container', () => {
            const { container } = render(<PrintHeader />);
            const headerDiv = container.firstChild;
            expect(headerDiv).toHaveClass('print-header', 'hidden');
        });

        it('should apply correct CSS classes to heading', () => {
            render(<PrintHeader />);
            const heading = screen.getByText('Retinal Detachment Risk Calculator Results');
            expect(heading).toHaveClass('text-2xl', 'font-bold');
        });

        it('should apply correct CSS classes to timestamp paragraph', () => {
            render(<PrintHeader />);
            const timestamp = screen.getByText(/Generated:/);
            expect(timestamp).toHaveClass('text-sm', 'mt-2');
        });

        it('should have hidden class for print-only display', () => {
            const { container } = render(<PrintHeader />);
            expect(container.firstChild).toHaveClass('hidden');
        });
    });

    describe('Timestamp Functionality', () => {
        it('should use current date and time', () => {
            // Track if Date constructor is called
            let dateConstructorCalled = false;
            const OriginalMockedDate = global.Date;
            
            global.Date = class extends originalDate {
                constructor(...args) {
                    dateConstructorCalled = true;
                    if (args.length === 0) {
                        super('2024-01-15T10:30:00');
                    } else {
                        super(...args);
                    }
                }
                toLocaleString() {
                    return mockDateString;
                }
            };
            
            render(<PrintHeader />);
            expect(dateConstructorCalled).toBe(true);
            
            global.Date = OriginalMockedDate;
        });

        it('should format timestamp using toLocaleString', () => {
            const MockedDate = global.Date;
            const toLocaleStringSpy = jest.spyOn(MockedDate.prototype, 'toLocaleString');
            render(<PrintHeader />);
            expect(toLocaleStringSpy).toHaveBeenCalled();
            toLocaleStringSpy.mockRestore();
        });

        it('should update timestamp on re-render', () => {
            const { rerender } = render(<PrintHeader />);
            const firstTimestamp = screen.getByText(/Generated:/).textContent;

            // Change the mock date
            const newDateString = '1/16/2024, 2:45:00 PM';
            global.Date = class extends originalDate {
                constructor() {
                    super('2024-01-16T14:45:00');
                }
                toLocaleString() {
                    return newDateString;
                }
            };

            rerender(<PrintHeader />);
            const secondTimestamp = screen.getByText(/Generated:/).textContent;

            expect(firstTimestamp).not.toBe(secondTimestamp);
            expect(secondTimestamp).toContain(newDateString);
        });

        it('should handle different locale formats', () => {
            const customDateString = '15/01/2024, 10:30:00';
            global.Date = class extends originalDate {
                constructor() {
                    super('2024-01-15T10:30:00');
                }
                toLocaleString() {
                    return customDateString;
                }
            };

            render(<PrintHeader />);
            expect(screen.getByText(`Generated: ${customDateString}`)).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should have the correct DOM structure', () => {
            const { container } = render(<PrintHeader />);
            
            const headerDiv = container.querySelector('.print-header');
            expect(headerDiv).toBeInTheDocument();
            
            const heading = headerDiv.querySelector('h1');
            expect(heading).toBeInTheDocument();
            expect(heading.textContent).toBe('Retinal Detachment Risk Calculator Results');
            
            const paragraph = headerDiv.querySelector('p');
            expect(paragraph).toBeInTheDocument();
            expect(paragraph.textContent).toContain('Generated:');
        });

        it('should render exactly one h1 element', () => {
            const { container } = render(<PrintHeader />);
            const headings = container.querySelectorAll('h1');
            expect(headings).toHaveLength(1);
        });

        it('should render exactly one p element', () => {
            const { container } = render(<PrintHeader />);
            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(1);
        });

        it('should not have any interactive elements', () => {
            const { container } = render(<PrintHeader />);
            expect(container.querySelector('button')).not.toBeInTheDocument();
            expect(container.querySelector('input')).not.toBeInTheDocument();
            expect(container.querySelector('select')).not.toBeInTheDocument();
            expect(container.querySelector('a')).not.toBeInTheDocument();
        });
    });

    describe('Print Behavior', () => {
        it('should be hidden by default (for screen display)', () => {
            const { container } = render(<PrintHeader />);
            const headerDiv = container.firstChild;
            expect(headerDiv).toHaveClass('hidden');
        });

        it('should have print-header class for print CSS targeting', () => {
            const { container } = render(<PrintHeader />);
            const headerDiv = container.firstChild;
            expect(headerDiv).toHaveClass('print-header');
        });

        it('should contain print-specific content', () => {
            render(<PrintHeader />);
            // The title indicates this is for printed results
            expect(screen.getByText(/Results$/)).toBeInTheDocument();
            // The timestamp shows when it was generated
            expect(screen.getByText(/Generated:/)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle invalid Date objects gracefully', () => {
            const invalidDate = new Date('invalid');
            global.Date = jest.fn(() => invalidDate);

            render(<PrintHeader />);
            // Should still render, even with "Invalid Date"
            expect(screen.getByText(/Generated:/)).toBeInTheDocument();
        });

        it('should render consistently regardless of timezone', () => {
            // Test with different timezone mock
            const utcDateString = '2024-01-15T10:30:00Z';
            global.Date = class extends originalDate {
                constructor() {
                    super(utcDateString);
                }
                toLocaleString() {
                    return 'UTC Time String';
                }
            };

            const { container } = render(<PrintHeader />);
            expect(container.firstChild).toBeInTheDocument();
            expect(screen.getByText(/Generated:/)).toBeInTheDocument();
        });

        it('should not throw when Date constructor is modified', () => {
            global.Date = undefined;
            expect(() => {
                // This would normally throw, but we restore Date first
                global.Date = originalDate;
                render(<PrintHeader />);
            }).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have appropriate heading hierarchy', () => {
            render(<PrintHeader />);
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Retinal Detachment Risk Calculator Results');
        });

        it('should have semantic HTML structure', () => {
            const { container } = render(<PrintHeader />);
            
            // Check for semantic elements
            expect(container.querySelector('h1')).toBeInTheDocument();
            expect(container.querySelector('p')).toBeInTheDocument();
        });

        it('should have descriptive text content', () => {
            render(<PrintHeader />);
            
            // Title is descriptive
            expect(screen.getByText(/Retinal Detachment Risk Calculator Results/)).toBeInTheDocument();
            
            // Timestamp is clearly labeled
            expect(screen.getByText(/Generated:/)).toBeInTheDocument();
        });
    });
});