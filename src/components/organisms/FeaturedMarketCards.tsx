'use client';
import React from 'react';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

interface FeaturedMarket {
  id: string;
  title: string;
  titleParts?: { text: string; color: string }[];
  deadline: string;
  deadlineColor?: string;
  backgroundImage: string;
  icon?: 'arrow-down' | 'arrow-up' | 'graph' | 'coin' | 'flag';
  glowColor?: string;
  overlayGradient?: string;
}

const featuredMarkets: FeaturedMarket[] = [
  {
    id: '1',
    title: 'FED TO CUT INTEREST RATE',
    titleParts: [
      { text: 'FED TO ', color: '#3B82F6' }, // Blue
      { text: 'CUT ', color: '#EF4444' }, // Red
      { text: 'INTEREST RATE', color: '#3B82F6' }, // Blue
    ],
    deadline: 'BY MARCH 2',
    deadlineColor: '#FBBF24', // Yellow
    backgroundImage: '/Image 1.png', // Fixed: Capital I to match actual filename
    icon: 'arrow-down',
    glowColor: 'rgba(59, 130, 246, 0.3)', // Blue glow
    overlayGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
  },
  {
    id: '2',
    title: 'TESLA STOCK TO HIT $400 BY Q2 2025?',
    deadline: 'Q2 2025',
    deadlineColor: '#06B6D4', // Teal/Cyan
    backgroundImage: '/Image 2.png', // Fixed: Capital I to match actual filename
    icon: 'graph',
    glowColor: 'rgba(6, 182, 212, 0.4)', // Teal/Cyan glow
    overlayGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
  },
  {
    id: '3',
    title: 'BITCOIN TO REACH $100,000? EOY 2025',
    deadline: 'EOY 2025',
    deadlineColor: '#06B6D4', // Teal/Cyan
    backgroundImage: '/Image 3.png', // Fixed: Capital I to match actual filename
    icon: 'coin',
    glowColor: 'rgba(6, 182, 212, 0.4)', // Teal/Cyan glow
    overlayGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
  },
  {
    id: '4',
    title: 'TRUMP TO WIN 2024 PRESIDENTIAL ELECTION?',
    deadline: '2024',
    deadlineColor: '#EF4444', // Red
    backgroundImage: '/Image 4.png', // Fixed: Capital I to match actual filename
    icon: 'flag',
    glowColor: 'rgba(239, 68, 68, 0.4)', // Red glow
    overlayGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
  },
  {
    id: '5',
    title: 'ETHEREUM (ETH) TO $5,000',
    deadline: 'BY MARCH 2025',
    deadlineColor: '#FBBF24', // Gold
    backgroundImage: '/Image 5.png', // Fixed: Capital I to match actual filename
    icon: 'arrow-up',
    glowColor: 'rgba(251, 191, 36, 0.3)', // Gold glow
    overlayGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
  },
];

// Holographic Graph Component
const HolographicGraph: React.FC<{ value: string; date: string; isUpward?: boolean }> = ({ 
  value, 
  date, 
  isUpward = true 
}) => {
  const points = isUpward 
    ? '10,50 20,45 30,40 40,35 50,30 60,25 70,20'
    : '10,20 20,25 30,30 40,35 50,40 60,45 70,50';

  return (
    <div className="absolute top-4 right-4 w-32 h-24">
      <svg width="100%" height="100%" viewBox="0 0 80 60" className="opacity-95">
        <defs>
          <linearGradient id={`holographic-gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${value}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={`url(#holographic-gradient-${value})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${value})`}
        />
      </svg>
      <div className="absolute top-0 right-0 text-white">
        <div className="text-[#06B6D4] font-extrabold text-xs xl:text-sm drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">{value}</div>
        <div className="text-[#06B6D4] text-[10px] xl:text-xs font-bold drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]">{date}</div>
      </div>
    </div>
  );
};

// Bitcoin Coin Component
const BitcoinCoin: React.FC = () => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-24">
      <div className="relative w-full h-full">
        {/* Glowing platform */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-4 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.7) 0%, transparent 70%)',
            boxShadow: '0 0 25px rgba(6, 182, 212, 1), 0 0 50px rgba(6, 182, 212, 0.5)',
          }}
        />
        {/* Bitcoin coin */}
        <div 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FCD34D 0%, #FBBF24 30%, #D97706 70%, #B45309 100%)',
            boxShadow: '0 0 30px rgba(251, 191, 36, 1), 0 0 60px rgba(251, 191, 36, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.4)',
            border: '2px solid rgba(251, 191, 36, 0.5)',
          }}
        >
          <span className="text-2xl font-extrabold text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">₿</span>
        </div>
      </div>
    </div>
  );
};

