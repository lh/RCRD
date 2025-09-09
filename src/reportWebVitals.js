const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Cumulative Layout Shift - measures visual stability
      onCLS(onPerfEntry);
      
      // First Input Delay - measures interactivity  
      onFID(onPerfEntry);
      
      // First Contentful Paint - measures loading performance
      onFCP(onPerfEntry);
      
      // Largest Contentful Paint - measures loading performance
      onLCP(onPerfEntry);
      
      // Time to First Byte - measures server response time
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
