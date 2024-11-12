import React from 'react';
import { render } from '@testing-library/react';
import RiskInputForm from '../RiskInputForm';

export const mockProps = {
  age: '',
  setAge: jest.fn(),
  pvrGrade: '',
  setPvrGrade: jest.fn(),
  vitrectomyGauge: '',
  setVitrectomyGauge: jest.fn(),
  position: 'left'
};

export const renderDesktop = (props = {}) => 
  render(<RiskInputForm {...mockProps} {...props} isMobile={false} />);

export const renderMobile = (props = {}) =>
  render(<RiskInputForm {...mockProps} {...props} isMobile={true} />);

// Reset all mocks between tests
export const resetMocks = () => {
  mockProps.setAge.mockReset();
  mockProps.setPvrGrade.mockReset();
  mockProps.setVitrectomyGauge.mockReset();
};
