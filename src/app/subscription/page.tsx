'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { MainLayout } from '@/components/layouts/MainLayout';
import { CheckOutlined, CrownOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getUserData } from '@/services/authService';
import { useSubscriptionPrices, useBuyStandardSubscription, useBuyProSubscription, useUSDTMeta, useApproveUSDT, getNFTContractAddress, useSubscriptionInfo, useUserIdByWallet, useUserInfo } from '@/utils/nftContract';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/utils/toast';
import { useWalletValidation } from '@/hooks/useWalletValidation';

const SubscriptionPage: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionStep, setSubscriptionStep] = useState<'idle' | 'approving' | 'buying' | 'success' | 'error'>('idle');
  const [pendingSubscriptionType, setPendingSubscriptionType] = useState<'standard' | 'pro' | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  // Get subscription prices from contract
  const { standardPrice, proPrice, isLoading: isLoadingPrices, error: pricesError } = useSubscriptionPrices();
  const { usdtAddress, usdtDecimals, isLoading: isLoadingUsdtMeta, error: usdtError } = useUSDTMeta();
  
  // Get subscription info for logged-in user
  const { subscriptionInfo, isLoading: isLoadingSubscriptionInfo, refetch: refetchSubscriptionInfo } = useSubscriptionInfo(userId || undefined);
  
  // Get user info to check which NFTs they've minted
  const { userInfo, isLoading: isLoadingUserInfo, refetch: refetchUserInfo } = useUserInfo(userId || undefined);
  
  // Check which NFTs user has minted
  // Handle both bigint and number types
  const hasStandardNFT = userInfo?.collectionIds?.some(id => {
    const numId = typeof id === 'bigint' ? Number(id) : Number(id);
    return numId === 1;
  }) ?? false;
  const hasProNFT = userInfo?.collectionIds?.some(id => {
    const numId = typeof id === 'bigint' ? Number(id) : Number(id);
    return numId === 2;
  }) ?? false;
  const hasAnyNFT = hasStandardNFT || hasProNFT;
  
  // Validate wallet address mapping
  const { isWalletMismatch } = useWalletValidation();
  
  // Check wallet to userId mapping (for display purposes)
  const { userId: walletUserId, isLoading: isLoadingWalletMapping } = useUserIdByWallet(address);
  
  // Check if subscription is active
  const isSubscriptionActive = subscriptionInfo?.isActive ?? false;
  const activeSubscriptionType = subscriptionInfo?.subType ?? 0;
  
  // Get contract addresses
  const nftContractAddress = getNFTContractAddress();
  const usdtEnvAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}` | undefined;
  const resolvedUsdtAddress = (usdtEnvAddress || usdtAddress) as `0x${string}` | undefined;
  
  // Check USDT allowance
  const { data: allowance } = useReadContract({
    address: resolvedUsdtAddress,
    abi: [
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'allowance',
    args: address && nftContractAddress ? [address, nftContractAddress] : undefined,
    query: {
      enabled: !!address && !!resolvedUsdtAddress && !!nftContractAddress,
    },
  });
  
  // Approve USDT hook
  const { approveUSDT, isPending: isApproving, isSuccess: isApproveSuccess, error: approveError, reset: resetApprove } = useApproveUSDT(resolvedUsdtAddress, nftContractAddress);

  // Format price function - Price comes in Ether format (18 decimals), display as USDT
  const formatPrice = (raw?: bigint): string => {
    if (raw === undefined || raw === null) {
      return 'Loading...';
    }
    
    // Price comes in Ether format (18 decimals)
    const decimals = 18;
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    const remainder = raw % divisor;
    
    // Handle remainder
    if (remainder === BigInt(0)) {
      // No decimal part
      const numValue = Number(whole);
      return `${numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USDT/m`;
    } else {
      // Convert remainder to decimal string
      const remainderStr = remainder.toString().padStart(decimals, '0');
      const trimmedRemainder = remainderStr.replace(/0+$/, '');
      
      // Combine whole and decimal parts
      const decimalValue = parseFloat(`0.${trimmedRemainder}`);
      const totalValue = Number(whole) + decimalValue;
      
      return `${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT/m`;
    }
  };

  const formattedStandardPrice = formatPrice(standardPrice);
  const formattedProPrice = formatPrice(proPrice);

  
  // Subscription purchase hooks
  const { 
    buyStandardSubscription, 
    isPending: isStandardPending, 
    isConfirming: isStandardConfirming,
    isSuccess: isStandardSuccess,
    error: standardError,
    reset: resetStandard 
  } = useBuyStandardSubscription();
  
  const { 
    buyProSubscription, 
    isPending: isProPending, 
    isConfirming: isProConfirming,
    isSuccess: isProSuccess,
    error: proError,
    reset: resetPro 
  } = useBuyProSubscription();
  
  const isBuying = isStandardPending || isStandardConfirming || isProPending || isProConfirming;

  // Get user ID from localStorage
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      // Use userId or reffralId as userId
      const id = (userData as any).userId || (userData as any).reffralId;
      if (id) {
        setUserId(id);
      }
    } else {
      console.warn('[Subscription Page] No user data found in localStorage');
    }
  }, []);

  // Wallet validation is handled by useWalletValidation hook

  // Update remaining time countdown
  useEffect(() => {
    if (subscriptionInfo?.isActive && subscriptionInfo.remainingTime) {
      const remainingSeconds = Number(subscriptionInfo.remainingTime);
      setRemainingTime(remainingSeconds);
      
      // Update countdown every second
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            refetchSubscriptionInfo();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(null);
    }
  }, [subscriptionInfo, refetchSubscriptionInfo]);

  // Format remaining time
  const formatRemainingTime = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Get subscription type name
  const getSubscriptionTypeName = (subType: number): string => {
    if (subType === 1) return 'Standard';
    if (subType === 2) return 'Pro';
    return 'None';
  };

  // Handle subscription purchase after approval
  const handleBuyAfterApprove = async (subscriptionType: 'standard' | 'pro') => {
    if (!userId) {
      showErrorToast('User ID not found. Please login again.');
      router.push('/login');
      return;
    }

    try {
      setSubscriptionStep('buying');
      if (subscriptionType === 'standard') {
        await buyStandardSubscription(userId);
      } else {
        await buyProSubscription(userId);
      }
    } catch (error: any) {
      setSubscriptionStep('error');
      showErrorToast(error.message || `Failed to purchase ${subscriptionType} subscription`);
    }
  };

  // Handle subscription purchase (with approval check)
  const handleStandardSubscription = async () => {
    if (!isConnected || !address) {
      showWarningToast('Please connect your wallet first');
      router.push('/connect-wallet');
      return;
    }

    if (!userId) {
      showErrorToast('User ID not found. Please login again.');
      router.push('/login');
      return;
    }

    if (!standardPrice) {
      showErrorToast('Standard subscription price not available');
      return;
    }

    try {
      setPendingSubscriptionType('standard');
      setSubscriptionStep('approving');

      // Check if we need to approve (allowance is less than subscription price)
      const needsApproval = !allowance || allowance < standardPrice;

      if (needsApproval) {
        // Approve USDT spending (approve slightly more than needed for gas efficiency)
        const approveAmount = standardPrice * BigInt(2); // Approve 2x the amount
        await approveUSDT(approveAmount);
      } else {
        // Already approved, proceed directly to buy
        setSubscriptionStep('buying');
        await handleBuyAfterApprove('standard');
      }
    } catch (error: any) {
      setSubscriptionStep('error');
      showErrorToast(error.message || 'Failed to purchase standard subscription');
    }
  };

  const handleProSubscription = async () => {
    if (!isConnected || !address) {
      showWarningToast('Please connect your wallet first');
      router.push('/connect-wallet');
      return;
    }

    if (!userId) {
      showErrorToast('User ID not found. Please login again.');
      router.push('/login');
      return;
    }

    if (!proPrice) {
      showErrorToast('Pro subscription price not available');
      return;
    }

    try {
      setPendingSubscriptionType('pro');
      setSubscriptionStep('approving');

      // Check if we need to approve (allowance is less than subscription price)
      const needsApproval = !allowance || allowance < proPrice;

      if (needsApproval) {
        // Approve USDT spending (approve slightly more than needed for gas efficiency)
        const approveAmount = proPrice * BigInt(2); // Approve 2x the amount
        await approveUSDT(approveAmount);
      } else {
        // Already approved, proceed directly to buy
        setSubscriptionStep('buying');
        await handleBuyAfterApprove('pro');
      }
    } catch (error: any) {
      setSubscriptionStep('error');
      showErrorToast(error.message || 'Failed to purchase pro subscription');
    }
  };

  // Handle approve success - proceed to buy subscription
  useEffect(() => {
    if (isApproveSuccess && subscriptionStep === 'approving' && pendingSubscriptionType) {
      setSubscriptionStep('buying');
      handleBuyAfterApprove(pendingSubscriptionType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveSuccess, subscriptionStep, pendingSubscriptionType]);

  // Handle subscription purchase success
  useEffect(() => {
    const succeeded = (isStandardSuccess || isProSuccess) && subscriptionStep === 'buying';
    if (succeeded) {
      setSubscriptionStep('success');
      const subscriptionType = isStandardSuccess ? 'Standard' : 'Pro';
      showSuccessToast(`${subscriptionType} subscription purchased successfully!`);
      resetStandard();
      resetPro();
      resetApprove();
      setPendingSubscriptionType(null);
      setSubscriptionStep('idle');
      // Refetch subscription info to update UI
      refetchSubscriptionInfo();
    }
  }, [isStandardSuccess, isProSuccess, subscriptionStep, resetStandard, resetPro, resetApprove, refetchSubscriptionInfo]);

  // Handle errors
  useEffect(() => {
    if (approveError && subscriptionStep === 'approving') {
      setSubscriptionStep('error');
      showErrorToast(approveError.message || 'USDT approval failed');
      resetApprove();
      setPendingSubscriptionType(null);
    }
  }, [approveError, subscriptionStep, resetApprove]);

  useEffect(() => {
    if (standardError && subscriptionStep === 'buying' && pendingSubscriptionType === 'standard') {
      setSubscriptionStep('error');
      showErrorToast(standardError.message || 'Failed to purchase standard subscription');
      resetStandard();
      setPendingSubscriptionType(null);
    }
  }, [standardError, subscriptionStep, pendingSubscriptionType, resetStandard]);

  useEffect(() => {
    if (proError && subscriptionStep === 'buying' && pendingSubscriptionType === 'pro') {
      setSubscriptionStep('error');
      showErrorToast(proError.message || 'Failed to purchase pro subscription');
      resetPro();
      setPendingSubscriptionType(null);
    }
  }, [proError, subscriptionStep, pendingSubscriptionType, resetPro]);

  const isStandardProcessing = (subscriptionStep === 'approving' || subscriptionStep === 'buying') && pendingSubscriptionType === 'standard' && (isApproving || isBuying);
  const isProProcessing = (subscriptionStep === 'approving' || subscriptionStep === 'buying') && pendingSubscriptionType === 'pro' && (isApproving || isBuying);
  
  // Disable buttons if subscription is active
  const isStandardDisabled = Boolean(isStandardProcessing || !userId || !isConnected || isSubscriptionActive || isLoadingSubscriptionInfo || hasAnyNFT);
  const isProDisabled = Boolean(isProProcessing || !userId || !isConnected || isSubscriptionActive || isLoadingSubscriptionInfo || hasAnyNFT);
  return (
    <MainLayout>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(219, 122, 35, 0.2), 0 12px 30px rgba(0, 0, 0, 0.6);
            border-color: rgba(245, 163, 102, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(219, 122, 35, 0.3), 0 12px 30px rgba(0, 0, 0, 0.6);
            border-color: rgba(245, 163, 102, 0.4);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}} />
      <div 
        className="min-h-screen relative overflow-hidden"
        // style={{ 
        //   backgroundColor: '#000000',
        //   backgroundImage: `
        //     radial-gradient(circle at 20% 30%, rgba(219, 122, 35, 0.08) 0%, transparent 50%),
        //     radial-gradient(circle at 80% 70%, rgba(219, 122, 35, 0.06) 0%, transparent 50%),
        //     linear-gradient(135deg, rgba(30, 32, 34, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)
        //   `
        // }}
      >
        {/* Subtle circuit board pattern background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Level up your access
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Access to the full features of the Intelligence Layer (coming soon), including the Top Mispricings and the AI Copilot.
            </p>
          </div>

          {/* Important NFT Callout Banner */}
          <div className="mb-12 max-w-5xl mx-auto">
            <div
              className="relative rounded-xl overflow-hidden border border-gray-700/50 shadow-[0_0_20px_rgba(219,122,35,0.2),0_12px_30px_rgba(0,0,0,0.6)] p-6 sm:p-8 animate-pulse-glow"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(255,140,60,0.08) 0%, rgba(255,140,60,0.03) 50%, transparent 100%),' +
                  'linear-gradient(180deg, #1a1a1a 0%, #0e0e0e 50%, #0a0a0a 100%)',
              }}
            >
              {/* Animated glow effect */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-800/50 border border-gray-700/50"
                    style={{
                      boxShadow: '0 0 10px rgba(219, 122, 35, 0.2)',
                    }}
                  >
                    <CrownOutlined className="text-2xl text-orange-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  {hasAnyNFT ? (
                    <>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <CheckCircleOutlined className="text-green-400 text-lg" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">NFT Minted</span>
                      </div>
                      <p className="text-white text-lg sm:text-xl font-semibold mb-1">
                        <span className="text-green-400">NFT MINTED</span>
                      </p>
                      <p className="text-gray-400 text-sm sm:text-base">
                        Eligible Life Time PRO Access
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <ThunderboltOutlined className="text-gray-400 text-lg" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Important Note</span>
                      </div>
                      <p className="text-white text-lg sm:text-xl font-semibold mb-1">
                        Unlock <span className="text-orange-400">PERMANENT PRO ACCESS</span>
                      </p>
                      <p className="text-gray-400 text-sm sm:text-base">
                        Buy the NFT and Never Pay a Monthly Fee Again!
                      </p>
                    </>
                  )}
                </div>

                {/* CTA Button - Only show if NFT not minted */}
                {!hasAnyNFT && (
                  <Link href="/nft-mint" className="flex-shrink-0">
                    <button
                      className="px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl whitespace-nowrap"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                        boxShadow: '0 4px 15px rgba(219, 122, 35, 0.5), 3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                      }}
                    >
                      MINT NFT
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Subscription */}
            <div
              className="relative rounded-xl overflow-hidden border border-gray-700/50 shadow-[0_12px_30px_rgba(0,0,0,0.55)] hover:border-gray-600/60 transition-all duration-200 p-6"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 12% 12%, rgba(255,140,60,0.05) 0%, rgba(255,140,60,0) 46%),' +
                  'radial-gradient(circle at 88% 85%, rgba(255,115,45,0.04) 0%, rgba(255,115,45,0) 48%),' +
                  'linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 45%, #0a0a0a 100%)',
              }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Standard Subscription</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-orange-400">
                      {isLoadingPrices ? 'Loading...' : formattedStandardPrice}
                    </span>
                  </div>
                  {/* Show remaining time if Standard subscription is active */}
                  {isSubscriptionActive && activeSubscriptionType === 1 && remainingTime !== null && (
                    <div className="mt-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-400 text-sm" />
                        <span className="text-green-400 text-sm font-semibold">Active</span>
                      </div>
                      <p className="text-white text-xs mt-1">
                        Remaining: <span className="font-bold text-green-400">{formatRemainingTime(remainingTime)}</span>
                      </p>
                    </div>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Real-time Market Data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Basic Market Screener</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Daily Market Summary</span>
                  </li>
                </ul>

                <button
                  onClick={handleStandardSubscription}
                  disabled={Boolean(isStandardDisabled || isWalletMismatch)}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }}
                >
                  {isStandardProcessing ? 'Processing...' : isSubscriptionActive ? 'Subscription Active' : 'Choose Standard'}
                </button>
              </div>
            </div>

            {/* Pro Subscription */}
            <div
              className="relative rounded-xl overflow-hidden border border-gray-700/50 shadow-[0_12px_30px_rgba(0,0,0,0.55)] hover:border-gray-600/60 transition-all duration-200 p-6"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 12% 12%, rgba(255,140,60,0.08) 0%, rgba(255,140,60,0) 46%),' +
                  'radial-gradient(circle at 88% 85%, rgba(255,115,45,0.06) 0%, rgba(255,115,45,0) 48%),' +
                  'linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 45%, #0a0a0a 100%)',
              }}
            >
              {/* Video Background */}
              <div className="absolute inset-0 overflow-hidden">
                <video
                  src="/saas-pro.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-50"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
                {/* Dark overlay to ensure text readability */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.7) 0%, rgba(14, 14, 14, 0.6) 45%, rgba(10, 10, 10, 0.7) 100%)',
                  }}
                />
              </div>

              {/* Best Value Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div 
                  className="px-3 py-1 rounded-md text-xs font-bold text-white"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '0 2px 8px rgba(219, 122, 35, 0.4)',
                  }}
                >
                  BEST VALUE
                </div>
              </div>

              <div className="flex flex-col h-full relative z-10">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Subscription</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-orange-400">
                      {isLoadingPrices ? 'Loading...' : formattedProPrice}
                    </span>
                  </div>
                  {/* Show remaining time if Pro subscription is active */}
                  {isSubscriptionActive && activeSubscriptionType === 2 && remainingTime !== null && (
                    <div className="mt-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-400 text-sm" />
                        <span className="text-green-400 text-sm font-semibold">Active</span>
                      </div>
                      <p className="text-white text-xs mt-1">
                        Remaining: <span className="font-bold text-green-400">{formatRemainingTime(remainingTime)}</span>
                      </p>
                    </div>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Standard Plan Features +</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Proprietary Fair Odds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Top Mispricings Table</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">AI Copilot Access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Advanced Charting Tools</span>
                  </li>
                </ul>

                <button
                  onClick={handleProSubscription}
                  disabled={Boolean(isProDisabled || isWalletMismatch)}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }}
                >
                  {isProProcessing ? 'Processing...' : isSubscriptionActive ? 'Subscription Active' : 'Go Pro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionPage;

