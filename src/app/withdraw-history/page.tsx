// src/app/withdraw-history/page.tsx
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { WithdrawalHistory } from '@/components/organisms/WithdrawalHistory';

const WithdrawHistoryPage: React.FC = () => {
  return (
    <MainLayout>
      <WithdrawalHistory />
    </MainLayout>
  );
};

export default WithdrawHistoryPage;

