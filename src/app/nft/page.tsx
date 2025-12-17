'use client';
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { NFTHeaderBanner } from '@/components/organisms/NFTHeaderBanner';
import { NFTCollectionGrid } from '@/components/organisms/NFTCollectionGrid';
import { useWalletValidation } from '@/hooks/useWalletValidation';

const NFTPageContent: React.FC = () => {
  return (
    <div className="space-y-10 text-white">
      <NFTHeaderBanner minted={347} totalSupply={1000} floorPrice="0.5 ETH" />
      <NFTCollectionGrid />
    </div>
  );
};

const NFTPage: React.FC = () => {
  // Validate wallet address mapping
  useWalletValidation();
  
  return (
    <MainLayout>
      <NFTPageContent />
    </MainLayout>
  );
};

export default NFTPage;