// Tesla Cybertruck Component
const TeslaCybertruck: React.FC = () => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-28 h-20">
      <div className="relative w-full h-full">
        {/* Glowing platform */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-4 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.7) 0%, transparent 70%)',
            boxShadow: '0 0 25px rgba(6, 182, 212, 1), 0 0 50px rgba(6, 182, 212, 0.5)',
          }}
        />
        {/* Tesla Cybertruck placeholder */}
        <div 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-14 bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 rounded-lg flex items-center justify-center"
          style={{
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 20%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 0% 20%)',
          }}
        >
          <span className="text-white font-extrabold text-lg drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]">T</span>
        </div>
      </div>
    </div>
  );
};

export const FeaturedMarketCards: React.FC = () => {
  // Height pattern: 
  // Image 1 = Image 5 (smallest)
  // Image 2 = Image 4 (medium) - reduced proportionally
  // Image 3 (tallest) - slightly reduced
  const heightPattern = {
    0: '330px', // Image 1 - smallest (same as Image 5)
    1: '350px', // Image 2 - medium (reduced from 380px, same as Image 4)
    2: '370px', // Image 3 - tallest (slightly reduced from 410px)
    3: '350px', // Image 4 - medium (reduced from 380px, same as Image 2)
    4: '330px', // Image 5 - smallest (same as Image 1)
  };

  return (
    <section className="mb-8 xl:mb-10 fullhd:mb-12 relative">

      {/* Desktop: All cards in single frame with overlap */}
      <div className="hidden lg:flex relative justify-center items-end gap-0 w-full">
        <div className="flex items-end justify-center w-full">
          {featuredMarkets.map((market, index) => {
            // Overlap pattern: 
            // - Image 2 overlaps Image 1 (left corner)
            // - Middle image (Image 3) overlaps both Image 2 and Image 4
            // Z-index: Higher index = higher z-index (so later images appear on top)
            // Middle image (index 2) should be highest to appear on top of both sides
            // Image 4 should appear on top of Image 5
            const zIndex = index === 2 ? 10 : index === 3 ? 6 : index === 4 ? 4 : index + 1;
            const overlapAmount = 40; // Overlap amount
            // Calculate card width to fit all 5 cards in viewport
            const cardWidth = 'calc((100% - 120px) / 5)'; // Account for 4 overlaps
            // Get height from pattern
            const cardHeight = heightPattern[index as keyof typeof heightPattern] || '380px';
            
            // Overlap logic: 
            // - Image 1 (index 0): no overlap
            // - Image 2 (index 1): overlaps Image 1
            // - Image 3 (index 2): overlaps Image 2 (and appears on top of Image 4 due to z-index)
            // - Image 4 (index 3): overlaps Image 3 and Image 5 (appears on top of Image 5)
            // - Image 5 (index 4): no overlap (overlapped by Image 4)
            const marginLeft = index > 0 && index < 4 ? `-${overlapAmount}px` : '0';
            // Add extra overlap for Image 4 on Image 5 (right corner)
            const marginRight = index === 3 ? `-${overlapAmount * 0.5}px` : '0';

            return (
              <div
                key={market.id}
                className="relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:z-50 flex-shrink-0"
                style={{
                  width: cardWidth,
                  maxWidth: '280px',
                  minWidth: '240px',
                  height: cardHeight,
                  marginLeft,
                  marginRight,
                  zIndex,
                }}
              >
              {/* Background Image - Only Image, No Overlays */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${market.backgroundImage}')`,
                  backgroundColor: '#1E2022', // Fallback color if image doesn't load
                }}
              />
              
              {/* Blur effect on left side for Image 1 - fadeout effect */}
              {index === 0 && (
                <div 
                  className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, #000000 0%, rgba(0, 0, 0, 0.98) 15%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.65) 50%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.15) 85%, transparent 100%)',
                    backdropFilter: 'blur(60px)',
                    maskImage: 'linear-gradient(to right, black 0%, black 20%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 0%, black 20%, transparent 100%)',
                  }}
                />
              )}
              
              {/* Blur effect on right side for Image 5 - fadeout effect */}
              {index === 4 && (
                <div 
                  className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, #000000 0%, rgba(0, 0, 0, 0.98) 15%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.65) 50%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.15) 85%, transparent 100%)',
                    backdropFilter: 'blur(60px)',
                    maskImage: 'linear-gradient(to left, black 0%, black 20%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 0%, black 20%, transparent 100%)',
                  }}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Mobile/Tablet: Grid layout */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6 fullhd:gap-8">
        {featuredMarkets.map((market) => (
          <div
            key={market.id}
            className="relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
            style={{
              minHeight: '400px',
            }}
          >
            {/* Background Image - Only Image, No Overlays */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${market.backgroundImage}')`,
                backgroundColor: '#1E2022', // Fallback color if image doesn't load
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
