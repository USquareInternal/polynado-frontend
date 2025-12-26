'use client';
import React from 'react';
import { RobotOutlined } from '@ant-design/icons';

export const AIInsights: React.FC = () => {
  return (
    <div 
      className="bg-[#1E2022] border border-orange-500/60 rounded-xl p-6 xl:p-8 fullhd:p-10"
      style={{
        boxShadow: '0 0 8px rgba(0,0,0,0.35), 0 0 16px rgba(245,163,102,0.4), 0 0 24px rgba(245,163,102,0.2)',
      }}
    >
      <div className="flex items-center gap-3 mb-4 xl:mb-6">
        <RobotOutlined className="text-orange-400 text-xl xl:text-2xl" />
        <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-orange-400">
          AI Insights
        </h2>
      </div>
      
      {/* Two insights side by side with space between */}
      <div className="flex flex-col sm:flex-row gap-4 xl:gap-8 fullhd:gap-12 justify-between items-start sm:items-center">
        <p className="text-gray-300 text-sm xl:text-base whitespace-nowrap">
          &gt; Three of your bets are expiring today.
        </p>
        <p className="text-gray-300 text-sm xl:text-base whitespace-nowrap">
          &gt; You are heavily invested in Culture and Sports.
        </p>
      </div>
    </div>
  );
};
