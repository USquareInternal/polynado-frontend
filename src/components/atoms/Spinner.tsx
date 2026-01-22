import React from 'react';

interface SpinnerProps {
  visible: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Spinner loader component for loading states throughout the app.
 * Shows an animated spinner when visible is true.
 * When fullScreen is true, creates an overlay that blocks all user interactions.
 */
export const Spinner: React.FC<SpinnerProps> = ({ visible, className = '', size = 'md', fullScreen = false }) => {
  if (!visible) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin`}
      style={{
        borderColor: 'transparent',
        borderTopColor: '#F5A366',
        borderRightColor: '#F5A366',
      }}
    />
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        style={{ pointerEvents: 'all' }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {spinner}
    </div>
  );
};

export default Spinner;

