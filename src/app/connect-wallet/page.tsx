'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { showWarningToast, showSuccessToast, showErrorToast } from '@/utils/toast';
import { getToken, getUserData } from '@/services/authService';
import { useJoinPolynado } from '@/utils/nftContract';

const ConnectWalletPage: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { joinPolynado, hash, isPending, isConfirming, isSuccess, error, reset } = useJoinPolynado();
  const [hasJoined, setHasJoined] = useState(false);

  // Check authentication and redirect if needed
  useEffect(() => {
    const token = getToken();
    
    // If not authenticated, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // Redirect to dashboard if already connected and joined
    if (isConnected && hasJoined) {
      router.push('/');
    }
  }, [isConnected, hasJoined, router]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      showSuccessToast('Successfully joined Polynado!');
      setHasJoined(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  }, [isSuccess, hash, router]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      showErrorToast(error.message || 'Failed to join Polynado. Please try again.');
      reset();
    }
  }, [error, reset]);

  const handleContinue = async () => {
    if (!isConnected) {
      showWarningToast('Please connect your wallet to continue');
      return;
    }

    // Get user data
    const userData = getUserData();
    if (!userData) {
      showErrorToast('User data not found. Please login again.');
      router.push('/login');
      return;
    }

    // Extract parameters
    const userId = userData.reffralId || userData._id;
    const referrerId = (userData as any).refferedBy || '';
    const email = userData.email;

    if (!userId || !email) {
      showErrorToast('Missing user information. Please login again.');
      router.push('/login');
      return;
    }

    try {
      await joinPolynado(userId, referrerId, email);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to join Polynado. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ 
        backgroundColor: '#000000',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(219, 122, 35, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(219, 122, 35, 0.06) 0%, transparent 50%),
          linear-gradient(135deg, rgba(30, 32, 34, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)
        `
      }}
    >
      {/* Minimal geometric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
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
        {/* Subtle corner accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Wallet Connection Card */}
        <div 
          className="rounded-2xl border border-gray-700/50 p-8 shadow-xl"
          style={{ 
            backgroundColor: '#1E2022',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Connect Your Wallet
              </h1>
              <p className="text-gray-400 text-sm">
                Connect your wallet to access the dashboard and continue
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-full flex justify-center">
                <ConnectButton
                  showBalance={false}
                  accountStatus="address"
                  chainStatus="none"
                />
              </div>

              {isConnected && address && (
                <div className="w-full mt-4 p-4 rounded-lg border border-green-500/30 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 text-sm font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-gray-300 text-xs break-all">{address}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!isConnected || isPending || isConfirming || hasJoined}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
              style={{
                backgroundColor: (isConnected && !isPending && !isConfirming && !hasJoined) ? '#DB7A23' : '#666666',
              }}
              onMouseEnter={(e) => {
                if (isConnected && !isPending && !isConfirming && !hasJoined) {
                  e.currentTarget.style.backgroundColor = '#E88A33';
                }
              }}
              onMouseLeave={(e) => {
                if (isConnected && !isPending && !isConfirming && !hasJoined) {
                  e.currentTarget.style.backgroundColor = '#DB7A23';
                }
              }}
            >
              {isPending || isConfirming ? 'Processing...' : hasJoined ? 'Joined!' : 'CONTINUE'}
            </button>
            
            {hash && (
              <div className="text-center mt-2">
                <p className="text-xs text-gray-400">
                  Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletPage;

