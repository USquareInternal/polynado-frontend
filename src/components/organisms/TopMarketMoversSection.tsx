'use client';
import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { CircularProgress } from '@/components/atoms/CircularProgress';

interface MarketMover {
  id: string;
  title: string;
  category: string;
  yesPercentage: number;
  noPercentage: number;
  yesPay: string;
  noPay: string;
  volume: string;
  liquidity: string;
  change: string;
}

const marketMovers: MarketMover[] = [
  {
    id: '1',
    title: '2024 Presidential Election Winner',
    category: 'Political',
    yesPercentage: 78,
    noPercentage: 22,
    yesPay: '1.45 USDT',
    noPay: '0.25 USDT',
    volume: '$2.4M',
    liquidity: '$850',
    change: '↑2.3%',
  },
  {
    id: '2',
    title: 'Bitcoin to reach $100K by EOY 2025?',
    category: 'Crypto',
    yesPercentage: 68,
    noPercentage: 32,
    yesPay: '1.45 USDT',
    noPay: '0.25 USDT',
    volume: '$1.4M',
    liquidity: '$450',
    change: '↑1.3%',
  },
  {
    id: '3',
    title: 'AI Regulation Bill to Pass in 2025?',
    category: 'Political',
    yesPercentage: 45,
    noPercentage: 55,
    yesPay: '0.45 USDT',
    noPay: '1.25 USDT',
    volume: '$2.4M',
    liquidity: '$850',
    change: '↑2.3%',
  },
];

const GREEN_COLOR = '#4CAF50';
const RED_COLOR = '#FF6347';

export const TopMarketMoversSection: React.FC = () => {
  return (
    <section className="mt-8 xl:mt-12 fullhd:mt-16">
      <Heading
        level={2}
        className="text-white font-medium mb-6 xl:mb-8 fullhd:mb-10 text-xl sm:text-2xl xl:text-3xl fullhd:text-4xl"
        style={{
          fontSize: '29.674px',
          fontFamily: 'Inter',
        }}
      >
        Top Market Movers
      </Heading>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 fullhd:gap-10">
        {marketMovers.map((market) => {
          const isPositiveChange = market.change.includes('↑') || market.change.includes('+');
          const changeColor = isPositiveChange ? 'text-green-500' : 'text-red-500';

          return (
            <div
              key={market.id}
              className="relative flex flex-col h-full bg-[#1E2022] rounded-3xl p-5 pt-7 cursor-pointer max-w-md 
                border border-orange-500/50 
                shadow-[0_0_8px_rgba(255,165,0,0.3)] transition-shadow hover:shadow-[0_0_12px_rgba(255,165,0,0.5)]"
            >
              {/* Category Badge */}
              <span className="absolute top-0 left-4 transform -translate-y-1/2 
                     inline-block bg-black text-xs font-medium px-3 py-1 rounded-full 
                     uppercase text-gray-300 border border-white/40">
                {market.category}
              </span>

              <div className="flex-1 flex flex-col">
                {/* Title */}
                <Heading
                  level={3}
                  className="mt-2 mb-4 text-sm sm:text-sm font-semibold text-white min-h-[56px] sm:min-h-[64px] flex items-center"
                >
                  {market.title}
                </Heading>

                {/* Yes/No Pay Structure */}
                <div className="flex justify-around items-center my-1 min-h-[150px] flex-1">
                  {/* Yes Side */}
                  <div className="flex flex-col items-center">
                    <CircularProgress
                      percentage={market.yesPercentage}
                      color={GREEN_COLOR}
                      label="Yes"
                      payText={market.yesPay}
                      isYesSide={true}
                    />
                  </div>

                  {/* No Side */}
                  <div className="flex flex-col items-center">
                    <CircularProgress
                      percentage={market.noPercentage}
                      color={RED_COLOR}
                      label="No"
                      payText={market.noPay}
                      isYesSide={false}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="flex justify-between items-center text-sm text-white mt-4">
                {/* Volume */}
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-400">
                    Volume: <span className="text-white font-bold">{market.volume}</span>
                  </span>
                </div>

                {/* Liquidity */}
                <div className="flex flex-col items-center">
                  <span className="font-medium text-gray-400">
                    Liquidity: <span className="text-white font-bold">${market.liquidity}</span>
                  </span>
                </div>

                {/* Change */}
                <div className="flex flex-col items-end">
                  <span className={`font-medium ${changeColor}`}>{market.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

