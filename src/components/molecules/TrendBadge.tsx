// src/components/molecules/TrendBadge.tsx (Conceptual modification)
import React from 'react';
import { twMerge } from 'tailwind-merge'; // Use twMerge to combine classes

interface TrendBadgeProps {
  label: string;
  variant: 'default' | 'primary' | 'secondary' | 'custom'; // Or whatever variants you have
  className?: string; // Must accept className
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ label, className, variant }) => {
  // Base classes for your TrendBadge (e.g., text, background); avoid forcing text size so consumers can fully control pill sizing.
  const baseClasses = 'rounded-full transition-colors duration-200';

  // Combine base styles, variant styles, and the passed className
  const finalClasses = twMerge(baseClasses, className);

  return (
    <div className={finalClasses}> {/* Apply combined classes here */}
      {label}
    </div>
  );
};