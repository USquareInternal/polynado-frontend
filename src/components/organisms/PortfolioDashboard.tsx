'use client';
import React from 'react';
import { PortfolioSummary } from '@/components/molecules/PortfolioSummary';
import { CategoryExposure } from '@/components/molecules/CategoryExposure';
import { PerformanceAnalytics } from '@/components/molecules/PerformanceAnalytics';
import { AIInsights } from '@/components/molecules/AIInsights';
import { YourBetsTable } from '@/components/molecules/YourBetsTable';
import { PortfolioFooter } from '@/components/molecules/PortfolioFooter';

export const PortfolioDashboard: React.FC = () => {
  return (
    <div className="space-y-6 xl:space-y-8 fullhd:space-y-10">
      {/* Portfolio Summary Cards */}
      <PortfolioSummary />

      {/* Category Exposure and Performance Analytics - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="relative pr-3 xl:pr-4 fullhd:pr-5">
          <CategoryExposure />
          {/* Thin divider on the right - only visible on desktop */}
          <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-px bg-gray-700" />
        </div>
        <div className="pl-3 xl:pl-4 fullhd:pl-5">
          <PerformanceAnalytics />
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Your Bets Table */}
      <YourBetsTable />

      {/* Footer */}
      <PortfolioFooter />
    </div>
  );
};

