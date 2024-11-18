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
};

export const renderDesktop = (props = {}) => {
  const mergedProps = {
    ...mockProps,
    position: 'left',
    ...props,
  };

  return render(<RiskInputForm {...mergedProps} />);
};

export const renderMobile = (props = {}) => {
  const mergedProps = {
    ...mockProps,
    isMobile: true,
    ...props,
  };

  return render(<RiskInputForm {...mergedProps} />);
};

export const resetMocks = () => {
  mockProps.setAge.mockReset();
  mockProps.setPvrGrade.mockReset();
  mockProps.setVitrectomyGauge.mockReset();
};
