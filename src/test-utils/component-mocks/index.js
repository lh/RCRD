/**
 * Central export for all component mocks
 * This file provides easy access to all mock implementations
 */

// Import all mock modules
import MockGaugeSelection, { 
  createMinimalMock as createMinimalGaugeMock, 
  createDetailedMock as createDetailedGaugeMock 
} from './GaugeSelection.mock';

import MockTamponadeSelection, { 
  createMinimalMock as createMinimalTamponadeMock, 
  createDetailedMock as createDetailedTamponadeMock 
} from './TamponadeSelection.mock';

import MockCryotherapySelection, { 
  createMinimalMock as createMinimalCryoMock, 
  createDetailedMock as createDetailedCryoMock 
} from './CryotherapySelection.mock';

import MockClockFace, {
  createMinimalMock as createMinimalClockMock,
  createDetailedMock as createDetailedClockMock
} from './ClockFace.mock';

import MockRiskResults, {
  createMinimalMock as createMinimalRiskResultsMock,
  createDetailedMock as createDetailedRiskResultsMock
} from './RiskResults.mock';

import MockRiskInputForm, {
  createMinimalMock as createMinimalRiskInputFormMock,
  createDetailedMock as createDetailedRiskInputFormMock
} from './RiskInputForm.mock';

// Export default mocks (minimal by default)
export {
  MockGaugeSelection,
  MockTamponadeSelection,
  MockCryotherapySelection,
  MockClockFace,
  MockRiskResults,
  MockRiskInputForm
};

// Export mock creators for flexibility
export const createMocks = {
  gauge: {
    minimal: createMinimalGaugeMock,
    detailed: createDetailedGaugeMock
  },
  tamponade: {
    minimal: createMinimalTamponadeMock,
    detailed: createDetailedTamponadeMock
  },
  cryotherapy: {
    minimal: createMinimalCryoMock,
    detailed: createDetailedCryoMock
  },
  clockFace: {
    minimal: createMinimalClockMock,
    detailed: createDetailedClockMock
  },
  riskResults: {
    minimal: createMinimalRiskResultsMock,
    detailed: createDetailedRiskResultsMock
  },
  riskInputForm: {
    minimal: createMinimalRiskInputFormMock,
    detailed: createDetailedRiskInputFormMock
  }
};

// Helper to get all minimal mocks
export const getMinimalMocks = () => ({
  GaugeSelection: createMinimalGaugeMock(),
  TamponadeSelection: createMinimalTamponadeMock(),
  CryotherapySelection: createMinimalCryoMock(),
  ClockFace: createMinimalClockMock(),
  RiskResults: createMinimalRiskResultsMock(),
  RiskInputForm: createMinimalRiskInputFormMock()
});

// Helper to get all detailed mocks
export const getDetailedMocks = () => ({
  GaugeSelection: createDetailedGaugeMock(),
  TamponadeSelection: createDetailedTamponadeMock(),
  CryotherapySelection: createDetailedCryoMock(),
  ClockFace: createDetailedClockMock(),
  RiskResults: createDetailedRiskResultsMock(),
  RiskInputForm: createDetailedRiskInputFormMock()
});

// Default export for convenience
export default {
  MockGaugeSelection,
  MockTamponadeSelection,
  MockCryotherapySelection,
  createMocks,
  getMinimalMocks,
  getDetailedMocks
};