// src/app/referral/page.tsx
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReferralDashboard } from '@/components/organisms/ReferralDashboard';

const ReferralPage: React.FC = () => {
  return (
    <MainLayout>
      <ReferralDashboard isHomePage={false} />
    </MainLayout>
  );
};

export default ReferralPage;
