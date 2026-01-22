'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { getToken } from '@/services/authService';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useWalletValidation } from '@/hooks/useWalletValidation';
import { FeaturedMarketCards } from '@/components/organisms/FeaturedMarketCards';
import { SearchAndFilters } from '@/components/organisms/SearchAndFilters';
import { MarketScreenerTable } from '@/components/organisms/MarketScreenerTable';
import { TopMarketMoversSection } from '@/components/organisms/TopMarketMoversSection';
import { FAQSection } from '@/components/organisms/FAQSection';

const MarketScreenerPage: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  type SortDirection = 'none' | 'asc' | 'desc';
  const [sortByPolynadoFair, setSortByPolynadoFair] = useState<SortDirection>('none');
  
  // Validate wallet address mapping
  useWalletValidation();

  const handleSortByPolynadoFair = () => {
    setSortByPolynadoFair(prev => {
      // Cycle through: none -> desc -> asc -> none
      if (prev === 'none') return 'desc';
      if (prev === 'desc') return 'asc';
      return 'none';
    });
  };

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
        <SearchAndFilters 
          onSortByPolynadoFair={handleSortByPolynadoFair}
          sortDirection={sortByPolynadoFair}
        />

        {/* Market Table */}
        <MarketScreenerTable sortByPolynadoFair={sortByPolynadoFair} />

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

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </MainLayout>
  );
};

export default MarketScreenerPage;

