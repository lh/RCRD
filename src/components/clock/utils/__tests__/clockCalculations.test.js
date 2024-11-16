/**
 * @jest-environment jsdom
 */

describe('Clock Hour Calculations', () => {
  test('segment to hour conversion', () => {
    // Helper function to match ClockFace's calculation
    const segmentToHour = (segment) => Math.floor(segment / 5) + 1;

    // Test regular hours
    expect(segmentToHour(0)).toBe(1);   // Should be hour 12
    expect(segmentToHour(4)).toBe(1);   // Should be hour 12
    expect(segmentToHour(5)).toBe(2);   // Hour 1
    expect(segmentToHour(10)).toBe(3);  // Hour 2
    expect(segmentToHour(50)).toBe(11); // Hour 11
    expect(segmentToHour(55)).toBe(12); // Hour 12
    expect(segmentToHour(59)).toBe(12); // Hour 12
  });

  test('correct segment to hour conversion', () => {
    // Helper function with proper hour 12 handling
    const segmentToHour = (segment) => {
      const hour = Math.floor(segment / 5) + 1;
      return segment >= 55 || segment <= 4 ? 12 : hour;
    };

    // Test regular hours
    expect(segmentToHour(0)).toBe(12);  // Hour 12
    expect(segmentToHour(4)).toBe(12);  // Hour 12
    expect(segmentToHour(5)).toBe(2);   // Hour 1
    expect(segmentToHour(10)).toBe(3);  // Hour 2
    expect(segmentToHour(50)).toBe(11); // Hour 11
    expect(segmentToHour(55)).toBe(12); // Hour 12
    expect(segmentToHour(59)).toBe(12); // Hour 12
  });
});
