import React, { Suspense } from 'react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3`}></div>
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>{message}</span>
      </div>
    </div>
  );
};

const ErrorFallback: React.FC<{ 
  message?: string; 
  onRetry?: () => void; 
}> = ({ 
  message = 'Failed to load component', 
  onRetry 
}) => (
  <div className="flex items-center justify-center p-8 min-h-[200px]">
    <div className="text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="text-red-600 text-xl">⚠️</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner />,
  errorFallback
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error loading component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback 
          message={this.state.error?.message}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

export { LazyLoadWrapper, LoadingSpinner, ErrorFallback };
export default LazyLoadWrapper;