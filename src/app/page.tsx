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

// --- Mock Data for MispricingTable ---
const mockMispricingData = [
  { 
    id: 1, 
    marketQuestion: 'AI Regulation Bill to Pass in 2025?', 
    marketOdds: 75, 
    polynadoFairOdds: 60, 
    edgeTrend24h: -10,
    edgeData: [65, 62, 60, 58, 55, 52, 50] // downward trend
  },
  { 
    id: 2, 
    marketQuestion: 'Messi to Return to Barcelona?', 
    marketOdds: 60, 
    polynadoFairOdds: 64, 
    edgeTrend24h: 20,
    edgeData: [44, 48, 52, 56, 60, 62, 64] // upward trend
  },
  { 
    id: 3, 
    marketQuestion: 'Bitcoin to reach $100K by EOY 2025?', 
    marketOdds: 66, 
    polynadoFairOdds: 74, 
    edgeTrend24h: -20,
    edgeData: [94, 90, 86, 82, 78, 76, 74] // downward trend
  },
];

const DashboardPageContent: React.FC = () => {
  return (
    <>
      {/* 1. HERO TERMINAL */}
      <HeroTerminal />
      {/* 2. TOP MARKET MOVERS (Includes Trends Sidebar) */}
      <MarketMovers />
      {/* 3. TOP MISPRICINGS (Table) */}
      <MispricingTable data={mockMispricingData} />
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
    if (!isConnected) {
      router.push('/connect-wallet');
    }
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