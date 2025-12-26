'use client';
import React from 'react';
import { WalletOutlined, LineChartOutlined, DollarCircleOutlined, TrophyOutlined } from '@ant-design/icons';

interface SummaryCardProps {
  icon: React.ReactNode;
  value: string;
  change?: string;
  label: string;
  valueColor: string;
  changeColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  icon, 
  value, 
  change, 
  label, 
  valueColor,
  changeColor 
}) => {
  return (
    <div 
      className="bg-[#1E2022] border border-orange-500/60 rounded-xl p-5 relative overflow-hidden"
      style={{
        boxShadow: '0 0 8px rgba(0,0,0,0.35), 0 0 16px rgba(245,163,102,0.4), 0 0 24px rgba(245,163,102,0.2)',
        height: '100%',
        minHeight: '110px',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Circular orange icon background */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: '#F5A366',
          }}
        >
          <div className="text-white text-xl">
            {icon}
          </div>
        </div>
        {change && (
          <span 
            className={`text-sm font-semibold ${changeColor || 'text-green-500'}`}
            style={{ fontSize: '14px' }}
          >
            {change}
          </span>
        )}
      </div>
      <div 
        className={`text-2xl font-bold mb-1`}
        style={{
          color: valueColor.startsWith('#') ? valueColor : (valueColor === 'orange' ? '#F5A366' : '#10B981'),
          fontSize: '24px',
          lineHeight: '1.2',
        }}
      >
        {value}
      </div>
      <p 
        className="text-white"
        style={{
          fontSize: '14px',
          fontWeight: 400,
        }}
      >
        {label}
      </p>
    </div>
  );
};

export const PortfolioSummary: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 fullhd:gap-8">
      <SummaryCard
        icon={<WalletOutlined />}
        value="$1,289.50"
        change="+8.2%"
        label="Total Value"
        valueColor="#D16300"
        changeColor="text-green-500"
      />
      <SummaryCard
        icon={<LineChartOutlined />}
        value="$1,289.50"
        label="Current PnL"
        valueColor="#5CD974"
      />
      <SummaryCard
        icon={<DollarCircleOutlined />}
        value="$450.30"
        label="Realized PnL"
        valueColor="#5CD974"
      />
      <SummaryCard
        icon={<TrophyOutlined />}
        value="68%"
        label="Win Rate"
        valueColor="#D16300"
      />
    </div>
  );
};
