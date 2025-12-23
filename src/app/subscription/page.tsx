'use client';
/**
 * FRONTEND STRIPE INTEGRATION
 * 
 * This component handles all FRONTEND-related Stripe functionality:
 * - Uses publishable key (pk_) - safe to expose to browser
 * - Displays prices (for UI only - actual calculation happens on backend)
 * - Redirects user to Stripe Checkout (secure payment page)
 * - Handles success/cancel redirects from Stripe
 * 
 * BACKEND responsibilities (in /api/stripe/*):
 * - Uses secret key (sk_) - never exposed to frontend
 * - Calculates prices securely
 * - Creates checkout sessions
 * - Handles webhooks for database updates
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { MainLayout } from '@/components/layouts/MainLayout';
import { CheckOutlined, CrownOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getUserData, getToken } from '@/services/authService';
import { useSubscriptionInfo, useUserInfo } from '@/utils/nftContract';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/utils/toast';
import { API_BASE_URL } from '@/components/organisms/WithdrawalHistory';
import LoaderBar from '@/components/atoms/LoaderBar';

// FRONTEND: Initialize Stripe with publishable key (pk_)
// This is safe to expose in the browser - it's public
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const SubscriptionPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [authUserData, setAuthUserData] = useState<any>(null);
  const [processingType, setProcessingType] = useState<'standard' | 'pro' | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isSessionVerifying, setIsSessionVerifying] = useState(false);
  
  // FRONTEND: Display prices only (for UI)
  // NOTE: Actual price calculation happens on backend to prevent tampering
  // These values are just for display purposes
  const standardPrice = 10; // Display: $10/month
  const proPrice = 20; // Display: $20/month
  
  // Get subscription info for logged-in user
  const { subscriptionInfo, isLoading: isLoadingSubscriptionInfo, refetch: refetchSubscriptionInfo } = useSubscriptionInfo(userId || undefined);
  
  // Get user info to check which NFTs they've minted
  const { userInfo, isLoading: isLoadingUserInfo, refetch: refetchUserInfo } = useUserInfo(userId || undefined);
  
  // Fallback flags from auth user data (login response)
  const authHasStandardNFT = authUserData?.isMintedStandardNFT === true;
  const authHasProNFT = authUserData?.isMintedProNFT === true;

  // Check which NFTs user has minted (on-chain)
  const hasStandardNFTOnChain = userInfo?.collectionIds?.some(id => {
    const numId = typeof id === 'bigint' ? Number(id) : Number(id);
    return numId === 1;
  }) ?? false;
  const hasProNFTOnChain = userInfo?.collectionIds?.some(id => {
    const numId = typeof id === 'bigint' ? Number(id) : Number(id);
    return numId === 2;
  }) ?? false;

  const hasStandardNFT = hasStandardNFTOnChain || authHasStandardNFT;
  const hasProNFT = hasProNFTOnChain || authHasProNFT;
  const hasAnyNFT = hasStandardNFT || hasProNFT;
  
  // Subscription active flags (prefer on-chain, fall back to auth data while loading)
  const authIsSubscribedStandard = authUserData?.isSubscribedStandard === true;
  const authIsSubscribedPro = authUserData?.isSubscribedPro === true;

  const isSubscriptionActive = (subscriptionInfo?.isActive ?? false) || authIsSubscribedStandard || authIsSubscribedPro;
  const activeSubscriptionType = subscriptionInfo?.subType ?? (authIsSubscribedPro ? 2 : authIsSubscribedStandard ? 1 : 0);

  // Calculate remaining time from auth user data expiry timestamps (fallback while on-chain loads)
  const calculateRemainingTimeFromAuth = () => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    let remainingSeconds = 0;

    if (authIsSubscribedPro && authUserData?.proSubscriptionExpiryTimestamp) {
      const expiry = Number(authUserData.proSubscriptionExpiryTimestamp);
      remainingSeconds = Math.max(0, expiry - now);
    } else if (authIsSubscribedStandard && authUserData?.standardSubscriptionExpiryTimestamp) {
      const expiry = Number(authUserData.standardSubscriptionExpiryTimestamp);
      remainingSeconds = Math.max(0, expiry - now);
    }

    return remainingSeconds > 0 ? remainingSeconds : null;
  };

  const authRemainingTime = calculateRemainingTimeFromAuth();

  // Get user ID and auth user data from localStorage
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setAuthUserData(userData);
      // Use userId or reffralId as userId
      const id = (userData as any).userId || (userData as any).reffralId;
      if (id) {
        setUserId(id);
      }
    } else {
      console.warn('[Subscription Page] No user data found in localStorage');
    }
  }, []);

  // Handle Stripe checkout success/cancel
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');
    const paid = searchParams.get('paid');
    const hasSession = Boolean(sessionId);

    // If redirected with a paid flag (set after verification), just show toast and clean URL
    if (paid === '1') {
      showSuccessToast('Subscription activated successfully!');
      setIsSessionVerifying(false);
      router.replace('/subscription');
      return;
    }

    if (hasSession) {
      setIsSessionVerifying(true);
      const token = getToken();
      if (!token) {
        showErrorToast('Authentication required. Please login again.');
        router.replace('/login');
        setIsSessionVerifying(false);
        return;
      }

      // Verify the session status (handle both success and direct session_id redirects)
      fetch(`${API_BASE_URL}/api/stripe/checkout-session?session_id=${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Failed to verify session (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          const paymentStatus = data.session?.paymentStatus || data.session?.payment_status;
          const sessionStatus = data.session?.status;

          if (paymentStatus === 'paid' || sessionStatus === 'complete') {
            refetchSubscriptionInfo();
            // Redirect back to subscription with a success flag to ensure toast after routing (toast shown there)
            router.replace('/subscription?paid=1');
          } else if (paymentStatus === 'unpaid' || paymentStatus === 'requires_payment_method' || paymentStatus === 'open') {
            showWarningToast('Payment not completed. Please try again.');
            router.replace('/subscription');
          } else {
            showErrorToast('Unable to verify payment. Please try again.');
            router.replace('/subscription');
          }
        })
        .catch((error) => {
          console.error('Error verifying session:', error);
          showErrorToast('Unable to verify payment. Please refresh or contact support.');
          router.replace('/subscription');
        })
        .finally(() => {
          setIsSessionVerifying(false);
        });
    } else if (canceled) {
      showWarningToast('Payment was canceled');
      router.replace('/subscription');
      setIsSessionVerifying(false);
    }
  }, [searchParams, router, refetchSubscriptionInfo]);

  // Update remaining time countdown (prefer on-chain data, fallback to auth data)
  useEffect(() => {
    // Use on-chain data if available, otherwise use auth data
    const onChainRemainingTime = subscriptionInfo?.isActive && subscriptionInfo.remainingTime 
      ? Number(subscriptionInfo.remainingTime) 
      : null;
    
    const timeToUse = onChainRemainingTime ?? authRemainingTime;

    if (timeToUse && timeToUse > 0) {
      setRemainingTime(timeToUse);
      
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
  }, [subscriptionInfo, authRemainingTime, refetchSubscriptionInfo]);

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

  /**
   * FRONTEND: Handle Stripe Checkout
   * 
   * This function:
   * 1. Calls backend API to create checkout session (backend calculates price securely)
   * 2. Redirects user to Stripe's secure payment page (PCI compliant - we never touch card data)
   * 3. User completes payment on Stripe's servers
   * 4. Stripe redirects back to our success/cancel URLs
   */
  const handleStripeCheckout = async (subscriptionType: 'standard' | 'pro') => {
    if (!userId) {
      showErrorToast('User ID not found. Please login again.');
      router.push('/login');
      return;
    }

    if (processingType) {
      return; // Already processing a subscription
    }

    try {
      setProcessingType(subscriptionType);

      // Get authentication token
      const token = getToken();
      if (!token) {
        showErrorToast('Authentication required. Please login again.');
        router.push('/login');
        return;
      }

      

      // Call backend API to create checkout session
      // Backend handles: price calculation, secret key usage, session creation
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionType,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, get text
        const text = await response.text();
        throw new Error(`Server error: ${text || response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server returned ${response.status}: ${response.statusText}`;
        console.error('Stripe API error:', errorMsg, data);
        throw new Error(errorMsg);
      }

      // FRONTEND: Redirect user to Stripe Checkout (secure payment page)
      // This is PCI compliant - Stripe handles all card data, we never see it
      if (data.checkoutUrl && typeof data.checkoutUrl === 'string' && data.checkoutUrl.startsWith('http')) {
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId && typeof data.sessionId === 'string') {
        // If we have sessionId but no URL, construct the checkout URL
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${data.sessionId}`;
        window.location.href = checkoutUrl;
      } else {
        console.error('Invalid response from Stripe API:', data);
        throw new Error('No valid checkout URL available. Please check your Stripe configuration.');
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      showErrorToast(error.message || 'Failed to start checkout process');
      setProcessingType(null);
    }
  };

  const handleStandardSubscription = () => handleStripeCheckout('standard');
  const handleProSubscription = () => handleStripeCheckout('pro');
  
  // Disable buttons if subscription is active or processing
  const isProcessing = processingType !== null;
  const isStandardProcessing = processingType === 'standard';
  const isProProcessing = processingType === 'pro';
  // Optimize: Only disable if we're sure subscription is active or user has NFT
  // Enable buttons as soon as we know subscription is not active and user has no NFT
  // This allows buttons to enable faster instead of waiting for all data
  const isStandardDisabled = Boolean(
    isProcessing || 
    !userId || 
    // Only disable if we've confirmed subscription is active (after loading completes)
    (isLoadingSubscriptionInfo ? false : isSubscriptionActive) ||
    // Only disable if we've confirmed user has NFT (after loading completes)
    (isLoadingUserInfo ? false : hasAnyNFT)
  );
  const isProDisabled = Boolean(
    isProcessing || 
    !userId || 
    // Only disable if we've confirmed subscription is active (after loading completes)
    (isLoadingSubscriptionInfo ? false : isSubscriptionActive) ||
    // Only disable if we've confirmed user has NFT (after loading completes)
    (isLoadingUserInfo ? false : hasAnyNFT)
  );
  const showLoader = isLoadingSubscriptionInfo || isLoadingUserInfo || isProcessing || isSessionVerifying;
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

        <div className="relative z-10 max-w-7xl xl:max-w-[1600px] fullhd:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 fullhd:px-16 py-12 space-y-4">
          <LoaderBar visible={showLoader} />
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl fullhd:text-7xl font-bold text-white mb-4">
              Level up your access
            </h1>
            <p className="text-lg xl:text-xl fullhd:text-2xl text-gray-400 max-w-2xl xl:max-w-3xl fullhd:max-w-4xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12 fullhd:gap-16 max-w-5xl xl:max-w-6xl fullhd:max-w-7xl mx-auto">
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
                      ${standardPrice}/m
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
                  disabled={isStandardDisabled}
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
                      ${proPrice}/m
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
                  disabled={isProDisabled}
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

