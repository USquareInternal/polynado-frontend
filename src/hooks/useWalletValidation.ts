import React, { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { getUserData } from '@/services/authService';
import { useUserIdByWallet } from '@/utils/nftContract';
import { showErrorToast } from '@/utils/toast';

// Global state for side snackbar
let walletMismatchState = {
  visible: false,
  message: '',
  setVisible: ((visible: boolean) => {}) as (visible: boolean) => void,
  setMessage: ((message: string) => {}) as (message: string) => void,
};

export const setWalletMismatchSnackbar = (visible: boolean, message: string = '') => {
  if (walletMismatchState.setVisible) {
    walletMismatchState.setVisible(visible);
  }
  if (message && walletMismatchState.setMessage) {
    walletMismatchState.setMessage(message);
  }
};

export const initializeWalletMismatchSnackbar = (
  setVisible: (visible: boolean) => void,
  setMessage: (message: string) => void
) => {
  walletMismatchState.setVisible = setVisible;
  walletMismatchState.setMessage = setMessage;
};

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
      const id = (userData as any).userId || (userData as any).reffralId;
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
        const errorMessage = 'Wallet address does not match your account. Please connect the correct wallet address.';
        showErrorToast(errorMessage);
        setWalletMismatchSnackbar(true, errorMessage);
        hasShownError.current = true;
      }
    } else {
      // Reset flag if wallet matches
      hasShownError.current = false;
      setWalletMismatchSnackbar(false);
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

