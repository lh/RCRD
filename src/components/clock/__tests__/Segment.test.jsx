/**
 * Tests for Segment component
 * Focus: Visual rendering and interaction of individual clock segments
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Segment from '../Segment';

describe('Segment', () => {
  describe('rendering', () => {
    test('renders with correct rotation style', () => {
      const { container } = render(<Segment angle={45} />);
      const segment = container.firstChild;
      expect(segment.style.transform).toBe('rotate(45deg)');
    });

    test('applies correct base classes', () => {
      const { container } = render(<Segment angle={0} />);
      const segment = container.firstChild;
      expect(segment).toHaveClass(
        'absolute',
        'w-1',
        'h-8',
        'origin-bottom',
        'transform',
        '-translate-x-1/2',
        'cursor-pointer',
        'transition-colors'
      );
    });

    test('applies unselected style by default', () => {
      const { container } = render(<Segment angle={0} />);
      const segment = container.firstChild;
      expect(segment).toHaveClass('bg-gray-300');
      expect(segment).not.toHaveClass('bg-blue-500');
    });

    test('applies selected style when isSelected is true', () => {
      const { container } = render(<Segment angle={0} isSelected={true} />);
      const segment = container.firstChild;
      expect(segment).toHaveClass('bg-blue-500');
      expect(segment).not.toHaveClass('bg-gray-300');
    });
  });

  describe('interactions', () => {
    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      const { container } = render(<Segment angle={0} onClick={handleClick} />);
      const segment = container.firstChild;
      
      fireEvent.click(segment);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not throw when clicked without onClick handler', () => {
      const { container } = render(<Segment angle={0} />);
      const segment = container.firstChild;
      
      expect(() => {
        fireEvent.click(segment);
      }).not.toThrow();
    });
  });

  describe('prop validation', () => {
    test('handles zero angle', () => {
      const { container } = render(<Segment angle={0} />);
      const segment = container.firstChild;
      expect(segment.style.transform).toBe('rotate(0deg)');
    });

    test('handles negative angles', () => {
      const { container } = render(<Segment angle={-45} />);
      const segment = container.firstChild;
      expect(segment.style.transform).toBe('rotate(-45deg)');
    });

    test('handles large angles', () => {
      const { container } = render(<Segment angle={360} />);
      const segment = container.firstChild;
      expect(segment.style.transform).toBe('rotate(360deg)');
    });
  });
});
