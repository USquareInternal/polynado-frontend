// src/components/molecules/StatCard.tsx
import React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-4 sm:p-5 bg-[#1E2022] border border-gray-500/50 rounded-lg w-full shadow-[0_0_8px_rgba(0,0,0,0.35)]">
      <div className="text-xl sm:text-2xl font-semibold text-orange-400">
        {value}
      </div>
      <p className="text-xs sm:text-sm text-gray-300 text-center whitespace-nowrap">
        {label}
      </p>
    </div>
  );
};