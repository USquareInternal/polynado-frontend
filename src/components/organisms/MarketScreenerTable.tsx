'use client';
import React from 'react';
import { StarOutlined, StarFilled, RightOutlined } from '@ant-design/icons';
import { useMarketScreener } from '@/hooks/useMarketScreener';

// Helper function to format number and strip trailing zeros
const formatNumber = (num: number, decimals: number): string => {
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

// Mini Line Graph Component for Momentum
const MiniLineGraph: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const width = 80;
  const height = 30;
  const padding = 4;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <svg width={width} height={height} className="inline-block">
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="8" fill="#666">
          No data
        </text>
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * graphWidth;
    const y = padding + graphHeight - ((value - min) / range) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const color = isPositive ? '#6edb8b' : '#ef4444';

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

type SortDirection = 'none' | 'asc' | 'desc';

interface MarketScreenerTableProps {
  sortByPolynadoFair?: SortDirection;
}

export const MarketScreenerTable: React.FC<MarketScreenerTableProps> = ({ sortByPolynadoFair = 'none' }) => {
  const { markets: marketData, isLoading, error, isBSCChain } = useMarketScreener();
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  // Sort markets by Polynado fair based on sort direction
  const sortedMarketData = React.useMemo(() => {
    if (sortByPolynadoFair === 'none' || !marketData || marketData.length === 0) {
      return marketData;
    }
    
    return [...marketData].sort((a, b) => {
      // polynadoFair is stored as decimal (0-1) in MarketScreenerRow
      // Convert to percentage for comparison (0-100)
      const aPolynadoFair = a.polynadoFair ?? 0;
      const bPolynadoFair = b.polynadoFair ?? 0;
      
      // Normalize to percentage: if < 1, it's decimal, multiply by 100; otherwise it's already percentage
      const aValue = aPolynadoFair < 1 ? aPolynadoFair * 100 : aPolynadoFair;
      const bValue = bPolynadoFair < 1 ? bPolynadoFair * 100 : bPolynadoFair;
      
      // Apply sort direction
      if (sortByPolynadoFair === 'desc') {
        // Descending order: higher values first (b - a)
        return bValue - aValue;
      } else {
        // Ascending order: lower values first (a - b)
        return aValue - bValue;
      }
    });
  }, [marketData, sortByPolynadoFair]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const headers = isBSCChain
    ? [
        'Market',
        'Yes percentage',
        'Yes price',
        'Polynado fair',
        'Edge',
        'Confidence score',
        'Action',
      ]
    : [
        'Market',
        'Yes percentage',
        'Yes price',
        'Polynado fair',
        'Edge',
        'Momentum',
        'Volume',
        'Action',
      ];

  return (
    <section className="mb-8 xl:mb-10 fullhd:mb-12">
      <div className="overflow-x-auto rounded-2xl border-t border-b border-orange-500/40 bg-[#1f1f1f] shadow-[0_0_12px_rgba(0,0,0,0.25)]">
        <table className="min-w-full">
          <thead>
            <tr 
              className="text-white"
              style={{
                background: 'linear-gradient(90deg, #DB7A23 0%, #000000 100%)',
                backdropFilter: 'blur(2px)',
              }}
            >
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 text-left text-xs xl:text-sm fullhd:text-base font-semibold tracking-wide uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700 text-sm xl:text-base fullhd:text-lg text-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 xl:px-6 fullhd:px-8 py-8 text-center text-gray-400">
                  Loading markets...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 xl:px-6 fullhd:px-8 py-8 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : marketData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 xl:px-6 fullhd:px-8 py-8 text-center text-gray-400">
                  No markets available
                </td>
              </tr>
            ) : (
              sortedMarketData.map((row, idx) => {
              const isPositive = row.yesPercentage >= 50;
              const isFavorited = favorites.has(row.id);
              
              // Format volume and openInterest consistently (M for millions, K for thousands) - 2 decimals, strip trailing zeros
              const formatVolume = (num: number): string => {
                if (!num || num === 0) return '$0';
                if (num >= 1000000) return '$' + formatNumber(num / 1000000, 2) + 'M';
                if (num >= 1000) return '$' + formatNumber(num / 1000, 2) + 'K';
                return '$' + formatNumber(num, 2);
              };
              
              const formattedVolume = formatVolume(row.volume);
              const formattedOpenInterest = formatVolume(row.openInterest);
              const formattedConfidence = formatNumber(row.confidenceScore, 2) + '%';
              
              return (
                <tr
                  key={row.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#1E2022' }}
                >
                  {/* Market */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{row.marketQuestion}</span>
                      </div>
                      <span className="text-xs xl:text-sm text-gray-400 mt-1">({row.category})</span>
                    </div>
                  </td>

                  {/* Yes percentage */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <span className="font-semibold text-white">{formatNumber(row.yesPercentage, 4)}%</span>
                  </td>

                  {/* Yes price */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <span className="font-semibold text-white">$ {formatNumber(row.yesPrice, 4)}</span>
                  </td>

                  {/* Polynado fair */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <span className="text-green-500 font-semibold">
                      {formatNumber(row.polynadoFair < 1 ? row.polynadoFair * 100 : row.polynadoFair, 4)}%
                    </span>
                  </td>

                  {/* Edge */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <span className={`font-semibold ${row.edge >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {row.edge >= 0 ? '+' : ''}{formatNumber(row.edge, 4)}
                    </span>
                  </td>

                  {/* Momentum or Confidence Score */}
                  {isBSCChain ? (
                    <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                      <span className="font-semibold text-white">{formattedConfidence}</span>
                    </td>
                  ) : (
                    <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                      <MiniLineGraph data={row.momentum} isPositive={isPositive} />
                    </td>
                  )}

                  {/* Volume (hide for BSC) */}
                  {!isBSCChain && (
                    <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{formattedVolume}</span>
                        <span className="text-xs xl:text-sm text-gray-400 mt-1">OI: {formattedOpenInterest}</span>
                      </div>
                    </td>
                  )}

                  {/* Action */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(row.id);
                        }}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {isFavorited ? (
                          <StarFilled className="text-lg xl:text-xl text-yellow-400" />
                        ) : (
                          <StarOutlined className="text-lg xl:text-xl" />
                        )}
                      </button> */}
                      {row.action ? (
                        <a
                          href={row.action}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-orange-400 transition-colors"
                        >
                          <RightOutlined className="text-lg xl:text-xl" />
                        </a>
                      ) : (
                        <button 
                          className="text-gray-400 hover:text-orange-400 transition-colors"
                          disabled
                        >
                          <RightOutlined className="text-lg xl:text-xl opacity-50" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

