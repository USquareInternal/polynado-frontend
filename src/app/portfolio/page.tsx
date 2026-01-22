'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { getToken } from '@/services/authService';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useWalletValidation } from '@/hooks/useWalletValidation';
import { PortfolioDashboard } from '@/components/organisms/PortfolioDashboard';

const PortfolioPage: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  
  // Validate wallet address mapping
  useWalletValidation();

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-8 xl:mb-10 fullhd:mb-12">
          <h1 className="text-3xl sm:text-4xl xl:text-5xl fullhd:text-6xl font-bold text-white mb-2">
            Portfolio
          </h1>
          <p className="text-gray-400 text-sm sm:text-base xl:text-lg fullhd:text-xl">
            Track your earnings, stats and bets here
          </p>
        </div>

        {/* Portfolio Dashboard */}
        <PortfolioDashboard />
      </div>
    </MainLayout>
  );
};

export default PortfolioPage;

