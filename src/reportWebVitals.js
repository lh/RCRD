const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Cumulative Layout Shift - measures visual stability
      getCLS(onPerfEntry);
      
      // First Input Delay - measures interactivity
      getFID(onPerfEntry);
      
      // First Contentful Paint - measures loading performance
      getFCP(onPerfEntry);
      
      // Largest Contentful Paint - measures loading performance
      getLCP(onPerfEntry);
      
      // Time to First Byte - measures server response time
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
