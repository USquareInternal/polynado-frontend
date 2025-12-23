import React from 'react';

interface LoaderBarProps {
  visible: boolean;
  className?: string;
}

/**
 * Thin, animated loader bar for inline/top-of-section loading states.
 * Use when critical data is fetching so users see immediate feedback.
 */
export const LoaderBar: React.FC<LoaderBarProps> = ({ visible, className = '' }) => {
  if (!visible) return null;

  return (
    <div className={`relative w-full h-1 overflow-hidden rounded-full ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(245,163,102,0.8) 0%, rgba(232,138,51,0.8) 50%, rgba(245,163,102,0.8) 100%)',
          backgroundSize: '200% 100%',
          animation: 'loader-bar-slide 1.2s linear infinite',
        }}
      />
      <style>{`
        @keyframes loader-bar-slide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoaderBar;

