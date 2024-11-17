import React from 'react';

const PrintHeader = () => {
    const timestamp = new Date().toLocaleString();
    return (
        <div className="print-header hidden">
            <h1 className="text-2xl font-bold">Retinal Detachment Risk Calculator Results</h1>
            <p className="text-sm mt-2">Generated: {timestamp}</p>
        </div>
    );
};

export default PrintHeader;
