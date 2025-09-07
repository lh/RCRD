import React from 'react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import RetinalCalculator from './components/RetinalCalculator.jsx';

// TODO: Implement code splitting at app level after test infrastructure update
// This would reduce initial bundle size and improve Time to Interactive
// const RetinalCalculator = lazy(() => import('./components/RetinalCalculator.jsx'));

function App() {
  return (
    <div className="App px-2 md:px-8 min-h-screen">
      <ErrorBoundary>
        <RetinalCalculator />
      </ErrorBoundary>
    </div>
  );
}

export default App;
