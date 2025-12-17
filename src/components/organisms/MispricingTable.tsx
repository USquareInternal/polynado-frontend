// src/components/organisms/MispricingTable.tsx
import React from 'react';
import { Heading } from '@/components/atoms/Heading';

interface MispricingRow {
  id: string | number;
  marketQuestion: string;
  marketOdds: number; // percentage (0-100)
  polynadoFairOdds: number; // percentage (0-100)
  edgeTrend24h: number; // percentage change with sign (+/-)
  edgeData: number[]; // array of data points for the graph
}

interface MispricingTableProps {
  data?: MispricingRow[];
}

// Small Line Graph Component
const MiniLineGraph: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const width = 60;
  const height = 30;
  const padding = 4;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Normalize data to fit within graph bounds
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * graphWidth;
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

// Mock Data for demonstration
const mockMispricingData: MispricingRow[] = [
  { 
    id: 1, 
    marketQuestion: 'AI Regulation Bill to Pass in 2025?', 
    marketOdds: 75, 
    polynadoFairOdds: 60, 
    edgeTrend24h: -10,
    edgeData: [65, 62, 60, 58, 55, 52, 50] // downward trend
  },
  { 
    id: 2, 
    marketQuestion: 'Messi to Return to Barcelona?', 
    marketOdds: 60, 
    polynadoFairOdds: 64, 
    edgeTrend24h: 20,
    edgeData: [44, 48, 52, 56, 60, 62, 64] // upward trend
  },
  { 
    id: 3, 
    marketQuestion: 'Bitcoin to reach $100K by EOY 2025?', 
    marketOdds: 66, 
    polynadoFairOdds: 74, 
    edgeTrend24h: -20,
    edgeData: [94, 90, 86, 82, 78, 76, 74] // downward trend
  },
  { 
    id: 4, 
    marketQuestion: 'AI Regulation Bill to Pass in 2025?', 
    marketOdds: 40, 
    polynadoFairOdds: 74, 
    edgeTrend24h: 2,
    edgeData: [72, 72.5, 73, 73.5, 74, 74, 74] // slight upward trend
  },
  { 
    id: 5, 
    marketQuestion: 'Bitcoin to reach $100K by EOY 2025?', 
    marketOdds: 30, 
    polynadoFairOdds: 74, 
    edgeTrend24h: -5,
    edgeData: [79, 78, 77, 76, 75, 74.5, 74] // slight downward trend
  },
];



export const MispricingTable: React.FC<MispricingTableProps> = ({ data = mockMispricingData }) => {
  const headers = [
    'Market Questions',
    'Market Odds',
    'Polynado Fair Odds',
    '24 Edge Trends',
    'Edge'
  ];

  const formatPercent = (value: number) => `${value}%`;
  const formatEdgeTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };
  const edgeTrendColor = (value: number) => value >= 0 ? 'text-[#6edb8b]' : 'text-[#ef4444]';

  return (
    <section className="mt-12">
      <Heading level={2} className="mb-4 text-2xl text-white">
        Top Mispricings
      </Heading>

      <div className="overflow-x-auto rounded-2xl border border-orange-500/40 bg-[#1f1f1f] shadow-[0_0_12px_rgba(0,0,0,0.25)]">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-500 text-white">
              {headers.map((header, index) => (
                <th
                  key={header}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase ${
                    index === 0 ? 'bg-orange-600' : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700 text-sm text-gray-200">
            {data.map((row, idx) => (
              <tr
                key={row.id}
                className="hover:bg-white/5 transition-colors"
                style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#1E2022' }}
              >
                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{row.marketQuestion}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-100">{formatPercent(row.marketOdds)}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-100">{formatPercent(row.polynadoFairOdds)}</td>
                <td className={`px-4 py-3 whitespace-nowrap font-semibold ${edgeTrendColor(row.edgeTrend24h)}`}>
                  {formatEdgeTrend(row.edgeTrend24h)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <MiniLineGraph 
                    data={row.edgeData} 
                    isPositive={row.edgeTrend24h >= 0} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  );
};