import React from 'react';
import { render, screen } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { MODEL_TYPE } from '../../constants/modelTypes';

// Mock the calculator components
jest.mock('../MobileRetinalCalculator', () => {
    return function MockMobileCalculator({ modelType }) {
        return <div data-testid="mobile-calculator" data-model={modelType}>Mobile View</div>;
    };
});

jest.mock('../DesktopRetinalCalculator', () => {
    return function MockDesktopCalculator({ modelType }) {
        return <div data-testid="desktop-calculator" data-model={modelType}>Desktop View</div>;
    };
});

describe('RetinalCalculator', () => {
    test('uses full model by default', () => {
        render(<RetinalCalculator />);

        // Both calculators should receive full model type
        const mobileCalculator = screen.getByTestId('mobile-calculator');
        const desktopCalculator = screen.getByTestId('desktop-calculator');
        expect(mobileCalculator).toHaveAttribute('data-model', MODEL_TYPE.FULL);
        expect(desktopCalculator).toHaveAttribute('data-model', MODEL_TYPE.FULL);
    });

    test('renders mobile view for small screens', () => {
        render(<RetinalCalculator />);
        const mobileView = screen.getByTestId('mobile-calculator');
        expect(mobileView).toHaveClass('md:hidden');
    });

    test('renders desktop view for large screens', () => {
        render(<RetinalCalculator />);
        const desktopView = screen.getByTestId('desktop-calculator').closest('.hidden.md\\:block');
        expect(desktopView).toBeInTheDocument();
    });

    test('renders header content', () => {
        render(<RetinalCalculator />);
        
        // Title should be present
        expect(screen.getByText('Retinal Detachment Risk Calculator')).toBeInTheDocument();
        
        // Links should be present
        expect(screen.getByText('UK BEAVRS')).toHaveAttribute('href', 'https://www.beavrs.org/');
        expect(screen.getByText('study')).toHaveAttribute('href', 'https://www.nature.com/articles/s41433-023-02388-0');
    });
});
