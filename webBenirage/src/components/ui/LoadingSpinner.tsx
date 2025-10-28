import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = 'rounded-full animate-spin transition-all duration-300';

  const variantClasses = {
    default: 'border-2 border-gray-300 border-t-transparent',
    primary: 'border-2 border-blue-900 border-t-transparent',
    secondary: 'border-2 border-yellow-500 border-t-transparent'
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10 sm:w-12 sm:h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      />
    </div>
  );
};

export default LoadingSpinner;