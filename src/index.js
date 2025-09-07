import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './print.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  reportWebVitals((metric) => {
    // In production, send to analytics endpoint instead of console
    // Example for Google Analytics:
    // window.gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_category: 'Web Vitals',
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
    
    // Or send to custom analytics endpoint:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // });
  });
} else if (process.env.NODE_ENV === 'development') {
  // Only log metrics in development for debugging
  reportWebVitals((metric) => {
    console.debug('Web Vitals (dev):', metric);
  });
}
