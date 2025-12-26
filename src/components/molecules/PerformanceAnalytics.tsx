'use client';
import React, { useState } from 'react';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

type TimeFilter = '7D' | '30D' | 'ALL';

// Generate realistic data based on filter
const generateChartData = (filter: TimeFilter) => {
  const dataPoints = filter === '7D' ? 7 : filter === '30D' ? 30 : 50;
  const data = [];
  
  // Create a smooth upward trend with realistic variation
  for (let i = 0; i < dataPoints; i++) {
    const progress = i / (dataPoints - 1);
    // Smooth curve: starts low, accelerates, then levels off
    const curve = progress * progress * 0.7 + progress * 0.3;
    const baseValue = curve * 85; // Scale to 0-85
    // Add small random variation for realism
    const variation = (Math.random() - 0.5) * 5;
    const value = Math.max(0, baseValue + variation);
    
    data.push({
      time: filter === '7D' ? `Day ${i + 1}` : filter === '30D' ? `Day ${i + 1}` : i + 1,
      pnl: Math.round(value * 10) / 10,
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E2022] border border-gray-600 rounded-lg p-2 shadow-lg">
        <p className="text-white text-sm">
          <span className="text-gray-400">PnL: </span>
          <span className="text-green-500 font-semibold">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const PerformanceAnalytics: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('ALL');
  const chartData = generateChartData(selectedFilter);

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
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="time"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
              tickCount={6}
            />
            <YAxis
              label={{ value: 'PnL ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12, style: { textAnchor: 'middle' } }}
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#colorPnl)"
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Time Filters */}
      <div className="flex justify-end gap-2">
        {(['7D', '30D', 'ALL'] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
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
