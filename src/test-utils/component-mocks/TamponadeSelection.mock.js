import React from 'react';

/**
 * Mock for TamponadeSelection component
 * Provides both minimal and detailed versions for different testing needs
 */

// Minimal mock for unit tests
export const createMinimalMock = () => {
  return jest.fn(({ value, onChange, disabled, isMobile }) => (
    <div 
      data-testid="tamponade-selection"
      data-value={value}
      data-disabled={disabled}
      data-mobile={isMobile}
    >
      Mock TamponadeSelection: {value}
    </div>
  ));
};

// Detailed mock for integration tests
export const createDetailedMock = () => {
  const options = [
    { value: 'sf6', label: 'SF6 gas' },
    { value: 'c2f6', label: 'C2F6 gas' },
    { value: 'c3f8', label: 'C3F8 gas' },
    { value: 'air', label: 'Air' },
    { value: 'light_oil', label: 'Light silicone oil' },
    { value: 'heavy_oil', label: 'Heavy silicone oil' }
  ];

  return jest.fn(({ value, onChange, disabled, isMobile }) => (
    <div 
      data-testid="tamponade-selection"
      className={isMobile ? 'space-y-1' : 'space-y-4'}
    >
      <label 
        className="block text-sm font-medium text-gray-700"
        id="tamponade-group-label"
      >
        Tamponade
      </label>
      <div 
        role="radiogroup"
        aria-labelledby="tamponade-group-label"
        aria-required="true"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`tamponade-${option.value}`}
              name="tamponade"
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange && onChange(e.target.value)}
              disabled={disabled}
              aria-label={option.label}
            />
            <label htmlFor={`tamponade-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  ));
};

// Default export for jest.mock()
const MockTamponadeSelection = createMinimalMock();
export default MockTamponadeSelection;