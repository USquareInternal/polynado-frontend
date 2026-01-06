'use client';
import React from 'react';
import Image from 'next/image';
import { Heading } from '@/components/atoms/Heading';
import { useMarkets } from '@/hooks/useMarkets';

const GREEN_COLOR = '#4CAF50';
const RED_COLOR = '#FF6347';
const WHITE_COLOR = '#FFFFFF';

// Helper function to format number and strip trailing zeros
const formatNumber = (num: number, decimals: number): string => {
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

export const TopMarketMoversSection: React.FC = () => {
  const { markets, isLoading, error } = useMarkets(3);

  return (
    <section className="mt-8 xl:mt-12 fullhd:mt-16 mb-8 xl:mb-12 fullhd:mb-16">
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

      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Loading markets...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : markets.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No markets available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 fullhd:gap-10">
          {markets.map((market) => {
            const isPositiveChange = market.change.includes('↑') || market.change.includes('+');
            const changeColor = isPositiveChange ? 'text-green-500' : 'text-red-500';

            return (
              <div
                key={market.title}
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
                  <div className="flex justify-between items-center my-1 min-h-[150px] flex-1 gap-4">
                    {/* Yes Side */}
                    <div className="relative w-36 h-36 flex flex-col text-white rounded-xl border border-white/10 bg-[#1E2022] overflow-hidden">
                      {/* Background Chart Image */}
                      <div className="absolute inset-0 w-full h-full">
                        <Image
                          src="/Yes.png"
                          alt="Yes trend chart"
                          fill
                          className="object-cover"
                          style={{ opacity: 0.9 }}
                        />
                      </div>
                      {/* Content Overlay - Positioned in lower-left */}
                      <div className="relative z-10 flex flex-col items-start justify-end p-3 h-full gap-1">
                        <div className="text-sm sm:text-base font-bold text-white drop-shadow-lg">Yes</div>
                        <div className="text-base sm:text-lg font-bold text-white drop-shadow-lg">{formatNumber(market.yesPercentage, 4)}%</div>
                        <div className="text-xs sm:text-sm text-white drop-shadow-lg">
                          <span className="font-normal">pay </span>
                          <span className="font-semibold">{market.yesPay}</span>
                        </div>
                      </div>
                    </div>

                    {/* No Side */}
                    <div className="relative w-36 h-36 flex flex-col text-white rounded-xl border border-white/10 bg-[#1E2022] overflow-hidden">
                      {/* Background Chart Image */}
                      <div className="absolute inset-0 w-full h-full">
                        <Image
                          src="/No.png"
                          alt="No trend chart"
                          fill
                          className="object-cover"
                          style={{ opacity: 0.9 }}
                        />
                      </div>
                      {/* Content Overlay - Positioned in lower-right */}
                      <div className="relative z-10 flex flex-col items-end justify-end p-3 h-full gap-1">
                        <div className="text-sm sm:text-base font-bold text-white drop-shadow-lg" style={{ color: WHITE_COLOR }}>No</div>
                        <div className="text-base sm:text-lg font-bold text-white drop-shadow-lg">{formatNumber(market.noPercentage, 4)}%</div>
                        <div className="text-xs sm:text-sm text-white drop-shadow-lg">
                          <span className="font-normal">pay </span>
                          <span className="font-semibold">{market.noPay}</span>
                        </div>
                      </div>
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
                      Liquidity: <span className="text-white font-bold">{market.liquidity}</span>
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
      )}
    </section>
  );
};

