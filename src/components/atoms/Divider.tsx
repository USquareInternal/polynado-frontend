// src/components/atoms/Divider.tsx
import React from 'react';

interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return (
    <div className={`my-4 border-t border-gray-200 ${className}`} />
  );
};