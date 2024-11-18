import { CLOCK } from './utils/clockConstants.js';

// Utility functions
export const polarToCartesian = (angle, r) => {
  const radian = (angle - 90) * (Math.PI / 180);
  return {
    x: r * Math.cos(radian),
    y: r * Math.sin(radian)
  };
};

export const cartesianToPolar = (x, y) => {
  const angle = Math.atan2(y, x) * (180 / Math.PI);
  return (90 - angle + 360) % 360;
};

export const degreeToSegment = (degree) => {
  return Math.floor(degree / CLOCK.DEGREES_PER_SEGMENT) % CLOCK.SEGMENTS;
};

export const segmentToDegree = (segment) => {
  return (segment * CLOCK.DEGREES_PER_SEGMENT) % 360;
};

export const getSegmentsBetween = (start, end, isCounterClockwise) => {
  const segments = [];
  const maxIterations = CLOCK.SEGMENTS; // Safety limit
  let iterations = 0;
  
  if (isCounterClockwise) {
    let i = start;
    while (i !== end && iterations < maxIterations) {
      segments.push(i);
      i = ((i - 1) + CLOCK.SEGMENTS) % CLOCK.SEGMENTS;
      iterations++;
    }
  } else {
    let i = start;
    while (i !== end && iterations < maxIterations) {
      segments.push(i);
      i = (i + 1) % CLOCK.SEGMENTS;
      iterations++;
    }
  }
  segments.push(end); // Add the end segment
  return segments;
};

export const createTearPath = (x, y, angle) => {
  const tearPath = `
      M -4 -8
      c -0.091 -0.936 0.333 -1.232 0.777 0.658
      c 0.389 1.655 1.060 3.281 1.060 3.281
      s 0 0.254 1.022 0.617
      c 0.793 0.282 2.183 -2.882 2.183 -2.882
      s 1.953 -4.433 1.437 -1.294
      c -1.217 7.410 -1.640 6.716 -1.664 6.897
      c -0.024 0.181 -0.510 0.596 -0.510 0.596
      s -0.178 0.183 -0.585 0.327
      c -3.121 1.110 -3.163 -3.001 -3.163 -3.001
      L -4 -8
  `;
  return {
    d: tearPath,
    transform: `translate(${x}, ${y}) scale(1.5) rotate(${angle})`
  };
};

export const getPosition = (hour, radius) => {
  const angle = hour * 30;
  const point = polarToCartesian(angle, radius);
  return {
    ...point,
    angle
  };
};

// Style constants
export const styles = {
  transition: 'fill 0.2s ease, stroke 0.2s ease',
  tear: {
    default: {
      fill: '#dc2626',
      stroke: '#dc2626',
      strokeWidth: '0.5'
    },
    hover: {
      fill: '#b91c1c',
      stroke: '#b91c1c',
      strokeWidth: '0.5'
    }
  },
  circle: {
    default: {
      fill: 'white',
      stroke: '#d1d5db',
      strokeWidth: '1.5'
    },
    hover: {
      fill: '#fee2e2',
      stroke: '#d1d5db',
      strokeWidth: '1.5'
    }
  }
};

export const getStyles = (hour, hoveredHour, isSelected, readOnly) => {
  const isHovered = hoveredHour === hour;
  if (isSelected) {
    return {
      ...styles.tear.default,
      ...(isHovered && !readOnly ? styles.tear.hover : {}),
      transition: styles.transition
    };
  }
  return {
    ...styles.circle.default,
    ...(isHovered && !readOnly ? styles.circle.hover : {}),
    transition: styles.transition
  };
};
