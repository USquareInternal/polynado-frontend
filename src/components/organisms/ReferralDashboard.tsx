// src/components/organisms/ReferralDashboard.tsx
import React from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { Heading } from '@/components/atoms/Heading';

export const ReferralDashboard: React.FC = () => {
  const stats = [
    { value: 12, label: 'Total Referrals' },
    { value: 8, label: 'NFT Mints' },
    { value: 4, label: 'Subscriptions' },
    { value: '240 USDT', label: 'Total Rewards' },
  ];

  return (
    <section className="mt-12">
      <Heading level={2} className="mb-1 text-2xl text-white">
        Referral Dashboard
      </Heading>
      <p className="text-sm text-gray-400 mb-6">
        Share Polynado and earn rewards for every NFT mint and subscription
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
};