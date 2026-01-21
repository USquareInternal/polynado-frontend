'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchPortfolio } from '@/services/portfolioService';
import Spinner from '@/components/atoms/Spinner';

type TimeFilter = '7D' | '30D' | 'ALL';

interface PnLHistoryItem {
  timestamp: number | string;
  cumulativeProfit: number;
  [key: string]: any;
}

// Format time to HH:mm:ss
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Transform API pnlHistory data to chart format
const transformPnLHistory = (pnlHistory: PnLHistoryItem[]): Array<{ time: string; cumulativeProfit: number; date: Date }> => {
  if (!Array.isArray(pnlHistory) || pnlHistory.length === 0) {
    return [];
  }

  return pnlHistory
    .map((item) => {
      // Extract cumulativeProfit - Force numeric conversion
      const rawCumulativeProfit = item.cumulativeProfit ?? 0;
      const cumulativeProfit = typeof rawCumulativeProfit === 'string' 
        ? parseFloat(rawCumulativeProfit) 
        : typeof rawCumulativeProfit === 'number' 
        ? rawCumulativeProfit 
        : Number(rawCumulativeProfit) || 0;
      
      // Extract timestamp - API provides Unix timestamp in seconds
      let date: Date;
      if (item.timestamp) {
        // Handle both Unix timestamp (seconds or milliseconds)
        const timestamp = typeof item.timestamp === 'string' ? parseInt(item.timestamp) : item.timestamp;
        // If timestamp is less than 1e12, it's in seconds, otherwise milliseconds
        date = new Date(timestamp * 1000 > 1e12 ? timestamp : timestamp * 1000);
      } else {
        // Fallback: use current date
        date = new Date();
      }

      // Format time as HH:mm:ss
      const timeLabel = formatTime(date);

      // Force numeric conversion and round to 2 decimal places
      const numericCumulativeProfit = Number(parseFloat(cumulativeProfit.toString()).toFixed(2));

      return {
        time: timeLabel,
        cumulativeProfit: numericCumulativeProfit,
        date: date, // Keep original date for filtering
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending
};

// Filter data based on time filter - Ensure numeric conversion
const filterDataByTimeRange = (
  data: Array<{ time: string; cumulativeProfit: number; date: Date }>,
  filter: TimeFilter
): Array<{ time: string; cumulativeProfit: number }> => {
  if (filter === 'ALL') {
    return data.map(({ time, cumulativeProfit }) => ({ 
      time, 
      cumulativeProfit: Number(parseFloat(cumulativeProfit.toString()).toFixed(2)) 
    }));
  }

  const now = new Date();
  const cutoffDate = new Date();
  
  if (filter === '7D') {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (filter === '30D') {
    cutoffDate.setDate(now.getDate() - 30);
  }

  return data
    .filter((item) => item.date >= cutoffDate)
    .map(({ time, cumulativeProfit }) => ({ 
      time, 
      cumulativeProfit: Number(parseFloat(cumulativeProfit.toString()).toFixed(2)) 
    }));
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // Force numeric conversion and round to 2 decimal places
    const rawValue = payload[0].value;
    const cumulativeProfit = Number(parseFloat(rawValue?.toString() || '0').toFixed(2));
    const isPositive = cumulativeProfit >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className="bg-[#1E2022] border border-gray-600 rounded-lg p-2 shadow-lg">
        <p className="text-white text-sm">
          <span className="text-gray-400">Cumulative Profit: </span>
          <span className={`${colorClass} font-semibold`}>
            ${cumulativeProfit >= 0 ? '+' : ''}{cumulativeProfit.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const PerformanceAnalytics: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('ALL');
  const [pnlHistory, setPnLHistory] = useState<PnLHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio data to get PnL history
  useEffect(() => {
    const loadPnLHistory = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const portfolioData = await fetchPortfolio(address, chainId);
        setPnLHistory(portfolioData.pnlHistory || []);
      } catch (err) {
        console.error('Failed to load PnL history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPnLHistory();
  }, [address, chainId]);

  // Transform and filter chart data - Ensure all values are explicitly numeric
  const chartData = useMemo(() => {
    const transformed = transformPnLHistory(pnlHistory);
    const filtered = filterDataByTimeRange(transformed, selectedFilter);
    // Final safeguard: ensure all cumulativeProfit values are numbers
    return filtered.map(item => ({
      time: item.time,
      cumulativeProfit: Number(parseFloat(item.cumulativeProfit.toString()).toFixed(2))
    }));
  }, [pnlHistory, selectedFilter]);

  // Determine chart color based on data (green for positive, red for negative)
  const chartColor = useMemo(() => {
    if (chartData.length === 0) return '#10B981';
    const lastValue = chartData[chartData.length - 1]?.cumulativeProfit || 0;
    const lastCumulativeProfit = Number(parseFloat(lastValue.toString()).toFixed(2));
    return lastCumulativeProfit >= 0 ? '#10B981' : '#EF4444';
  }, [chartData]);

  // Calculate Y-axis domain with 10% padding
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    
    const values = chartData.map(item => {
      const value = item.cumulativeProfit;
      return Number(parseFloat(value.toString()).toFixed(2));
    });
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Add 10% padding to top and bottom
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    const domainMin = minValue - padding;
    const domainMax = maxValue + padding;
    
    return [domainMin, domainMax];
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="p-6 xl:p-8 fullhd:p-10">
        <div className="flex items-center justify-between mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Performance Analytics
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 xl:h-80 fullhd:h-96">
          <Spinner visible={true} size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 xl:p-8 fullhd:p-10">
        <div className="flex items-center justify-between mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Performance Analytics
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 xl:h-80 fullhd:h-96">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="p-6 xl:p-8 fullhd:p-10">
        <div className="flex items-center justify-between mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Performance Analytics
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 xl:h-80 fullhd:h-96">
          <p className="text-gray-400 text-center">Please connect your wallet to view performance analytics</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="p-6 xl:p-8 fullhd:p-10">
        <div className="flex items-center justify-between mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Performance Analytics
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 xl:h-80 fullhd:h-96">
          <p className="text-gray-400 text-center">No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 xl:p-8 fullhd:p-10">
      <div className="flex items-center justify-between mb-6 xl:mb-8">
        <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
          Performance Analytics
        </h2>
      </div>
      
      {/* Chart */}
      <div className="mb-4 h-64 xl:h-80 fullhd:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="time"
              label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 12 }}
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
              tickCount={Math.min(6, chartData.length)}
            />
            <YAxis
              domain={yAxisDomain}
              label={{ value: 'Cumulative Profit ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12, style: { textAnchor: 'middle' } }}
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
              tickFormatter={(value) => {
                const numValue = Number(parseFloat(value.toString()).toFixed(2));
                return numValue.toFixed(2);
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              stroke={chartColor}
              strokeWidth={2.5}
              fill="url(#colorPnl)"
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Time Filters */}
      <div className="flex justify-end gap-2">
        {(['7D', '30D', 'ALL'] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            // onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === filter
                ? 'bg-gray-800 text-white border border-gray-600'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
