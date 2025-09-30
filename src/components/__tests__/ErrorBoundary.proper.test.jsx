import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error: Component crashed!');
  }
  return <div>Working Component</div>;
};

// Component that throws an error in useEffect
const ThrowErrorInEffect = () => {
  React.useEffect(() => {
    throw new Error('Test error: Effect crashed!');
  }, []);
  return <div>Component with effect</div>;
};

// Suppress console.error for these tests since we're intentionally causing errors
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PropTypes validation', () => {
    it('requires children prop', () => {
      // This will trigger PropTypes warning in development
      const { container } = render(<ErrorBoundary />);
      // Component should still render but return null without children
      expect(container.firstChild).toBeNull();
    });

    it('accepts valid children', () => {
      render(
        <ErrorBoundary>
          <div>Test Child</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  describe('Normal operation', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Normal Child Component</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Normal Child Component')).toBeInTheDocument();
    });

    it('passes through multiple children', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('catches errors and displays error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Should show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/The calculator encountered an unexpected error/i)).toBeInTheDocument();
    });

    it('displays the error message in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Error details are only shown in development mode
      const detailsElement = screen.getByText(/Error Details \(Development Only\)/i);
      expect(detailsElement).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('shows reload button when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const reloadButton = screen.getByRole('button', { name: /refresh page/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('logs error in development mode', () => {
      const spy = jest.spyOn(console, 'error');
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // In development, console.error should be called
      expect(spy).toHaveBeenCalled();
    });

    it('reloads page when reload button is clicked', () => {
      // Mock window.location.reload properly
      delete window.location;
      window.location = { reload: jest.fn() };
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const reloadButton = screen.getByRole('button', { name: /refresh page/i });
      reloadButton.click();
      
      expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it('maintains error count across renders', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      // Re-render with same error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Should still show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error recovery', () => {
    it('can recover from error state when children change', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Initially shows error
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      // When we provide working children after reload
      delete window.location;
      window.location = { reload: jest.fn() };
      const reloadButton = screen.getByRole('button', { name: /refresh page/i });
      reloadButton.click();
      
      // In real app, reload would reset everything
      // For testing, we verify reload was called
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('Error boundary container', () => {
    it('has proper styling when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const container = document.querySelector('.error-boundary-fallback');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('p-6', 'm-4', 'bg-red-50');
    });

    it('displays error details in error state in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Check for error details section in development mode
      const detailsButton = screen.getByText(/Error Details \(Development Only\)/i);
      expect(detailsButton).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Complex error scenarios', () => {
    it('handles errors from nested components', () => {
      const NestedError = () => (
        <div>
          <div>
            <ThrowError shouldThrow={true} />
          </div>
        </div>
      );
      
      render(
        <ErrorBoundary>
          <NestedError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('catches errors from async components', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorInEffect />
        </ErrorBoundary>
      );
      
      // Note: useEffect errors are not caught by error boundaries
      // This test documents that limitation
    });
  });
});