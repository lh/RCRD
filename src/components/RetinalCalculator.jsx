import React from 'react';
import MobileRetinalCalculator from './MobileRetinalCalculator';
import DesktopRetinalCalculator from './DesktopRetinalCalculator';
import { MODEL_TYPE } from '../constants/modelTypes';
import hsmaLogo from '../assets/HSMA.PNG';

const RetinalCalculator = () => {
    return (
        <div className="md:p-4 p-0">
            <div className="bg-white md:rounded-lg shadow-lg">
                <div className="px-1 py-2 md:p-6">
                    <h2 className="text-2xl font-bold mb-2">Retinal Detachment Risk Calculator</h2>
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

                    {/* HSMA Logo and Link */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
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
    );
};

export default RetinalCalculator;
