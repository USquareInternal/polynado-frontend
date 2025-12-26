'use client';
import React from 'react';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';

interface Bet {
  id: string;
  category: string;
  marketQuestion: string;
  yourPick: 'Yes' | 'No';
  entryPrice: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
  status: 'ACTIVE' | 'WIN' | 'LOSS';
}

const mockBets: Bet[] = [
  {
    id: '1',
    category: 'Crypto',
    marketQuestion: 'Bitcoin To Reach $100K By EOY 2025?',
    yourPick: 'Yes',
    entryPrice: 107,
    currentPrice: 112,
    profitLoss: 5,
    profitLossPercent: 5.10,
    status: 'ACTIVE',
  },
  {
    id: '2',
    category: 'Sports',
    marketQuestion: 'Will Messi Return To Barcelona?',
    yourPick: 'No',
    entryPrice: 260,
    currentPrice: 297.96,
    profitLoss: 37.96,
    profitLossPercent: 14.6,
    status: 'ACTIVE',
  },
  {
    id: '3',
    category: 'Sports',
    marketQuestion: 'Lakers To Win NBA Championship 2025?',
    yourPick: 'Yes',
    entryPrice: 133,
    currentPrice: 121.03,
    profitLoss: -11.97,
    profitLossPercent: -9,
    status: 'ACTIVE',
  },
  {
    id: '4',
    category: 'Sports',
    marketQuestion: 'Fed To Cut Interest Rate In March 2026?',
    yourPick: 'No',
    entryPrice: 260,
    currentPrice: 297.96,
    profitLoss: 37.96,
    profitLossPercent: 14.6,
    status: 'WIN',
  },
  {
    id: '5',
    category: 'Crypto',
    marketQuestion: 'Bitcoin To Reach $100K By EOY 2025?',
    yourPick: 'Yes',
    entryPrice: 107,
    currentPrice: 112,
    profitLoss: 5,
    profitLossPercent: 5.10,
    status: 'WIN',
  },
  {
    id: '6',
    category: 'Sports',
    marketQuestion: 'Will Messi Return To Barcelona?',
    yourPick: 'No',
    entryPrice: 260,
    currentPrice: 297.96,
    profitLoss: 37.96,
    profitLossPercent: 14.6,
    status: 'WIN',
  },
  {
    id: '7',
    category: 'Sports',
    marketQuestion: 'Lakers To Win NBA Championship 2025?',
    yourPick: 'Yes',
    entryPrice: 133,
    currentPrice: 121.03,
    profitLoss: -11.97,
    profitLossPercent: -9,
    status: 'LOSS',
  },
  {
    id: '8',
    category: 'Sports',
    marketQuestion: 'Fed To Cut Interest Rate In March 2026?',
    yourPick: 'No',
    entryPrice: 260,
    currentPrice: 297.96,
    profitLoss: 37.96,
    profitLossPercent: 14.6,
    status: 'WIN',
  },
  {
    id: '9',
    category: 'Sports',
    marketQuestion: 'Lakers To Win NBA Championship 2025?',
    yourPick: 'Yes',
    entryPrice: 133,
    currentPrice: 121.03,
    profitLoss: -11.97,
    profitLossPercent: -9,
    status: 'LOSS',
  },
];

const formatPrice = (price: number, symbol: 'c' | '¢' = 'c') => {
  const formatted = price.toFixed(2).replace(/\.00$/, '');
  return `${formatted}${symbol}`;
};

const StatusBadge: React.FC<{ status: Bet['status'] }> = ({ status }) => {
  const getStatusStyle = (status: Bet['status']) => {
    switch (status) {
      case 'ACTIVE':
        return {
          border: '1.5px solid #007BD3',
          background: '#0C293D',
          color: 'white',
        };
      case 'WIN':
        return {
          border: '1.5px solid #4CAF50',
          background: '#143215',
          color: 'white',
        };
      case 'LOSS':
        return {
          border: '1.5px solid #DF261C',
          background: '#331514',
          color: 'white',
        };
      default:
        return {
          border: '1.5px solid #007BD3',
          background: '#0C293D',
          color: 'white',
        };
    }
  };

  return (
    <span
      className="px-3 py-1 rounded-lg text-xs font-semibold"
      style={getStatusStyle(status)}
    >
      {status}
    </span>
  );
};

export const YourBetsTable: React.FC = () => {
  return (
    <div className="overflow-hidden">
      <div className="mb-6 xl:mb-8">
        <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
          Your Bets
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr
              style={{
                background: 'linear-gradient(90deg, #DB7A23 0%, #000000 100%)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Market Bets
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Your Pick
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Entry Price
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Current Price
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Profit/Loss
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {mockBets.map((bet, index) => (
              <tr
                key={bet.id}
                className="hover:bg-white/5 transition-colors"
                style={{ backgroundColor: index % 2 === 0 ? '#000000' : '#1E2022' }}
              >
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase">{bet.category}</span>
                    <span className="text-sm xl:text-base text-white font-medium">
                      {bet.marketQuestion}
                    </span>
                  </div>
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <div className="flex items-center gap-2">
                    {bet.yourPick === 'Yes' ? (
                      <LikeOutlined className="text-white" />
                    ) : (
                      <DislikeOutlined className="text-white" />
                    )}
                    <span className="text-sm xl:text-base text-white">{bet.yourPick}</span>
                  </div>
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5 text-sm xl:text-base text-white">
                  {formatPrice(bet.entryPrice, 'c')}
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5 text-sm xl:text-base text-white">
                  {formatPrice(bet.currentPrice, '¢')}
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <span
                    className={`text-sm xl:text-base font-semibold ${
                      bet.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {bet.profitLoss >= 0 ? '+' : ''}
                    {formatPrice(Math.abs(bet.profitLoss), 'c')} ({bet.profitLossPercent >= 0 ? '+' : ''}
                    {bet.profitLossPercent.toFixed(1)}%)
                  </span>
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <StatusBadge status={bet.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
