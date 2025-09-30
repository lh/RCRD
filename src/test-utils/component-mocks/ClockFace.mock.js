import React from 'react';

/**
 * Mock for ClockFace component
 * Provides both minimal and detailed versions for different testing needs
 */

// Minimal mock for unit tests
export const createMinimalMock = () => {
  return jest.fn(({ 
    onTearToggle, 
    onSegmentToggle, 
    onHoverChange,
    readOnly,
    selectedHours,
    detachmentSegments,
    setDetachmentSegments 
  }) => (
    <div 
      data-testid="clock-face"
      data-readonly={readOnly}
      data-selected-hours={selectedHours?.join(',')}
    >
      Mock ClockFace
      <button 
        onClick={() => {
          if (onSegmentToggle) onSegmentToggle(25);
          if (setDetachmentSegments) setDetachmentSegments([25]);
        }}
        data-testid="segment-toggle"
        disabled={readOnly}
      >
        Toggle Segment
      </button>
      {selectedHours && selectedHours.map(hour => (
        <button
          key={hour}
          onClick={() => onTearToggle && onTearToggle(hour)}
          data-testid={`tear-${hour}`}
        >
          Tear {hour}
        </button>
      ))}
    </div>
  ));
};

// Detailed mock for integration tests
export const createDetailedMock = () => {
  return jest.fn(({ 
    onTearToggle, 
    onSegmentToggle, 
    onHoverChange,
    readOnly,
    onTouchDeviceChange,
    selectedHours = [],
    detachmentSegments = [],
    setDetachmentSegments,
    hoveredHour
  }) => {
    // Create 12 hour markers for clock face
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return (
      <div 
        data-testid="clock-face"
        className="clock-face-container"
      >
        <svg 
          viewBox="0 0 400 400" 
          className="clock-svg"
          data-readonly={readOnly}
        >
          {/* Hour markers */}
          {hours.map(hour => (
            <g 
              key={hour}
              data-testid={`hour-${hour}`}
              style={{ cursor: readOnly ? 'default' : 'pointer' }}
            >
              <circle
                cx={200 + 150 * Math.cos((hour - 3) * 30 * Math.PI / 180)}
                cy={200 + 150 * Math.sin((hour - 3) * 30 * Math.PI / 180)}
                r="20"
                fill={selectedHours.includes(hour) ? '#3b82f6' : '#e5e7eb'}
                onClick={() => !readOnly && onTearToggle && onTearToggle(hour)}
                onMouseEnter={() => !readOnly && onHoverChange && onHoverChange(hour)}
                onMouseLeave={() => !readOnly && onHoverChange && onHoverChange(null)}
              />
              <text
                x={200 + 150 * Math.cos((hour - 3) * 30 * Math.PI / 180)}
                y={200 + 150 * Math.sin((hour - 3) * 30 * Math.PI / 180)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none"
              >
                {hour}
              </text>
            </g>
          ))}
          
          {/* Segments */}
          {detachmentSegments.map((segment, index) => (
            <path
              key={segment}
              data-testid={`segment-${index}`}
              d={`M 200 200 L ${200 + 100 * Math.cos(index * 6 * Math.PI / 180)} ${200 + 100 * Math.sin(index * 6 * Math.PI / 180)}`}
              stroke="#ef4444"
              strokeWidth="2"
              onClick={() => !readOnly && onSegmentToggle && onSegmentToggle(index)}
            />
          ))}
        </svg>
        
        {/* Touch device handler */}
        {onTouchDeviceChange && (
          <button
            onClick={() => onTouchDeviceChange(true)}
            data-testid="touch-device-toggle"
            style={{ display: 'none' }}
          >
            Touch Mode
          </button>
        )}
      </div>
    );
  });
};

// Default export for jest.mock()
const MockClockFace = createMinimalMock();
export default MockClockFace;