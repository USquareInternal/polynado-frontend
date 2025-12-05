// src/app/dashboard/page.tsx
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { HeroTerminal } from '@/components/organisms/HeroTerminal';
import { MarketMovers } from '@/components/organisms/MarketMovers';
import { MispricingTable } from '@/components/organisms/MispricingTable';
import { ReferralDashboard } from '@/components/organisms/ReferralDashboard';

// --- Mock Data for MispricingTable ---
// Use the same mock structure as defined previously
const mockMispricingData = [
  { id: 1, marketName: 'US Inflation Rate Q3 2026', category: 'Finance', priceA: 0.45, priceB: 0.50, difference: '5.0%', liquidity: '$150k', risk: 'Medium' },
  { id: 2, marketName: 'Ethereum Merge Date', category: 'Crypto', priceA: 0.90, priceB: 0.95, difference: '5.0%', liquidity: '$320k', risk: 'Low' },
  { id: 3, marketName: 'Next Fed Chair Appointment', category: 'Political', priceA: 0.20, priceB: 0.28, difference: '8.0%', liquidity: '$90k', risk: 'High' },
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
      <ReferralDashboard />
    </>
  );
};

// Wrap the content with the MainLayout to get the Sidebar and Header structure
const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <DashboardPageContent />
    </MainLayout>
  );
};

export default DashboardPage;