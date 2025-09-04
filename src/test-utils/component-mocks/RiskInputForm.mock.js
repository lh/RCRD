import React from 'react';
import { 
  validators, 
  propConfigs, 
  testIdPatterns,
  standardizePropHandling 
} from './mock-behaviors';

/**
 * Mock for RiskInputForm component
 * Provides both minimal and detailed versions for different testing needs
 * Both versions now use shared behaviors for consistency
 */

// Minimal mock for unit tests
export const createMinimalMock = () => {
  return jest.fn((props) => {
    const standardProps = standardizePropHandling(props);
    const {
      position,
      age,
      setAge,
      pvrGrade,
      setPvrGrade,
      vitrectomyGauge,
      setVitrectomyGauge,
      tamponade,
      setTamponade,
      cryotherapy,
      setCryotherapy,
      disabled,
      isMobile
    } = standardProps;

    // Use shared logic to determine which fields to show
    const visibleFields = propConfigs.RiskInputForm.getVisibleFields(position, isMobile);
    
    return (
      <div 
        data-testid={`risk-form-${position}`}
        data-disabled={disabled}
        data-mobile={isMobile}
      >
        Mock RiskInputForm - {position}
        {visibleFields.includes('age') && age !== undefined && (
          <input 
            type="number"
            value={age}
            onChange={(e) => setAge && setAge(e.target.value)}
            data-testid={testIdPatterns.ageInput(position)}
            disabled={disabled}
            aria-invalid={!validators.isAgeValid(age)}
          />
        )}
        {visibleFields.includes('pvrGrade') && pvrGrade !== undefined && (
          <select
            value={pvrGrade}
            onChange={(e) => setPvrGrade && setPvrGrade(e.target.value)}
            data-testid={testIdPatterns.pvrSelect(position)}
            disabled={disabled}
          >
            {propConfigs.RiskInputForm.fieldOptions.pvrGrade.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {visibleFields.includes('vitrectomyGauge') && vitrectomyGauge !== undefined && (
          <select
            value={vitrectomyGauge}
            onChange={(e) => setVitrectomyGauge && setVitrectomyGauge(e.target.value)}
            data-testid={testIdPatterns.gaugeSelect(position)}
            disabled={disabled}
          >
            {propConfigs.RiskInputForm.fieldOptions.vitrectomyGauge.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {visibleFields.includes('tamponade') && tamponade !== undefined && (
          <select
            value={tamponade}
            onChange={(e) => setTamponade && setTamponade(e.target.value)}
            data-testid={testIdPatterns.tamponadeSelect(position)}
            disabled={disabled}
          >
            {propConfigs.RiskInputForm.fieldOptions.tamponade.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {visibleFields.includes('cryotherapy') && cryotherapy !== undefined && (
          <select
            value={cryotherapy}
            onChange={(e) => setCryotherapy && setCryotherapy(e.target.value)}
            data-testid={testIdPatterns.cryoSelect(position)}
            disabled={disabled}
          >
            {propConfigs.RiskInputForm.fieldOptions.cryotherapy.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
    );
  });
};

// Detailed mock for integration tests
export const createDetailedMock = () => {
  return jest.fn((props) => {
    const standardProps = standardizePropHandling(props, {
      disabled: false,
      isMobile: false,
      errors: {}
    });
    
    const {
      position,
      age,
      setAge,
      pvrGrade,
      setPvrGrade,
      vitrectomyGauge,
      setVitrectomyGauge,
      tamponade,
      setTamponade,
      cryotherapy,
      setCryotherapy,
      disabled,
      isMobile,
      errors
    } = standardProps;

    // Use shared logic to determine which fields to show
    const visibleFields = propConfigs.RiskInputForm.getVisibleFields(position, isMobile);
    const fieldOptions = propConfigs.RiskInputForm.fieldOptions;

    return (
      <div 
        data-testid={`risk-form-${position}`}
        className={`risk-input-form ${isMobile ? 'mobile' : 'desktop'}`}
      >
        {/* Age Input */}
        {visibleFields.includes('age') && (
          <div className="form-group">
            <label htmlFor={testIdPatterns.ageInput(position)}>
              Age (years)
            </label>
            <input
              id={testIdPatterns.ageInput(position)}
              type="number"
              value={age}
              onChange={(e) => setAge && setAge(e.target.value)}
              min="18"
              max="100"
              disabled={disabled}
              className={!validators.isAgeValid(age) ? 'error' : ''}
              data-testid={testIdPatterns.ageInput(position)}
              aria-invalid={!validators.isAgeValid(age)}
            />
            {!validators.isAgeValid(age) && (
              <span className="error-message">
                Age must be between 18 and 100
              </span>
            )}
          </div>
        )}

        {/* PVR Grade */}
        {visibleFields.includes('pvrGrade') && (
          <div className="form-group">
            <label>PVR Grade</label>
            <div role="radiogroup" aria-required="true">
              {fieldOptions.pvrGrade.map(option => (
                <div key={option.value}>
                  <input
                    type="radio"
                    id={`pvr-${position}-${option.value}`}
                    name={`pvr-grade-${position}`}
                    value={option.value}
                    checked={pvrGrade === option.value}
                    onChange={(e) => setPvrGrade && setPvrGrade(e.target.value)}
                    disabled={disabled}
                    data-testid={`${testIdPatterns.pvrSelect(position)}-${option.value}`}
                  />
                  <label htmlFor={`pvr-${position}-${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vitrectomy Gauge */}
        {visibleFields.includes('vitrectomyGauge') && vitrectomyGauge !== undefined && (
          <div 
            className="form-group"
            data-testid="gauge-selection-container"
          >
            <label>Vitrectomy Gauge</label>
            <select
              value={vitrectomyGauge}
              onChange={(e) => setVitrectomyGauge && setVitrectomyGauge(e.target.value)}
              disabled={disabled}
              data-testid={testIdPatterns.gaugeSelect(position)}
            >
              {fieldOptions.vitrectomyGauge.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tamponade */}
        {visibleFields.includes('tamponade') && tamponade !== undefined && (
          <div 
            className="form-group"
            data-testid="tamponade-selection-container"
          >
            <label>Tamponade</label>
            <select
              value={tamponade}
              onChange={(e) => setTamponade && setTamponade(e.target.value)}
              disabled={disabled}
              data-testid={testIdPatterns.tamponadeSelect(position)}
            >
              {fieldOptions.tamponade.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Cryotherapy */}
        {visibleFields.includes('cryotherapy') && cryotherapy !== undefined && (
          <div 
            className="form-group"
            data-testid="cryotherapy-selection-container"
          >
            <label>Cryotherapy</label>
            <div role="radiogroup">
              {fieldOptions.cryotherapy.map(option => (
                <React.Fragment key={option.value}>
                  <input
                    type="radio"
                    id={`cryo-${position}-${option.value}`}
                    name={`cryotherapy-${position}`}
                    value={option.value}
                    checked={cryotherapy === option.value}
                    onChange={(e) => setCryotherapy && setCryotherapy(e.target.value)}
                    disabled={disabled}
                    data-testid={`${testIdPatterns.cryoSelect(position)}-${option.value}`}
                  />
                  <label htmlFor={`cryo-${position}-${option.value}`}>
                    {option.label}
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });
};

// Default export for jest.mock()
const MockRiskInputForm = createMinimalMock();
export default MockRiskInputForm;