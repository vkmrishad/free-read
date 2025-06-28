import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading article...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;