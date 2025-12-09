// src/components/atoms/Button.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline-white' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant: ButtonVariant;
}

const getClasses = (variant: ButtonVariant): string => {
  const base = 'py-2 px-4 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  if (variant === 'primary') return `${base} bg-blue-600 text-white hover:bg-blue-700 shadow-md`;
  if (variant === 'secondary') return `${base} bg-gray-200 text-gray-800 hover:bg-gray-300`;
  if (variant === 'ghost') return `${base} bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100`;
  if (variant === 'outline-white') return `${base} border border-white text-white hover:bg-white/10`;

  return base;
};

export const Button: React.FC<ButtonProps> = ({ children, variant, className = '', ...props }) => {
  return (
    <button className={`${getClasses(variant)} ${className}`} {...props}>
      {children}
    </button>
  );
};