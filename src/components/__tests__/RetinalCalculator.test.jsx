import React from 'react';
import { render, screen } from '@testing-library/react';
import RetinalCalculator from '../RetinalCalculator';
import { MODEL_TYPE } from '../../constants/modelTypes';
import { TEST_DEFAULTS, TEST_SCENARIOS } from '../../test-utils/constants';

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
        const mobileView = screen.getByTestId('mobile-calculator').closest('.md\\:hidden');
        expect(mobileView).toBeInTheDocument();
    });

    test('renders desktop view for large screens', () => {
        render(<RetinalCalculator />);
        const desktopView = screen.getByTestId('desktop-calculator').closest('.hidden.md\\:block');
        expect(desktopView).toBeInTheDocument();
    });

    test('renders header content', () => {
        render(<RetinalCalculator />);
        
        // Title should be present
        expect(screen.getByText('Risk Calculator Retinal Detachment (RCRD)')).toBeInTheDocument();
        
        // BEAVRS link should be present with correct URL and attributes
        const beavrsLink = screen.getByText('UK BEAVRS database study');
        expect(beavrsLink).toHaveAttribute('href', 'https://bjo.bmj.com/content/106/1/120');
        expect(beavrsLink).toHaveAttribute('target', '_blank');
        expect(beavrsLink).toHaveAttribute('rel', 'noopener noreferrer');
        
        // Attribution should be present
        expect(screen.getByText('Luke Herbert')).toBeInTheDocument();
        expect(screen.getByText('inspired by')).toBeInTheDocument();
        expect(screen.getByAltText('HSMA Logo')).toBeInTheDocument();
    });

    // Note: Form interaction tests moved to mobile/desktop calculator test files
    // since the form elements are rendered inside those components
});
