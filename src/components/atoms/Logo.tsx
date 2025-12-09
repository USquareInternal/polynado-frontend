// src/components/atoms/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  // New prop to handle the narrow desktop sidebar state
  isIconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  isIconOnly = false // Default is to show the full name
}) => {
  const baseClasses = 'font-extrabold text-gray-900 ';
  let sizeClasses = 'text-xl';

  if (size === 'sm') sizeClasses = 'text-lg';
  if (size === 'lg') sizeClasses = 'text-2xl';
  // Use a smaller size for the icon when needed
  if (isIconOnly) sizeClasses = 'text-2xl';

  return (
    <div className={`${baseClasses} ${sizeClasses} ${className}`}>
      {/* Conditional rendering based on the new prop */}
      {isIconOnly ? 'P' : 'Polynado'}
    </div>
  );
};