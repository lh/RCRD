import React, { useState } from 'react';
import { screen, fireEvent, act, waitFor, render } from '@testing-library/react';
import { mockProps, renderMobile, resetMocks } from '../test-helpers/RiskInputForm.helpers';
import { pvrOptions, gaugeOptions } from '../../constants/riskCalculatorConstants';
import RiskInputForm from '../RiskInputForm';

// Wrapper component that manages its own state for testing
const TestWrapper = ({ position = 'left' }) => {
  const [age, setAge] = useState('');
  const [pvrGrade, setPvrGrade] = useState('');
  const [vitrectomyGauge, setVitrectomyGauge] = useState('');

  return (
    <RiskInputForm
      position={position}
      age={age}
      setAge={setAge}
      pvrGrade={pvrGrade}
      setPvrGrade={setPvrGrade}
      vitrectomyGauge={vitrectomyGauge}
      setVitrectomyGauge={setVitrectomyGauge}
    />
  );
};

describe('RiskInputForm Accessibility', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('Age Input', () => {
    test('renders age input with proper label association in desktop view', () => {
      render(<TestWrapper />);
      
      const label = screen.getByTestId('age-label');
      const input = screen.getByTestId('age-input');
      
      expect(label).toHaveAttribute('for', 'age-input');
      expect(input).toHaveAttribute('id', 'age-input');
    });

    test('renders age input with proper label association in mobile view', () => {
      renderMobile();

      const label = screen.getByText(/age \(years\)/i);
      const input = screen.getByLabelText(/age \(years\)/i);

      expect(label).toHaveAttribute('for', 'age-input-mobile');
      expect(input).toHaveAttribute('id', 'age-input-mobile');
    });

    test('includes required ARIA attributes', () => {
      render(<TestWrapper />);

      const input = screen.getByLabelText(/age \(years\)/i);

      expect(input).toHaveAttribute('role', 'spinbutton');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-valuemin', '18');
      expect(input).toHaveAttribute('aria-valuemax', '100');
      expect(input).toHaveAttribute('aria-invalid', 'true'); // Initially invalid as empty
    });

    test('updates aria-invalid based on validation state', async () => {
      render(<TestWrapper />);

      const input = screen.getByLabelText(/age \(years\)/i);

      // Initially invalid (empty)
      expect(input).toHaveAttribute('aria-invalid', 'true');

      // Valid age
      await act(async () => {
        fireEvent.change(input, { target: { value: '50' } });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'false');
      });

      // Invalid age (too low)
      await act(async () => {
        fireEvent.change(input, { target: { value: '17' } });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });

      // Invalid age (too high)
      await act(async () => {
        fireEvent.change(input, { target: { value: '101' } });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('PVR Grade Selection', () => {
    test('radio buttons have proper label associations in desktop view', () => {
      render(<TestWrapper position="left" />);

      pvrOptions.forEach(option => {
        const radio = screen.getByRole('radio', { name: option.label });
        const label = screen.getByText(option.label);

        expect(radio).toHaveAttribute('id', `pvr-${option.value}`);
        expect(label).toHaveAttribute('for', `pvr-${option.value}`);
      });
    });

    test('radio buttons have proper label associations in mobile view', () => {
      renderMobile();

      pvrOptions.forEach(option => {
        const radio = screen.getByRole('radio', { name: option.label });
        const label = screen.getByText(option.label);

        expect(radio).toHaveAttribute('id', `pvr-${option.value}-mobile`);
        expect(label).toHaveAttribute('for', `pvr-${option.value}-mobile`);
      });
    });

    test('radio group has proper ARIA attributes', () => {
      render(<TestWrapper position="left" />);

      const radioGroup = screen.getByRole('radiogroup', { name: /pvr grade/i });
      expect(radioGroup).toHaveAttribute('aria-required', 'true');
      expect(radioGroup).toHaveAttribute('aria-label', 'PVR Grade');
    });
  });

  describe('Vitrectomy Gauge Selection', () => {
    test('radio buttons have proper label associations in desktop view', () => {
      render(<TestWrapper position="right" />);

      gaugeOptions.forEach(option => {
        const radio = screen.getByRole('radio', { name: option.label });
        const label = screen.getByText(option.label);

        expect(radio).toHaveAttribute('id', `gauge-${option.value}`);
        expect(label).toHaveAttribute('for', `gauge-${option.value}`);
      });
    });

    test('radio buttons have proper label associations in mobile view', () => {
      renderMobile();

      gaugeOptions.forEach(option => {
        const radio = screen.getByRole('radio', { name: option.label });
        const label = screen.getByText(option.label);

        expect(radio).toHaveAttribute('id', `gauge-${option.value}-mobile`);
        expect(label).toHaveAttribute('for', `gauge-${option.value}-mobile`);
      });
    });

    test('radio group has proper ARIA attributes', () => {
      render(<TestWrapper position="right" />);

      const radioGroup = screen.getByRole('radiogroup', { name: /vitrectomy gauge/i });
      expect(radioGroup).toHaveAttribute('aria-required', 'true');
      expect(radioGroup).toHaveAttribute('aria-label', 'Vitrectomy Gauge');
    });
  });
});
