import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  animated?: boolean;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  color = 'primary',
  animated = false,
  showPercentage = false,
  className = ''
}) => {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-yellow-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  const animatedClasses = animated ? 'transition-all duration-500 ease-out' : '';

  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${heightClasses[height]} ${colorClasses[color]} rounded-full ${animatedClasses}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-gray-700">
            {normalizedProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;