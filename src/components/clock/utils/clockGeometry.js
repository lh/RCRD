// Utility functions for coordinate calculations and geometry
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

export const degreeToSegment = (degree, SEGMENTS) => {
  return Math.floor(degree / (360 / SEGMENTS)) % SEGMENTS;
};

export const segmentToDegree = (segment, SEGMENTS) => {
  return (segment * (360 / SEGMENTS)) % 360;
};

export const getPosition = (hour, radius) => {
  const angle = hour * 30;
  const point = polarToCartesian(angle, radius);
  return {
    ...point,
    angle
  };
};

export const getSegmentsBetween = (start, end, isCounterClockwise, SEGMENTS) => {
  const segments = [];
  const maxIterations = SEGMENTS; // Safety limit
  let iterations = 0;
  
  if (isCounterClockwise) {
    let i = start;
    while (i !== end && iterations < maxIterations) {
      segments.push(i);
      i = ((i - 1) + SEGMENTS) % SEGMENTS;
      iterations++;
    }
  } else {
    let i = start;
    while (i !== end && iterations < maxIterations) {
      segments.push(i);
      i = (i + 1) % SEGMENTS;
      iterations++;
    }
  }
  segments.push(end); // Add the end segment
  return segments;
};
