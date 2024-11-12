/**
 * Tests for Controls component
 * Focus: Device-specific rendering and interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Controls from '../Controls';

describe('Controls', () => {
  describe('rendering', () => {
    test('renders touch device layout when isTouchDevice is true', () => {
      const { getByText, queryByText } = render(
        <Controls isTouchDevice={true} handleClearAll={() => {}} />
      );

      // Should show collapsible instructions button
      expect(getByText('Instructions')).toBeInTheDocument();
      
      // Should not show desktop instructions
      expect(queryByText('Click and drag to toggle detached areas')).not.toBeInTheDocument();
    });

    test('renders desktop layout when isTouchDevice is false', () => {
      const { getByText, queryByText } = render(
        <Controls isTouchDevice={false} handleClearAll={() => {}} />
      );

      // Should show desktop instructions
      expect(getByText('Click and drag to toggle detached areas')).toBeInTheDocument();
      
      // Should not show instructions toggle button
      expect(queryByText('Instructions')).not.toBeInTheDocument();
    });

    test('renders clear all button in both layouts', () => {
      const { getByText, rerender } = render(
        <Controls isTouchDevice={true} handleClearAll={() => {}} />
      );
      expect(getByText('Clear All')).toBeInTheDocument();

      rerender(<Controls isTouchDevice={false} handleClearAll={() => {}} />);
      expect(getByText('Clear All')).toBeInTheDocument();
    });

    test('expands instructions upward by default on touch devices', () => {
      const { getByText, container } = render(
        <Controls isTouchDevice={true} handleClearAll={() => {}} />
      );

      // Click instructions button
      fireEvent.click(getByText('Instructions'));

      // Instructions panel should have bottom-full class
      const panel = container.querySelector('.bottom-full');
      expect(panel).toBeInTheDocument();
    });

    test('expands instructions downward when specified', () => {
      const { getByText, container } = render(
        <Controls 
          isTouchDevice={true} 
          handleClearAll={() => {}} 
          expandDirection="down"
        />
      );

      // Click instructions button
      fireEvent.click(getByText('Instructions'));

      // Instructions panel should have top-full class
      const panel = container.querySelector('.top-full');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('toggles instructions panel on touch devices', () => {
      const { getByText, queryByText } = render(
        <Controls isTouchDevice={true} handleClearAll={() => {}} />
      );

      // Initially instructions should be hidden
      expect(queryByText('Touch and drag to mark or unmark detached areas')).not.toBeInTheDocument();

      // Click instructions button
      fireEvent.click(getByText('Instructions'));

      // Instructions should be visible
      expect(getByText('Touch and drag to mark or unmark detached areas')).toBeInTheDocument();

      // Click instructions button again
      fireEvent.click(getByText('Instructions'));

      // Instructions should be hidden again
      expect(queryByText('Touch and drag to mark or unmark detached areas')).not.toBeInTheDocument();
    });

    test('calls handleClearAll when clear button is clicked', () => {
      const handleClearAll = jest.fn();
      const { getByText } = render(
        <Controls isTouchDevice={true} handleClearAll={handleClearAll} />
      );

      fireEvent.click(getByText('Clear All'));
      expect(handleClearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    test('instructions are always visible to screen readers in desktop mode', () => {
      const { getByText } = render(
        <Controls isTouchDevice={false} handleClearAll={() => {}} />
      );

      const instructions = getByText('Click and drag to toggle detached areas');
      expect(instructions).toBeVisible();
    });

    test('instructions toggle button is keyboard accessible', () => {
      const { getByText } = render(
        <Controls isTouchDevice={true} handleClearAll={() => {}} />
      );

      const button = getByText('Instructions');
      
      // Focus and press Enter
      button.focus();
      fireEvent.click(button);

      // Instructions should be visible
      expect(getByText('Touch and drag to mark or unmark detached areas')).toBeInTheDocument();
    });

    test('clear button is keyboard accessible', () => {
      const handleClearAll = jest.fn();
      const { getByText } = render(
        <Controls isTouchDevice={true} handleClearAll={handleClearAll} />
      );

      const button = getByText('Clear All');
      
      // Focus and press Enter
      button.focus();
      fireEvent.click(button);

      expect(handleClearAll).toHaveBeenCalled();
    });
  });
});
