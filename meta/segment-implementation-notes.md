# Segment Component Implementation Notes

## Overview
The Segment component is a presentational component that renders a single clock segment with rotation and selection state.

## Component Structure

```jsx
const Segment = ({ angle, isSelected, onClick }) => {
  // Debug logging present in component
  console.log('Segment rendering at angle:', angle)
  
  return (
    <div
      className={`absolute w-1 h-8 origin-bottom transform -translate-x-1/2 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-500' : 'bg-gray-300'
      }`}
      style={{ transform: `rotate(${angle}deg)` }}
      onClick={onClick}
    />
  );
};
```

## Props

1. `angle` (number)
   - Controls segment rotation
   - Applied via CSS transform
   - Supports any numeric value (positive, negative, >360)

2. `isSelected` (boolean)
   - Controls segment color
   - true → blue (bg-blue-500)
   - false → gray (bg-gray-300)

3. `onClick` (function, optional)
   - Click event handler
   - Safe to omit (no errors if missing)

## Styling

### Base Classes (Always Applied)
- `absolute` - Positions segment relative to parent
- `w-1` - Width of 1 unit (thin line)
- `h-8` - Height of 8 units (segment length)
- `origin-bottom` - Rotation origin at bottom
- `transform` - Enables CSS transforms
- `-translate-x-1/2` - Centers segment horizontally
- `cursor-pointer` - Shows clickable cursor
- `transition-colors` - Smooth color transitions

### Dynamic Classes
- Selected: `bg-blue-500`
- Unselected: `bg-gray-300`

## Behavior

1. Rotation
   - Uses CSS transform: rotate(Xdeg)
   - Accepts any angle value
   - No normalization of angles (360° = 360°, not 0°)

2. Selection
   - Binary state (selected/unselected)
   - Visual feedback through color change
   - Smooth transition between states

3. Interaction
   - Clickable area is full segment
   - No built-in hover effects
   - Click handler is optional

## Known Issues

1. Debug Logging
   - Component includes console.log for angle values
   - Not removable due to source code modification restrictions
   - Consider browser console filtering in development

## Test Coverage

1. Rendering Tests
   - Rotation style application
   - Base class presence
   - Selection state classes
   - Style transitions

2. Interaction Tests
   - Click handler execution
   - Missing handler safety

3. Prop Validation
   - Zero angles
   - Negative angles
   - Large angles (>360°)

## Usage Notes

1. Positioning
   - Must be within relative/absolute parent
   - Centers itself horizontally
   - Rotates from bottom origin

2. Event Handling
   - Always attach onClick for interactive segments
   - Can be used without onClick for display-only

3. Performance
   - Lightweight component
   - CSS-based animations
   - No internal state

## Future Considerations

1. Potential Improvements
   - Remove debug logging
   - Add hover states
   - Add disabled state
   - Add custom colors
   - Add size prop

2. Accessibility
   - Could add ARIA roles
   - Could add keyboard interaction
   - Could improve focus states

3. Animation
   - Could add rotation animation
   - Could customize transition timing
   - Could add selection animation

4. Props
   - Could add size customization
   - Could add color customization
   - Could add disabled state
   - Could add custom styles

## Integration Notes

1. Parent Requirements
   - Must provide positioning context
   - Should handle click events
   - Should manage selection state

2. Common Patterns
   - Used in circular arrangements
   - Often in groups of 60 (clock face)
   - Selection often managed by parent

3. Best Practices
   - Always provide angle prop
   - Manage selection externally
   - Handle clicks at parent level
