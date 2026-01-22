// src/app/referral/page.tsx
'use client';
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReferralDashboard } from '@/components/organisms/ReferralDashboard';
import { useWalletValidation } from '@/hooks/useWalletValidation';

const ReferralPage: React.FC = () => {
  // Validate wallet address mapping
  useWalletValidation();
  
  return (
    <MainLayout>
      <ReferralDashboard isHomePage={false} />
    </MainLayout>
  );
};

export default ReferralPage;
