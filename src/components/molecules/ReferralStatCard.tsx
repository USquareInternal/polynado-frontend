// src/components/molecules/ReferralStatCard.tsx
import React from 'react';
import { ReferralIcon, ReferralIconType } from '@/components/atoms/ReferralIcon';

interface ReferralStatCardProps {
  value: string | number;
  label: string;
  iconType: ReferralIconType;
}

export const ReferralStatCard: React.FC<ReferralStatCardProps> = ({ value, label, iconType }) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#1E2022] border border-[#a85a21]/70 rounded-[10px] w-full shadow-[0_0_12px_rgba(255,140,0,0.35)]">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 border border-[#a85a21]/60 text-orange-400">
        <ReferralIcon type={iconType} className="text-lg" />
      </div>
      <div className="flex flex-col">
        <div className="text-xl sm:text-2xl font-semibold text-orange-400 leading-tight">
          {value}
        </div>
        <p className="text-xs sm:text-sm text-gray-300 whitespace-nowrap leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
};
