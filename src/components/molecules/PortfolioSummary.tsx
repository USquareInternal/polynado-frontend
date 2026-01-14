'use client';
import React, { useState, useEffect } from 'react';
import { WalletOutlined, LineChartOutlined, DollarCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAccount } from 'wagmi';
import { fetchPortfolio } from '@/services/portfolioService';
import Spinner from '@/components/atoms/Spinner';

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

// Format currency value
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format percentage
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Get color based on value (green for positive, red for negative)
const getPnLColor = (value: number): string => {
  return value >= 0 ? '#5CD974' : '#DF261C';
};

export const PortfolioSummary: React.FC = () => {
  const { address } = useAccount();
  const [totalValue, setTotalValue] = useState<number>(0);
  const [unrealizedPnL, setUnrealizedPnL] = useState<number>(0);
  const [realizedPnL, setRealizedPnL] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const portfolioData = await fetchPortfolio(address);
        
        setTotalValue(portfolioData.totalValue || 0);
        setUnrealizedPnL(portfolioData.unrealizedPnL || 0);
        setRealizedPnL(portfolioData.realizedPnL || 0);
        setWinRate(portfolioData.winRate || 0);
      } catch (err) {
        console.error('Failed to load portfolio summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [address]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 fullhd:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="bg-[#1E2022] border border-orange-500/60 rounded-xl p-5"
            style={{ minHeight: '110px' }}
          >
            <div className="flex justify-center items-center h-full">
              <Spinner visible={true} size="sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 fullhd:gap-8">
      <SummaryCard
        icon={<WalletOutlined />}
        value={formatCurrency(totalValue)}
        label="Total Value"
        valueColor="#D16300"
      />
      <SummaryCard
        icon={<LineChartOutlined />}
        value={formatCurrency(unrealizedPnL)}
        label="Current PnL"
        valueColor={getPnLColor(unrealizedPnL)}
      />
      <SummaryCard
        icon={<DollarCircleOutlined />}
        value={formatCurrency(realizedPnL)}
        label="Realized PnL"
        valueColor={getPnLColor(realizedPnL)}
      />
      <SummaryCard
        icon={<TrophyOutlined />}
        value={formatPercentage(winRate)}
        label="Win Rate"
        valueColor="#D16300"
      />
    </div>
  );
};
