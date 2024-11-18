import React from 'react';
import MobileRetinalCalculator from './MobileRetinalCalculator';
import DesktopRetinalCalculator from './DesktopRetinalCalculator';
import { MODEL_TYPE } from '../constants/modelTypes';
import hsmaLogo from '../assets/HSMA.PNG';

const RetinalCalculator = () => {
    return (
        <div className="md:p-4 p-0">
            <div className="bg-white md:rounded-lg shadow-lg">
                <div className="md:p-6 px-1 py-2">
                    <h2 className="text-2xl font-bold mb-2">Risk Calculator Retinal Detachment (RCRD)</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Based on the{' '}
                        <a 
                            href="https://bjo.bmj.com/content/106/1/120" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="external-link"
                            aria-label="UK BEAVRS database study (opens in new tab)"
                            title="View the UK BEAVRS database study in a new tab"
                        >
                            UK BEAVRS database study
                        </a>
                    </p>

                    {/* Mobile version */}
                    <div className="md:hidden">
                        <MobileRetinalCalculator modelType={MODEL_TYPE.FULL} />
                    </div>

                    {/* Desktop version */}
                    <div className="hidden md:block">
                        <DesktopRetinalCalculator modelType={MODEL_TYPE.FULL} />
                    </div>

                    {/* Attribution and HSMA Logo */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                            <div className="text-xs md:text-sm text-gray-600 text-center md:text-right leading-tight">
                                <a 
                                    href="https://github.com/lh/redetachment-risk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    Luke Herbert
                                </a>
                                <br className="md:hidden" />
                                <span className="mx-1">inspired by</span>
                            </div>
                            <a 
                                href="https://arc-swp.nihr.ac.uk/training-type/health-service-modelling-associates-programme-hsma/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block opacity-80 hover:opacity-100 transition-opacity"
                                aria-label="Visit HSMA Programme (opens in new tab)"
                                title="Visit the Health Service Modelling Associates Programme"
                            >
                                <img 
                                    src={hsmaLogo}
                                    alt="HSMA Logo" 
                                    className="h-10 w-auto hsma-logo"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetinalCalculator;
