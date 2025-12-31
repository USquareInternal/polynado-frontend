"use client";
import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { MarketCard } from '@/components/molecules/MarketCard';
import { MarketActivityChart } from '@/components/atoms/MarketActivityChart';
import { TrendBadge } from '@/components/molecules/TrendBadge';
import { Button } from '@/components/atoms/Button';

// Mock data for demonstration - Limited to 5-6 trending topics
const mockTrends = [
    "Politics", "Box Office", "Elections", "Crypto", "Technology", "Finance"
];

// Match compact pills shown in reference: subtle border, muted text, tight desktop padding.
// Compact trend pills with fixed height to match design (approx 34px).
const trendBadgeCustomClasses =
    "inline-flex h-8 px-3 sm:h-8 sm:px-3 rounded-full border border-gray-500 text-sm sm:text-sm text-gray-100 font-medium bg-transparent justify-center items-center whitespace-nowrap";

const mockMarkets = [
    {
        title: "Will ETH reach a new all-time high before 2026?",
        category: "Crypto",
        yesLabel: "Yes",
        noLabel: "No",
        yesPay: "$0.62",
        noPay: "$0.38",
        yesPercentage: 62,
        noPercentage: 38,
        yesPayout: "$1.00",
        volume: "2.1M",
        liquidity: "410K",
        change: "↑3.8%",
    },
    {
        title: "Next US Fed rate cut happens by Sept 2025",
        category: "Macro",
        yesLabel: "Yes",
        noLabel: "No",
        yesPay: "$0.54",
        noPay: "$0.46",
        yesPercentage: 54,
        noPercentage: 46,
        yesPayout: "$1.00",
        volume: "1.4M",
        liquidity: "220K",
        change: "↑1.6%",
    },
    {
        title: "Will the S&P 500 close 2025 above 6,000?",
        category: "Equities",
        yesLabel: "Yes",
        noLabel: "No",
        yesPay: "$0.41",
        noPay: "$0.59",
        yesPercentage: 41,
        noPercentage: 59,
        yesPayout: "$1.00",
        volume: "980K",
        liquidity: "185K",
        change: "↓0.7%",
    },
    {
        title: "Bitcoin dominance stays above 50% all quarter",
        category: "Crypto",
        yesLabel: "Yes",
        noLabel: "No",
        yesPay: "$0.68",
        noPay: "$0.32",
        yesPercentage: 68,
        noPercentage: 32,
        yesPayout: "$1.00",
        volume: "1.9M",
        liquidity: "305K",
        change: "↑2.9%",
    },
];

export const MarketMovers: React.FC = () => {

    const renderMarketCards = () => (
        <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 fullhd:grid-cols-2 gap-6 xl:gap-8 fullhd:gap-10">
            {mockMarkets.map((market, index) => (
                <MarketCard key={index} {...market} />
            ))}

            <div className="col-span-full text-center pt-2">
                <Button 
                  variant="secondary" 
                  className='w-auto px-10 relative overflow-hidden cursor-pointer' 
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    color: "white",
                    border: "none",
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                    position: 'relative',
                  }}
                >
                  Explore Market
                </Button>
            </div>
        </div>
    );

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

            {/* Main Content Grid: 12-column grid for 67/33 (8/4) split */}
            <div className="grid grid-cols-12 gap-6 xl:gap-8 fullhd:gap-10">

                {/* 1. Market Cards (Left Side) */}
                {renderMarketCards()}

                {/* 2. Market Chart & Trending Sidebar (Right Side) */}
                <aside className="col-span-12 md:col-span-4 pt-0 flex flex-col">

                    <div className="mb-6 xl:mb-8 fullhd:mb-10 h-48 md:h-52 xl:h-64 fullhd:h-72">
                        <MarketActivityChart />
                    </div>

                    {/* <Heading
                        level={2}
                        className="text-white font-medium mb-6 xl:mb-8 fullhd:mb-10 text-xl sm:text-2xl xl:text-3xl fullhd:text-4xl"
                        style={{
                            fontSize: '29.674px',
                            fontFamily: 'Inter',
                        }}
                    >
                        What's Trending ?
                    </Heading>

                    <div className="grid grid-cols-3 gap-2 xl:gap-3 fullhd:gap-4">
                        {mockTrends.map((trend, index) => (
                            <TrendBadge
                                key={index}
                                label={trend}
                                className={`${trendBadgeCustomClasses} w-full flex items-center justify-center text-center`}
                                variant="default"
                            />
                        ))}
                    </div> */}
                </aside>
            </div>
        </section>
    );
};