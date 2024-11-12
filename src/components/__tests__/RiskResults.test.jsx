import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskResults from '../RiskResults';

describe('RiskResults', () => {
  const mockRisk = {
    probability: '25.5',
    logit: '-1.082',
    steps: [
      { label: 'Constant', value: '-1.611' },
      { label: 'Age group', value: '0.236', detail: '(65 to 79)' },
      { label: 'Break location', value: '0.428', detail: '(4 or 8 o\'clock)' },
      { label: 'Inferior detachment', value: '0.441', detail: '(3 to 5 o\'clock)' },
      { label: 'PVR grade', value: '0.000', detail: '(grade None/A/B)' },
      { label: 'Vitrectomy gauge', value: '-0.408', detail: '(23g, odds ratio 0.665)' }
    ]
  };

  const mockProps = {
    risk: mockRisk,
    showMath: false,
    setShowMath: jest.fn()
  };

  test('displays risk probability', () => {
    render(<RiskResults {...mockProps} />);
    
    expect(screen.getByText(/estimated risk of failure: 25.5%/i)).toBeInTheDocument();
  });

  test('toggles calculation steps visibility when button clicked', () => {
    render(<RiskResults {...mockProps} />);
    
    const toggleButton = screen.getByRole('button', { name: /show calculation steps/i });
    expect(screen.queryByText(/constant:/i)).not.toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(mockProps.setShowMath).toHaveBeenCalledWith(true);
  });

  test('displays calculation steps when showMath is true', () => {
    render(<RiskResults {...mockProps} showMath={true} />);
    
    mockRisk.steps.forEach(step => {
      expect(screen.getByText(new RegExp(step.label + ':', 'i'))).toBeInTheDocument();
      expect(screen.getByText(step.value)).toBeInTheDocument();
      if (step.detail) {
        expect(screen.getByText(step.detail)).toBeInTheDocument();
      }
    });
  });

  test('displays total logit when steps are shown', () => {
    render(<RiskResults {...mockProps} showMath={true} />);
    
    expect(screen.getByText(/total logit:/i)).toBeInTheDocument();
    expect(screen.getByText(mockRisk.logit)).toBeInTheDocument();
  });

  test('displays probability formula when steps are shown', () => {
    render(<RiskResults {...mockProps} showMath={true} />);
    
    expect(screen.getByText(/probability = 1 \/ \(1 \+ e/i)).toBeInTheDocument();
    expect(screen.getByText(/= 25.5%/i)).toBeInTheDocument();
  });

  test('shows up chevron when math is displayed', () => {
    render(<RiskResults {...mockProps} showMath={true} />);
    
    const chevronUp = screen.getByRole('button').querySelector('svg');
    expect(chevronUp).toBeInTheDocument();
  });

  test('shows down chevron when math is hidden', () => {
    render(<RiskResults {...mockProps} showMath={false} />);
    
    const chevronDown = screen.getByRole('button').querySelector('svg');
    expect(chevronDown).toBeInTheDocument();
  });

  test('handles empty steps array', () => {
    const emptyRisk = {
      ...mockRisk,
      steps: []
    };
    
    render(<RiskResults {...mockProps} risk={emptyRisk} showMath={true} />);
    
    expect(screen.getByText(/total logit:/i)).toBeInTheDocument();
    expect(screen.getByText(/probability = 1 \/ \(1 \+ e/i)).toBeInTheDocument();
  });

  test('handles missing detail in steps', () => {
    const riskWithoutDetails = {
      ...mockRisk,
      steps: [{ label: 'Test Step', value: '1.000' }]
    };
    
    render(<RiskResults {...mockProps} risk={riskWithoutDetails} showMath={true} />);
    
    expect(screen.getByText(/test step:/i)).toBeInTheDocument();
    expect(screen.getByText('1.000')).toBeInTheDocument();
  });
});
