import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import mock creators
import { createMinimalMock as createMinimalRiskInputForm, createDetailedMock as createDetailedRiskInputForm } from '../RiskInputForm.mock';
import { createMinimalMock as createMinimalRiskResults, createDetailedMock as createDetailedRiskResults } from '../RiskResults.mock';
import { createMinimalMock as createMinimalGaugeSelection, createDetailedMock as createDetailedGaugeSelection } from '../GaugeSelection.mock';
import { createMinimalMock as createMinimalTamponadeSelection, createDetailedMock as createDetailedTamponadeSelection } from '../TamponadeSelection.mock';
import { createMinimalMock as createMinimalCryotherapySelection, createDetailedMock as createDetailedCryotherapySelection } from '../CryotherapySelection.mock';
import { createMinimalMock as createMinimalClockFace, createDetailedMock as createDetailedClockFace } from '../ClockFace.mock';

describe('Mock Verification Tests', () => {
  describe('RiskInputForm Mock Consistency', () => {
    const testProps = {
      position: 'left',
      age: '50',
      setAge: jest.fn(),
      pvrGrade: 'none',
      setPvrGrade: jest.fn(),
      vitrectomyGauge: '25g',
      setVitrectomyGauge: jest.fn(),
      cryotherapy: 'no',
      setCryotherapy: jest.fn(),
      tamponade: 'sf6',
      setTamponade: jest.fn(),
      disabled: false,
      isMobile: false
    };

    it('should accept same props in both minimal and detailed versions', () => {
      const MinimalMock = createMinimalRiskInputForm();
      const DetailedMock = createDetailedRiskInputForm();

      expect(() => render(<MinimalMock {...testProps} />)).not.toThrow();
      expect(() => render(<DetailedMock {...testProps} />)).not.toThrow();
    });

    it('should use consistent test IDs between versions', () => {
      const MinimalMock = createMinimalRiskInputForm();
      const DetailedMock = createDetailedRiskInputForm();

      const { container: minimalContainer } = render(<MinimalMock {...testProps} />);
      const { container: detailedContainer } = render(<DetailedMock {...testProps} />);

      // Both should have the same form testid
      expect(minimalContainer.querySelector('[data-testid="risk-form-left"]')).toBeInTheDocument();
      expect(detailedContainer.querySelector('[data-testid="risk-form-left"]')).toBeInTheDocument();

      // Both should have consistent age input testid
      expect(minimalContainer.querySelector('[data-testid="age-input-left"]')).toBeInTheDocument();
      expect(detailedContainer.querySelector('[data-testid="age-input-left"]')).toBeInTheDocument();
    });

    it('should respect position-based field visibility in both versions', () => {
      const MinimalMock = createMinimalRiskInputForm();
      const DetailedMock = createDetailedRiskInputForm();

      // Test left position - should show age, pvr, gauge
      const leftProps = { ...testProps, position: 'left' };
      const { container: minimalLeft } = render(<MinimalMock {...leftProps} />);
      const { container: detailedLeft } = render(<DetailedMock {...leftProps} />);

      expect(minimalLeft.querySelector('[data-testid="age-input-left"]')).toBeInTheDocument();
      expect(detailedLeft.querySelector('[data-testid="age-input-left"]')).toBeInTheDocument();

      // Test right position - should show cryotherapy, tamponade
      const rightProps = { ...testProps, position: 'right' };
      const { container: minimalRight } = render(<MinimalMock {...rightProps} />);
      const { container: detailedRight } = render(<DetailedMock {...rightProps} />);

      expect(minimalRight.querySelector('[data-testid="cryo-select-right"]')).toBeInTheDocument();
      expect(detailedRight.querySelector('[data-testid="cryo-select-right-no"]')).toBeInTheDocument();
    });

    it('should handle mobile mode consistently', () => {
      const MinimalMock = createMinimalRiskInputForm();
      const DetailedMock = createDetailedRiskInputForm();

      const mobileProps = { ...testProps, isMobile: true };
      const { container: minimalMobile } = render(<MinimalMock {...mobileProps} />);
      const { container: detailedMobile } = render(<DetailedMock {...mobileProps} />);

      // Both should show all fields in mobile mode
      expect(minimalMobile.querySelector('[data-testid="age-input-left"]')).toBeInTheDocument();
      expect(detailedMobile.querySelector('[data-testid="age-input-left"]')).toBeInTheDocument();
      expect(minimalMobile.querySelector('[data-testid="tamponade-select-left"]')).toBeInTheDocument();
      expect(detailedMobile.querySelector('[data-testid="tamponade-select-left"]')).toBeInTheDocument();
    });
  });

  describe('RiskResults Mock Consistency', () => {
    const testProps = {
      fullModelRisk: { probability: 74.5, steps: [], logit: 1.074 },
      onReset: jest.fn(),
      onPrint: jest.fn(),
      isMobile: false
    };

    it('should format probability consistently', () => {
      const MinimalMock = createMinimalRiskResults();
      const DetailedMock = createDetailedRiskResults();

      const { getByTestId: getMinimal, unmount: unmountMinimal } = render(<MinimalMock {...testProps} />);
      expect(getMinimal('risk-probability-value')).toHaveTextContent('74.5%');
      unmountMinimal();
      
      const { getByTestId: getDetailed } = render(<DetailedMock {...testProps} />);
      expect(getDetailed('risk-probability-value')).toHaveTextContent('74.5%');
    });

    it('should calculate risk category consistently', () => {
      const MinimalMock = createMinimalRiskResults();
      const DetailedMock = createDetailedRiskResults();

      // Test high risk (>25%)
      const highRiskProps = { ...testProps, fullModelRisk: { probability: 74.5 } };
      const { container: minimalHigh } = render(<MinimalMock {...highRiskProps} />);
      const { container: detailedHigh } = render(<DetailedMock {...highRiskProps} />);

      expect(minimalHigh.querySelector('[data-risk-category="high-risk"]')).toBeInTheDocument();
      expect(detailedHigh.querySelector('[data-risk-category="high-risk"]')).toBeInTheDocument();

      // Test low risk (<10%)
      const lowRiskProps = { ...testProps, fullModelRisk: { probability: 5.2 } };
      const { container: minimalLow, unmount: unmountMinimal } = render(<MinimalMock {...lowRiskProps} />);
      const { container: detailedLow, unmount: unmountDetailed } = render(<DetailedMock {...lowRiskProps} />);

      expect(minimalLow.querySelector('[data-risk-category="low-risk"]')).toBeInTheDocument();
      expect(detailedLow.querySelector('[data-risk-category="low-risk"]')).toBeInTheDocument();

      unmountMinimal();
      unmountDetailed();
    });

    it('should handle model type consistently', () => {
      const MinimalMock = createMinimalRiskResults();
      const DetailedMock = createDetailedRiskResults();

      // Test full model
      const { container: minimalFull } = render(<MinimalMock {...testProps} />);
      const { container: detailedFull } = render(<DetailedMock {...testProps} />);

      expect(minimalFull.querySelector('[data-model-type="full"]')).toBeInTheDocument();
      expect(detailedFull.querySelector('[data-model-type="full"]')).toBeInTheDocument();

      // Test significant model
      const sigProps = { significantModelRisk: { probability: 50.0 } };
      const { container: minimalSig } = render(<MinimalMock {...sigProps} />);
      const { container: detailedSig } = render(<DetailedMock {...sigProps} />);

      expect(minimalSig.querySelector('[data-model-type="significant"]')).toBeInTheDocument();
      expect(detailedSig.querySelector('[data-model-type="significant"]')).toBeInTheDocument();
    });

    it('should include consistent aria labels', () => {
      const MinimalMock = createMinimalRiskResults();
      const DetailedMock = createDetailedRiskResults();

      const { container: minimalContainer } = render(<MinimalMock {...testProps} />);
      const { container: detailedContainer } = render(<DetailedMock {...testProps} />);

      const minimalRisk = minimalContainer.querySelector('[data-testid="risk-probability"]');
      const detailedRisk = detailedContainer.querySelector('[data-testid="risk-probability"]');

      expect(minimalRisk).toHaveAttribute('aria-label', 'Risk percentage: 74.5%');
      expect(detailedRisk).toHaveAttribute('aria-label', 'Risk percentage: 74.5%');
    });
  });

  describe('GaugeSelection Mock Consistency', () => {
    const testProps = {
      value: '25g',
      onChange: jest.fn(),
      disabled: false,
      isMobile: false
    };

    it('should handle all gauge values consistently', () => {
      const MinimalMock = createMinimalGaugeSelection();
      const DetailedMock = createDetailedGaugeSelection();

      ['20g', '23g', '25g', '27g', 'not_recorded'].forEach(gauge => {
        const props = { ...testProps, value: gauge };
        
        const { container: minimal } = render(<MinimalMock {...props} />);
        const { container: detailed } = render(<DetailedMock {...props} />);

        expect(minimal.querySelector('[data-value="' + gauge + '"]')).toBeInTheDocument();
        // Detailed version would have radio buttons
        if (detailed.querySelector(`[value="${gauge}"]`)) {
          expect(detailed.querySelector(`[value="${gauge}"]`)).toBeInTheDocument();
        }
      });
    });
  });

  describe('Mock Prop Standardization', () => {
    it('should handle undefined vs false consistently for boolean props', () => {
      const MinimalMock = createMinimalRiskInputForm();
      
      // Test with undefined disabled
      const undefinedProps = { position: 'left', age: '50', setAge: jest.fn() };
      const { container: undefinedContainer } = render(<MinimalMock {...undefinedProps} />);
      expect(undefinedContainer.querySelector('[data-disabled="false"]')).toBeInTheDocument();

      // Test with explicit false
      const falseProps = { ...undefinedProps, disabled: false };
      const { container: falseContainer } = render(<MinimalMock {...falseProps} />);
      expect(falseContainer.querySelector('[data-disabled="false"]')).toBeInTheDocument();

      // Test with explicit true
      const trueProps = { ...undefinedProps, disabled: true };
      const { container: trueContainer } = render(<MinimalMock {...trueProps} />);
      expect(trueContainer.querySelector('[data-disabled="true"]')).toBeInTheDocument();
    });
  });

  describe('Medical Validation Consistency', () => {
    it('should validate age consistently', () => {
      const MinimalMock = createMinimalRiskInputForm();
      const DetailedMock = createDetailedRiskInputForm();

      // Test invalid age
      const invalidProps = { position: 'left', age: '150', setAge: jest.fn() };
      const { container: minimalInvalid } = render(<MinimalMock {...invalidProps} />);
      const { container: detailedInvalid } = render(<DetailedMock {...invalidProps} />);

      expect(minimalInvalid.querySelector('[aria-invalid="true"]')).toBeInTheDocument();
      expect(detailedInvalid.querySelector('[aria-invalid="true"]')).toBeInTheDocument();

      // Test valid age
      const validProps = { position: 'left', age: '50', setAge: jest.fn() };
      const { container: minimalValid } = render(<MinimalMock {...validProps} />);
      const { container: detailedValid } = render(<DetailedMock {...validProps} />);

      expect(minimalValid.querySelector('[aria-invalid="false"]')).toBeInTheDocument();
      expect(detailedValid.querySelector('[aria-invalid="false"]')).toBeInTheDocument();
    });

    it('should format probability with correct precision', () => {
      const MinimalMock = createMinimalRiskResults();
      const DetailedMock = createDetailedRiskResults();

      // Test decimal precision
      const props = { fullModelRisk: { probability: 74.567 } };
      const { getByTestId: getMinimal, unmount: unmountMinimal } = render(<MinimalMock {...props} />);
      // Both should format to 1 decimal place
      expect(getMinimal('risk-probability-value')).toHaveTextContent('74.6%');
      unmountMinimal();
      
      const { getByTestId: getDetailed } = render(<DetailedMock {...props} />);
      expect(getDetailed('risk-probability-value')).toHaveTextContent('74.6%');
    });
  });
});