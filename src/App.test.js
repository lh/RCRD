import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the child components to isolate App.js testing
jest.mock('./components/ErrorBoundary.jsx', () => {
  return function MockErrorBoundary({ children }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

jest.mock('./components/RetinalCalculator.jsx', () => {
  return function MockRetinalCalculator() {
    return <div data-testid="retinal-calculator">Retinal Calculator</div>;
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders the ErrorBoundary wrapper', () => {
    render(<App />);
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
  });

  it('renders RetinalCalculator inside ErrorBoundary', () => {
    render(<App />);
    const calculator = screen.getByTestId('retinal-calculator');
    expect(calculator).toBeInTheDocument();
    expect(calculator.textContent).toBe('Retinal Calculator');
  });

  it('applies the correct CSS classes for styling', () => {
    const { container } = render(<App />);
    const appDiv = container.firstChild;
    expect(appDiv).toHaveClass('App');
    expect(appDiv).toHaveClass('px-2');
    expect(appDiv).toHaveClass('md:px-8');
    expect(appDiv).toHaveClass('min-h-screen');
  });

  it('provides proper structure for responsive layout', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeTruthy();
    
    // Check that it contains the expected structure
    const errorBoundary = appDiv.querySelector('[data-testid="error-boundary"]');
    expect(errorBoundary).toBeTruthy();
    
    const calculator = errorBoundary.querySelector('[data-testid="retinal-calculator"]');
    expect(calculator).toBeTruthy();
  });
});