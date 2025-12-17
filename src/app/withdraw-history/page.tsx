// src/app/withdraw-history/page.tsx
'use client';
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { WithdrawalHistory } from '@/components/organisms/WithdrawalHistory';
import { useWalletValidation } from '@/hooks/useWalletValidation';

const WithdrawHistoryPage: React.FC = () => {
  // Validate wallet address mapping
  useWalletValidation();
  
  return (
    <MainLayout>
      <WithdrawalHistory />
    </MainLayout>
  );
};

export default WithdrawHistoryPage;

