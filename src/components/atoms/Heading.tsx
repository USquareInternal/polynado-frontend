// src/components/atoms/Heading.tsx
import React from 'react';

interface HeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  // 🔑 Add the style prop here:
  style?: React.CSSProperties;
}

export const Heading: React.FC<HeadingProps> = ({ level, children, className = '' }) => {
  let baseClasses = 'font-extrabold text-gray-900 leading-tight ';

  switch (level) {
    case 1: // Hero Title
      baseClasses += 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
      break;
    case 2: // Section Titles (e.g., Top Market Movers)
      baseClasses += 'text-xl sm:text-2xl md:text-3xl';
      break;
    case 3: // Card Titles
      baseClasses += 'text-lg sm:text-xl font-semibold';
      break;
    case 4: // Small Titles (e.g., What's Trending?)
      baseClasses += 'text-base sm:text-lg font-bold';
      break;
  }

  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';

  return (
    <Tag className={`${baseClasses} ${className}`}>
      {children}
    </Tag>
  );
};