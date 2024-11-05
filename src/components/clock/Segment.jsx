const Segment = ({ angle, isSelected, onClick }) => {
  // Add at the start of the component
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

export default Segment;
