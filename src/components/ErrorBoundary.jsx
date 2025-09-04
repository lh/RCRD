import React from 'react';

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents entire application crash when calculation or rendering errors occur
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error: error
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        
        // Update state with error details
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // Could also log to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="error-boundary-fallback p-6 m-4 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-xl font-bold text-red-800 mb-2">
                        Something went wrong
                    </h2>
                    
                    <p className="text-red-700 mb-4">
                        The calculator encountered an unexpected error. This might be due to invalid input data or a calculation issue.
                    </p>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mb-4">
                            <summary className="cursor-pointer text-red-600 hover:text-red-800">
                                Error Details (Development Only)
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={this.handleReset}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            aria-label="Try again"
                        >
                            Try Again
                        </button>
                        
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            aria-label="Refresh page"
                        >
                            Refresh Page
                        </button>
                    </div>

                    {this.state.errorCount > 2 && (
                        <p className="mt-4 text-sm text-red-600">
                            Multiple errors detected. If this persists, please refresh the page or contact support.
                        </p>
                    )}
                </div>
            );
        }

        // Normal render
        return this.props.children;
    }
}

export default ErrorBoundary;