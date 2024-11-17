import React from 'react';
import { DIMENSIONS } from './styles/clockStyles.js';

const ResetButton = ({ onReset, isMobile, readOnly }) => {
  if (!isMobile || readOnly) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onReset(e);
  };

  const handleTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onReset(e);
  };

  return (
    <g 
      className="pointer-events-auto"
      style={{ isolation: 'isolate' }}
      onClick={handleClick}
      onTouchStart={handleTouch}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <circle
        cx="0"
        cy="0"
        r="25"
        fill="rgba(244, 114, 182, 0.5)"
        className="cursor-pointer hover:fill-pink-300 transition-colors"
      />
    </g>
  );
};

export default ResetButton;
