import RetinalCalculator from './components/RetinalCalculator.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

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
