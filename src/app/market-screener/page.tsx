'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { getToken } from '@/services/authService';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useWalletValidation } from '@/hooks/useWalletValidation';
import { FeaturedMarketCards } from '@/components/organisms/FeaturedMarketCards';
import { SearchAndFilters } from '@/components/organisms/SearchAndFilters';
import { MarketScreenerTable } from '@/components/organisms/MarketScreenerTable';
import { TopMarketMoversSection } from '@/components/organisms/TopMarketMoversSection';

const MarketScreenerPage: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  
  // Validate wallet address mapping
  useWalletValidation();

//   // Check authentication and wallet connection
//   useEffect(() => {
//     const token = getToken();
    
//     // If not authenticated, redirect to login
//     if (!token) {
//       router.push('/login');
//       return;
//     }

//     // If authenticated but wallet not connected, redirect to wallet connection
//     if (!isConnected) {
//       router.push('/connect-wallet');
//     }
//   }, [isConnected, router]);

//   // Show nothing while checking connection or authentication
//   const token = getToken();
//   if (!token || !isConnected) {
//     return null;
//   }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header Section */}
      

        {/* Top Market Movers Section */}
        <TopMarketMoversSection />

        {/* Search and Filters */}
        <SearchAndFilters />

        {/* Market Table */}
        <MarketScreenerTable />

        <div className="mb-8 xl:mb-10 fullhd:mb-12">
          <h1 className="text-2xl sm:text-3xl xl:text-4xl fullhd:text-5xl font-bold text-white mb-2">
            Market Screener
          </h1>
          <p className="text-gray-400 text-sm sm:text-base xl:text-lg fullhd:text-xl">
            Browse, filter, and sort all available markets.
          </p>
        </div>

        {/* Featured Market Cards */}
        <FeaturedMarketCards />
      </div>
    </MainLayout>
  );
};

export default MarketScreenerPage;

