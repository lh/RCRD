import React from 'react';
import { render, screen } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';

// Mock child components
jest.mock('../MobileRetinalCalculator', () => {
  return function MockMobileRetinalCalculator() {
    return <div data-testid="mobile-calculator">Mobile Version</div>;
  };
});

jest.mock('../DesktopRetinalCalculator', () => {
  return function MockDesktopRetinalCalculator() {
    return <div data-testid="desktop-calculator">Desktop Version</div>;
  };
});

describe('RetinalCalculator', () => {
  test('renders mobile version for small screens', () => {
    render(<RetinalCalculator />);
    
    // Mobile version should be visible
    const mobileSection = screen.getByTestId('mobile-calculator');
    expect(mobileSection).toBeInTheDocument();
    expect(mobileSection.closest('.md\\:hidden')).toBeInTheDocument();
    
    // Desktop version should be hidden
    const desktopSection = screen.getByTestId('desktop-calculator');
    expect(desktopSection.closest('.hidden.md\\:block')).toBeInTheDocument();
  });

  test('renders desktop version for large screens', () => {
    // Mock window.matchMedia for desktop view
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(min-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    render(<RetinalCalculator />);
    
    // Desktop version should be visible
    const desktopSection = screen.getByTestId('desktop-calculator');
    expect(desktopSection.closest('.hidden.md\\:block')).toBeInTheDocument();
    
    // Mobile version should be hidden
    const mobileSection = screen.getByTestId('mobile-calculator');
    expect(mobileSection.closest('.md\\:hidden')).toBeInTheDocument();
  });

  test('renders header content correctly', () => {
    render(<RetinalCalculator />);
    
    // Check title
    expect(screen.getByRole('heading', { 
      name: /retinal detachment risk calculator/i 
    })).toBeInTheDocument();
    
    // Check study links
    expect(screen.getByRole('link', { name: /uk beavrs/i }))
      .toHaveAttribute('href', 'https://www.beavrs.org/');
    expect(screen.getByRole('link', { name: /study/i }))
      .toHaveAttribute('href', 'https://www.nature.com/articles/s41433-023-02388-0 ');
  });
});
