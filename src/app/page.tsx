'use client';
// src/app/dashboard/page.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { getToken } from '@/services/authService';
import { MainLayout } from '@/components/layouts/MainLayout';
import { HeroTerminal } from '@/components/organisms/HeroTerminal';
import { MarketMovers } from '@/components/organisms/MarketMovers';
import { MispricingTable } from '@/components/organisms/MispricingTable';
import { ReferralDashboard } from '@/components/organisms/ReferralDashboard';
import { useWalletValidation } from '@/hooks/useWalletValidation';

const DashboardPageContent: React.FC = () => {
  return (
    <>
      {/* 1. HERO TERMINAL */}
      <HeroTerminal />
      {/* 2. TOP MARKET MOVERS (Includes Trends Sidebar) */}
      <MarketMovers />
      {/* 3. TOP MISPRICINGS (Table) */}
      <MispricingTable />
       {/* 4. REFERRAL DASHBOARD & FOOTER */}
       <ReferralDashboard isHomePage={true} />
    </>
  );
};

// Wrap the content with the MainLayout to get the Sidebar and Header structure
const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  
  // Validate wallet address mapping
  useWalletValidation();

  // Check authentication and wallet connection
  useEffect(() => {
    const token = getToken();
    
    // If not authenticated, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // If authenticated but wallet not connected, redirect to wallet connection
    // if (!isConnected) {
    //   router.push('/connect-wallet');
    // }
  }, [isConnected, router]);

  // Show nothing while checking connection or authentication
  const token = getToken();
  if (!token || !isConnected) {
    return null;
  }

  return (
    <MainLayout>
      <DashboardPageContent />
    </MainLayout>
  );
};

export default DashboardPage;