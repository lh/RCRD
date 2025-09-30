import React from 'react';
import PropTypes from 'prop-types';
import { DIMENSIONS } from './utils/clockDimensions.js';
import { polarToCartesian, segmentToDegree } from './utils/clockFaceGeometry.js';
import { CLOCK } from './utils/clockConstants.js';

const DetachmentSegments = ({
  currentDetachmentSegments = [],
  readOnly
}) => {
  return (
    <g className="pointer-events-auto" style={{ isolation: 'isolate' }}>
      {[...Array(CLOCK.SEGMENTS)].map((_, i) => {
        const segmentId = `segment${i}`;
        const isHighlighted = currentDetachmentSegments.includes(segmentId);
        const degreeStart = segmentToDegree(i, CLOCK.SEGMENTS);
        const degreeEnd = segmentToDegree(i + 1, CLOCK.SEGMENTS);
        const posStart = polarToCartesian(degreeStart, DIMENSIONS.innerRadius);
        const posOuterStart = polarToCartesian(degreeStart, DIMENSIONS.outerRadius);
        const posEnd = polarToCartesian(degreeEnd, DIMENSIONS.innerRadius);
        const posOuterEnd = polarToCartesian(degreeEnd, DIMENSIONS.outerRadius);

        return (
          <path
            key={`segment-${i}`}
            d={`M ${posStart.x} ${posStart.y} 
                L ${posOuterStart.x} ${posOuterStart.y} 
                A ${DIMENSIONS.outerRadius} ${DIMENSIONS.outerRadius} 0 0 1 ${posOuterEnd.x} ${posOuterEnd.y}
                L ${posEnd.x} ${posEnd.y}
                A ${DIMENSIONS.innerRadius} ${DIMENSIONS.innerRadius} 0 0 0 ${posStart.x} ${posStart.y}`}
            fill={isHighlighted ? "rgba(59, 130, 246, 0.5)" : "transparent"}
            className={`cursor-pointer hover:fill-blue-200 transition-colors ${readOnly ? '' : 'pointer-events-auto'}`}
            style={{ pointerEvents: readOnly ? 'none' : 'auto' }}
            title={isHighlighted ? 
              "Click and drag to remove detachment" : 
              "Click and drag to add detachment"}
          />
        );
      })}
    </g>
  );
};

DetachmentSegments.propTypes = {
    segments: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        isInteractive: PropTypes.bool
    })).isRequired,
    readOnly: PropTypes.bool
};

DetachmentSegments.defaultProps = {
    readOnly: false
};

export default DetachmentSegments;
