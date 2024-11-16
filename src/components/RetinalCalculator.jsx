import React from 'react';
import MobileRetinalCalculator from './MobileRetinalCalculator';
import DesktopRetinalCalculator from './DesktopRetinalCalculator';

const RetinalCalculator = () => {
    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">Retinal Detachment Risk Calculator</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Based on the <a href="https://www.beavrs.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">UK BEAVRS</a> database <a href="https://www.nature.com/articles/s41433-023-02388-0 " target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">study</a> of retinal detachment outcomes (Yorston et al, 2023)
                    </p>

                    {/* Mobile version */}
                    <div className="md:hidden">
                        <MobileRetinalCalculator />
                    </div>

                    {/* Desktop version */}
                    <div className="hidden md:block">
                        <DesktopRetinalCalculator />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetinalCalculator;
