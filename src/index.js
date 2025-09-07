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

// Performance monitoring for production
if (process.env.NODE_ENV === 'production') {
  reportWebVitals((metric) => {
    // Log to console for now
    console.log(metric);
    
    // You can also send to analytics endpoint
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
} else {
  // In development, you might want to log metrics for debugging
  if (process.env.NODE_ENV === 'development') {
    reportWebVitals((metric) => {
      console.debug('Web Vitals (dev):', metric);
    });
  }
}
