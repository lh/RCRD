const Segment = ({ angle, isSelected, onClick }) => {
  // Wider segments for 24-segment system (2.5x wider than before)
  return (
    <div
      className={`absolute w-2.5 h-8 origin-bottom transform -translate-x-1/2 cursor-pointer transition-colors hover:opacity-80 ${
        isSelected ? 'bg-blue-500' : 'bg-gray-300'
      }`}
      style={{
        transform: `rotate(${angle}deg)`,
        // Add a slightly larger hit area for better interaction
        padding: '0 2px'
      }}
      onClick={onClick}
    />
  );
};

export default Segment;
