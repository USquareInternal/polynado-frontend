"use client";
import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { MarketCard } from '@/components/molecules/MarketCard';
import { MarketActivityChart } from '@/components/atoms/MarketActivityChart';
import { TrendBadge } from '@/components/molecules/TrendBadge';
import { Button } from '@/components/atoms/Button';
import { useMarkets } from '@/hooks/useMarkets';

// Mock data for demonstration
const mockTrends = [
    "Politics", "Box Office", "Mentions", "Elections", "Earnings", "Health",
    "Culture Business", "World Economy", "Weather", "Crypto", "Technology",
    "Geopolitics", "Finance", "Sports", "Politics", "Box Office", "Mentions", "Elections", "Earnings", "Health",
    "Culture Business", "World Economy", "Weather", "Crypto", "Technology",
    "Geopolitics", "Finance", "Sports"
];

// Match compact pills shown in reference: subtle border, muted text, tight desktop padding.
// Compact trend pills with fixed height to match design (approx 34px).
const trendBadgeCustomClasses =
    "inline-flex h-8 px-3 sm:h-8 sm:px-3 rounded-full border border-gray-500 text-sm sm:text-sm text-gray-100 font-medium bg-transparent justify-center items-center whitespace-nowrap";

export const MarketMovers: React.FC = () => {
    const { markets, isLoading, error } = useMarkets(4);

    const renderMarketCards = () => {
        if (isLoading) {
            return (
                <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-xl p-4 h-48 animate-pulse"></div>
                    <div className="bg-gray-800 rounded-xl p-4 h-48 animate-pulse hidden md:block"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="col-span-12 md:col-span-8 text-center p-8 bg-red-900 border border-red-700 rounded-lg">
                    <p className="text-red-400 font-medium">🚨 Error loading data: {error}</p>
                </div>
            );
        }

        if (markets.length === 0) {
            return (
                <div className="col-span-12 md:col-span-8 text-center p-8 bg-yellow-900 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-400 font-medium">No active markets available right now.</p>
                </div>
            );
        }

        const topMarkets = markets.slice(0, 4);

        return (
            <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
                {topMarkets.map((market, index) => (
                    <MarketCard key={index} {...market} />
                ))}

                <div className="col-span-full text-center pt-2">
                    <Button variant="secondary" className='w-auto px-10' style={{ backgroundColor: 'rgb(249, 115, 22)', color: 'white' }}>Explore Market</Button>
                </div>
            </div>
        );
    };

    return (
        <section className="mt-8">
            <Heading
                level={2}
                className="text-white font-medium mb-6"
                style={{
                    fontSize: '29.674px',
                    fontFamily: 'Inter',
                }}
            >
                Top Market Movers
            </Heading>

            {/* Main Content Grid: 12-column grid for 67/33 (8/4) split */}
            <div className="grid grid-cols-12 gap-6">

                {/* 1. Market Cards (Left Side) */}
                {renderMarketCards()}

                {/* 2. Market Chart & Trending Sidebar (Right Side) */}
                <aside className="col-span-12 md:col-span-4 pt-0 flex flex-col">

                    <div className="mb-6 h-48 md:h-52">
                        <MarketActivityChart />
                    </div>

                    <Heading
                        level={2}
                        className="text-white font-medium mb-6"
                        style={{
                            fontSize: '29.674px',
                            fontFamily: 'Inter',
                        }}
                    >
                        What's Trending ?
                    </Heading>

                    <div className="grid grid-cols-3 gap-2 flex-grow">
                        {mockTrends.map((trend, index) => (
                            <TrendBadge
                                key={index}
                                label={trend}
                                className={trendBadgeCustomClasses} // Uses smallest padding for minimal size
                                variant="default"
                            />
                        ))}
                    </div>
                </aside>
            </div>
        </section>
    );
};