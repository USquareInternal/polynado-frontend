// src/components/organisms/MispricingTable.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/atoms/Heading';
import { useMarketScreener } from '@/hooks/useMarketScreener';

interface MispricingTableProps {
  data?: never; // Remove data prop, we'll use hook instead
}

// Small Line Graph Component
const MiniLineGraph: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const width = 60;
  const height = 30;
  const padding = 4;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Generate dummy data if no data is available
  const getDummyData = (): number[] => {
    // Create a simple trend based on isPositive
    // For positive: slight upward trend, for negative: slight downward trend
    const baseValue = 50;
    const trend = isPositive ? 1 : -1;
    return Array.from({ length: 7 }, (_, i) => baseValue + (i * trend * 2));
  };

  // Use dummy data if no data is available
  const graphData = (!data || !Array.isArray(data) || data.length === 0) 
    ? getDummyData() 
    : data;

  // Normalize data to fit within graph bounds
  const min = Math.min(...graphData);
  const max = Math.max(...graphData);
  const range = max - min || 1; // Avoid division by zero

  const points = graphData.map((value, index) => {
    const x = padding + (index / (graphData.length - 1 || 1)) * graphWidth;
    const y = padding + graphHeight - ((value - min) / range) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const color = isPositive ? '#6edb8b' : '#ef4444'; // green or red

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Helper function to format number and strip trailing zeros
const formatNumber = (num: number, decimals: number): string => {
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

export const MispricingTable: React.FC<MispricingTableProps> = () => {
  const router = useRouter();
  const { markets, isLoading, error } = useMarketScreener();
  
  // Show only first 3-4 rows
  const displayData = markets.slice(0, 4);
  const headers = [
    'Market Questions',
    'Market Odds',
    'Polynado Fair Odds',
    '24 Edge Trends',
    'Edge'
  ];

  const formatPercent = (value: number) => `${formatNumber(value, 4)}%`;
  const formatEdgeTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatNumber(value, 4)}`;
  };
  const edgeTrendColor = (value: number) => value >= 0 ? 'text-[#6edb8b]' : 'text-[#ef4444]';

  // Convert polynadoFair to percentage if needed
  const getPolynadoFairPercent = (polynadoFair: number): number => {
    return polynadoFair < 1 ? polynadoFair * 100 : polynadoFair;
  };

  return (
    <section className="mt-12 xl:mt-16 fullhd:mt-20">
      <Heading level={2} className="mb-4 xl:mb-6 fullhd:mb-8 text-2xl xl:text-3xl fullhd:text-4xl text-white">
        Top Mispricings
      </Heading>

      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Loading mispricings...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : displayData.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No mispricings available</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-orange-500/40 bg-[#1f1f1f] shadow-[0_0_12px_rgba(0,0,0,0.25)]">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-500 text-white">
                  {headers.map((header, index) => (
                    <th
                      key={header}
                      scope="col"
                      className={`px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 text-left text-xs xl:text-sm fullhd:text-base font-semibold tracking-wide uppercase ${
                        index === 0 ? 'bg-orange-600' : ''
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700 text-sm xl:text-base fullhd:text-lg text-gray-200">
                {displayData.map((row, idx) => {
                  const polynadoFairPercent = getPolynadoFairPercent(row.polynadoFair);
                  const isEdgePositive = row.edge >= 0;
                  
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#1E2022' }}
                    >
                      {/* Market Questions - from marketQuestion */}
                      <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap font-medium text-white">{row.marketQuestion}</td>
                      
                      {/* Market Odds - from yesPercentage */}
                      <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap font-semibold text-gray-100">{formatPercent(row.yesPercentage)}</td>
                      
                      {/* Polynado Fair Odds - from polynadoFair */}
                      <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap font-semibold text-gray-100">{formatPercent(polynadoFairPercent)}</td>
                      
                      {/* 24 Edge Trends - from edge */}
                      <td className={`px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap font-semibold ${edgeTrendColor(row.edge)}`}>
                        {formatEdgeTrend(row.edge)}
                      </td>
                      
                      {/* Edge - from momentum, show graph (green if edge >= 0, red if edge < 0) */}
                      <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                        <MiniLineGraph 
                          data={row.momentum} 
                          isPositive={isEdgePositive} 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* View More Button */}
          <div className="mt-6 xl:mt-8 fullhd:mt-10 text-center">
            <button
              onClick={() => router.push('/market-screener')}
              className="px-6 xl:px-8 fullhd:px-10 py-2 xl:py-3 fullhd:py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View More
            </button>
          </div>
        </>
      )}
    </section>
  );
};