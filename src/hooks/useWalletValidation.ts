import React, { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { getUserData } from '@/services/authService';
import { useUserIdByWallet } from '@/utils/nftContract';
import { showErrorToast } from '@/utils/toast';

/**
 * Hook to validate wallet address mapping with logged-in user ID
 * Shows error notification if wallet doesn't match the user account
 */
export const useWalletValidation = () => {
  const { isConnected, address } = useAccount();
  const [userId, setUserId] = React.useState<string | null>(null);
  const { userId: walletUserId, isLoading: isLoadingWalletMapping } = useUserIdByWallet(address);
  const hasShownError = useRef(false);

  // Get user ID from localStorage
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      const id = (userData as any)._id || (userData as any).reffralId;
      if (id) {
        setUserId(id);
      }
    }
  }, []);

  // Validate wallet mapping
  useEffect(() => {
    // Reset error flag when wallet or user changes
    if (!isConnected || !address || !userId) {
      hasShownError.current = false;
      return;
    }

    // Wait for wallet mapping to load
    if (isLoadingWalletMapping) {
      return;
    }

    // Check if wallet mapping is incorrect
    if (walletUserId && walletUserId !== userId && walletUserId !== '') {
      if (!hasShownError.current) {
        showErrorToast('Wallet address does not match your account. Please connect the correct wallet address.');
        hasShownError.current = true;
      }
    } else {
      // Reset flag if wallet matches
      hasShownError.current = false;
    }
  }, [isConnected, address, userId, walletUserId, isLoadingWalletMapping]);

  return {
    isWalletMismatch: Boolean(
      isConnected && 
      address && 
      userId && 
      walletUserId && 
      walletUserId !== userId && 
      walletUserId !== ''
    ),
    isLoading: isLoadingWalletMapping,
  };
};

