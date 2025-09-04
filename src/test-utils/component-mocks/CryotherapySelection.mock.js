import React from 'react';

/**
 * Mock for CryotherapySelection component
 * Provides both minimal and detailed versions for different testing needs
 */

// Minimal mock for unit tests
export const createMinimalMock = () => {
  return jest.fn(({ value, onChange, disabled, isMobile }) => (
    <div 
      data-testid="cryotherapy-selection"
      data-value={value}
      data-disabled={disabled}
      data-mobile={isMobile}
    >
      Mock CryotherapySelection: {value}
    </div>
  ));
};

// Detailed mock for integration tests
export const createDetailedMock = () => {
  const options = [
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' }
  ];

  return jest.fn(({ value, onChange, disabled, isMobile }) => (
    <div 
      data-testid="cryotherapy-selection"
      className={isMobile ? 'space-y-1' : 'space-y-4'}
    >
      <label 
        className="block text-sm font-medium text-gray-700"
        id="cryotherapy-group-label"
      >
        Cryotherapy
      </label>
      <div 
        role="radiogroup"
        aria-labelledby="cryotherapy-group-label"
        aria-required="true"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`cryo-${option.value}`}
              name="cryotherapy"
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange && onChange(e.target.value)}
              disabled={disabled}
              aria-label={`${option.label} Cryotherapy`}
            />
            <label htmlFor={`cryo-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  ));
};

// Default export for jest.mock()
const MockCryotherapySelection = createMinimalMock();
export default MockCryotherapySelection;