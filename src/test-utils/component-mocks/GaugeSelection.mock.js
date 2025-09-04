import React from 'react';

/**
 * Mock for GaugeSelection component
 * Provides both minimal and detailed versions for different testing needs
 */

// Minimal mock for unit tests (fast, focuses on props)
export const createMinimalMock = () => {
  return jest.fn(({ value, onChange, disabled, isMobile }) => (
    <div 
      data-testid="gauge-selection"
      data-value={value}
      data-disabled={disabled}
      data-mobile={isMobile}
    >
      Mock GaugeSelection: {value}
    </div>
  ));
};

// Detailed mock for integration tests (realistic behavior)
export const createDetailedMock = () => {
  const options = [
    { value: '20g', label: '20 gauge' },
    { value: '23g', label: '23 gauge' },
    { value: '25g', label: '25 gauge' },
    { value: '27g', label: '27 gauge' },
    { value: 'not_recorded', label: 'Not recorded' }
  ];

  return jest.fn(({ value, onChange, disabled, isMobile }) => (
    <div 
      data-testid="gauge-selection"
      className={isMobile ? 'space-y-1' : 'space-y-4'}
    >
      <label 
        className="block text-sm font-medium text-gray-700"
        id="gauge-group-label"
      >
        Vitrectomy Gauge
      </label>
      <div 
        role="radiogroup"
        aria-labelledby="gauge-group-label"
        aria-required="true"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`gauge-${option.value}`}
              name="gauge"
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange && onChange(e.target.value)}
              disabled={disabled}
              aria-label={option.label}
            />
            <label htmlFor={`gauge-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  ));
};

// Default export for jest.mock() - uses minimal by default
const MockGaugeSelection = createMinimalMock();
export default MockGaugeSelection;