'use client';
import React from 'react';
import { StarOutlined, StarFilled, RightOutlined } from '@ant-design/icons';

interface MarketRow {
  id: string;
  marketQuestion: string;
  category: string;
  price: number;
  priceChange: number;
  polynadoFair: number;
  edge: number;
  momentum: number[];
  volume24h: string;
  openInterest: string;
  isFavorited?: boolean;
}

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

const mockMarketData: MarketRow[] = [
  {
    id: '1',
    marketQuestion: 'Bitcoin To Reach $100K By EOY 2025?',
    category: 'Crypto',
    price: 67,
    priceChange: 12.5,
    polynadoFair: 75,
    edge: 8.3,
    momentum: [60, 62, 64, 65, 66, 67, 67],
    volume24h: '$2.4M',
    openInterest: '$850K',
    isFavorited: false,
  },
  {
    id: '2',
    marketQuestion: 'Trump To Win 2024 Presidential Election?',
    category: 'Politics',
    price: 54,
    priceChange: 8.7,
    polynadoFair: 61,
    edge: 7.1,
    momentum: [50, 51, 52, 53, 54, 54, 54],
    volume24h: '$3.8M',
    openInterest: '$1.2M',
    isFavorited: true,
  },
  {
    id: '3',
    marketQuestion: 'Ethereum To $5K By March 2025?',
    category: 'Crypto',
    price: 42,
    priceChange: 5.4,
    polynadoFair: 56,
    edge: 6.8,
    momentum: [38, 39, 40, 41, 42, 42, 42],
    volume24h: '$1.8M',
    openInterest: '$680K',
    isFavorited: false,
  },
  {
    id: '4',
    marketQuestion: 'Lakers To Win NBA Championship 2025?',
    category: 'Sports',
    price: 28,
    priceChange: -6.2,
    polynadoFair: 34,
    edge: 5.9,
    momentum: [34, 32, 30, 29, 28, 28, 28],
    volume24h: '$980K',
    openInterest: '$340K',
    isFavorited: false,
  },
  {
    id: '5',
    marketQuestion: 'Fed To Cut Interest Rate In March 2025?',
    category: 'Economics',
    price: 71,
    priceChange: 3.8,
    polynadoFair: 59,
    edge: 8.9,
    momentum: [68, 69, 70, 70, 71, 71, 71],
    volume24h: '$1.5M',
    openInterest: '$530K',
    isFavorited: false,
  },
  {
    id: '6',
    marketQuestion: 'Tesla Stock To Hit $400 By Q2 2025?',
    category: 'Crypto',
    price: 48,
    priceChange: 11.3,
    polynadoFair: 55,
    edge: 5.2,
    momentum: [40, 42, 44, 46, 48, 48, 48],
    volume24h: '$1.4M',
    openInterest: '$250K',
    isFavorited: false,
  },
  {
    id: '7',
    marketQuestion: 'Bitcoin To Reach $100K By EOY 2025?',
    category: 'Crypto',
    price: 67,
    priceChange: -2.2,
    polynadoFair: 32,
    edge: 4.3,
    momentum: [69, 68, 67, 67, 67, 67, 67],
    volume24h: '$2.4M',
    openInterest: '$850K',
    isFavorited: false,
  },
  {
    id: '8',
    marketQuestion: '2024 Presidential Election Winner?',
    category: 'Political',
    price: 82,
    priceChange: 10.2,
    polynadoFair: 43,
    edge: 9.2,
    momentum: [75, 77, 79, 80, 81, 82, 82],
    volume24h: '$1.9M',
    openInterest: '$650K',
    isFavorited: false,
  },
  {
    id: '9',
    marketQuestion: 'Messi To Return To Barcelona?',
    category: 'Sports',
    price: 37,
    priceChange: 12.5,
    polynadoFair: 75,
    edge: 8.4,
    momentum: [30, 32, 34, 35, 36, 37, 37],
    volume24h: '$1.7M',
    openInterest: '$340K',
    isFavorited: false,
  },
  {
    id: '10',
    marketQuestion: 'AI Regulation Bill To Pass In 2025?',
    category: 'Political',
    price: 47,
    priceChange: 23.5,
    polynadoFair: 57,
    edge: 8.3,
    momentum: [35, 38, 41, 44, 46, 47, 47],
    volume24h: '$2.4M',
    openInterest: '$850K',
    isFavorited: false,
  },
  {
    id: '11',
    marketQuestion: 'Fed To Cut Interest Rate In March 2025?',
    category: 'Economics',
    price: 71,
    priceChange: 3.8,
    polynadoFair: 59,
    edge: 8.9,
    momentum: [68, 69, 70, 70, 71, 71, 71],
    volume24h: '$1.5M',
    openInterest: '$530K',
    isFavorited: false,
  },
];

export const MarketScreenerTable: React.FC = () => {
  const [favorites, setFavorites] = React.useState<Set<string>>(
    new Set(mockMarketData.filter(m => m.isFavorited).map(m => m.id))
  );

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

  const headers = [
    'Market',
    'Price',
    'Polynado Fair',
    'Edge',
    'Momentum',
    'Volume',
    'Actions',
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
            {mockMarketData.map((row, idx) => {
              const isPositive = row.priceChange >= 0;
              const isFavorited = favorites.has(row.id);
              
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

                  {/* Price */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{row.price}c</span>
                      <span className={`text-xs xl:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '↑' : '↓'}{Math.abs(row.priceChange)}%
                      </span>
                    </div>
                  </td>

                  {/* Polynado Fair */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <span className="text-xs xl:text-sm text-gray-400">
                      AI Fair: <span className="text-green-500">{row.polynadoFair}c</span>
                    </span>
                  </td>

                  {/* Edge */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <span className="text-green-500 font-semibold">+{row.edge}%</span>
                  </td>

                  {/* Momentum */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <MiniLineGraph data={row.momentum} isPositive={isPositive} />
                  </td>

                  {/* Volume */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{row.volume24h}</span>
                      <span className="text-xs xl:text-sm text-gray-400">OI: {row.openInterest}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 fullhd:py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
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
                      </button>
                      <button className="text-gray-400 hover:text-orange-400 transition-colors">
                        <RightOutlined className="text-lg xl:text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

