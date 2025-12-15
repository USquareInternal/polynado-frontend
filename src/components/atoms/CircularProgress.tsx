import React from 'react';


export const CircularProgress: React.FC<{
  percentage: number;
  color: string;
  label: string;
  payText: string;
  payoutText?: string;
  isYesSide: boolean;
}> = ({ percentage, color, label, payText, payoutText, isYesSide }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    // Individual border container
    <div className="relative w-36 h-36 flex flex-col items-center justify-center text-white p-2 rounded-xl border border-white/10 bg-[#1E2022]">

      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#333333"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Content inside the circle */}
      <div className="absolute flex flex-col items-center text-center">
        {/* Percentage */}
        <div className="text-xl font-bold text-white">
          {percentage}%
        </div>

        {/* Yes / No label (explicit) */}
        <div className="text-sm font-semibold mt-0.5" style={{ color }}>
          {isYesSide ? 'Yes' : 'No'}
        </div>

        {/* Pay Text (pay 1.45 U) */}
        <div className="text-xs mt-1 text-gray-400">
          {payText}
        </div>

        {/* Extra Payout Box */}
        {isYesSide && payoutText && (
          <div className="absolute -bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold text-white bg-red-600 shadow-md">
            {payoutText}
          </div>
        )}
      </div>
    </div>
  );
};
