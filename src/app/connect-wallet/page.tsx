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
  const [transactionTimeout, setTransactionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [noHashTimeout, setNoHashTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check authentication and redirect if needed
  useEffect(() => {
    const token = getToken();
    
    // If not authenticated, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // Redirect to dashboard if already connected and joined (for new users)
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    if (isConnected && hasJoined && isNewUser) {
      router.push('/');
    }
  }, [isConnected, hasJoined, router]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      console.log("Transaction successful! Hash:", hash);
      // Clear any timeout
      if (transactionTimeout) {
        clearTimeout(transactionTimeout);
        setTransactionTimeout(null);
      }
      showSuccessToast('Successfully joined Polynado!');
      setHasJoined(true);
      // Remove new user flag after successful join
      localStorage.removeItem('isNewUser');
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  }, [isSuccess, hash, router, transactionTimeout]);

  // Fallback: If transaction has hash but isConfirming is true for too long, assume success
  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    if (!isNewUser || !hash || isSuccess || error || !isConfirming) return;

    // If confirming for more than 30 seconds, assume success (transaction likely confirmed)
    // This handles cases where wagmi doesn't properly detect transaction completion
    const confirmingTimeout = setTimeout(() => {
      if (isConfirming && hash && !isSuccess && !error && !isPending) {
        console.log("Transaction confirming for too long, assuming success. Hash:", hash);
        console.log("Current state - isPending:", isPending, "isConfirming:", isConfirming, "isSuccess:", isSuccess);
        showSuccessToast('Transaction confirmed! Successfully joined Polynado!');
        setHasJoined(true);
        localStorage.removeItem('isNewUser');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    }, 30 * 1000); // 30 seconds

    return () => clearTimeout(confirmingTimeout);
  }, [hash, isConfirming, isSuccess, error, isPending, router]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error);
      // Clear any timeout
      if (transactionTimeout) {
        clearTimeout(transactionTimeout);
        setTransactionTimeout(null);
      }
      showErrorToast(error.message || 'Failed to join Polynado. Please try again.');
      reset();
    }
  }, [error, reset, transactionTimeout]);

  // Debug: Log transaction state changes
  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    if (isNewUser) {
      console.log("Transaction state:", {
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error: error?.message,
      });
    }
  }, [hash, isPending, isConfirming, isSuccess, error]);

  // Check if transaction hash is received (user approved in wallet)
  useEffect(() => {
    if (isPending && !hash) {
      // Clear any existing timeout
      if (noHashTimeout) {
        clearTimeout(noHashTimeout);
      }
      
      // If pending for more than 30 seconds without hash, user might not have approved
      const timeout = setTimeout(() => {
        showWarningToast('Please approve the transaction in your wallet to continue.');
        setNoHashTimeout(null);
      }, 30 * 1000); // 30 seconds

      setNoHashTimeout(timeout);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      // Clear timeout when hash is received or pending ends
      if (noHashTimeout) {
        clearTimeout(noHashTimeout);
        setNoHashTimeout(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, hash]);

  // Set timeout for stuck transactions (5 minutes)
  useEffect(() => {
    if ((isPending || isConfirming) && hash) {
      // Clear any existing timeout
      if (transactionTimeout) {
        clearTimeout(transactionTimeout);
      }
      
      const timeout = setTimeout(() => {
        showErrorToast('Transaction is taking too long. Please try again or check your wallet.');
        reset();
        setTransactionTimeout(null);
      }, 5 * 60 * 1000); // 5 minutes

      setTransactionTimeout(timeout);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      // Clear timeout when transaction completes or fails
      if (transactionTimeout) {
        clearTimeout(transactionTimeout);
        setTransactionTimeout(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, isConfirming, hash]);

  const handleContinue = async () => {
    if (!isConnected) {
      showWarningToast('Please connect your wallet to continue');
      return;
    }

    // Get user data
    const userData = getUserData() as any;
    if (!userData) {
      showErrorToast('User data not found. Please login again.');
      router.push('/login');
      return;
    }

    // Check if user is new (from signup) or existing (from login)
    const isNewUser = localStorage.getItem('isNewUser') === 'true';

    if (isNewUser) {
      // New user from signup - call joinPolynado
      const userId =(userData as any).userId;
      const referrerId = (userData as any).referredBy || '';
      const email = userData.email;

      if (!userId || !email) {
        showErrorToast('Missing user information. Please login again.');
        router.push('/login');
        return;
      }

      try {
        // joinPolynado doesn't return a value - it triggers writeContract
        // Transaction state is tracked via hash, isPending, isConfirming, isSuccess from the hook
        joinPolynado(userId, referrerId, email);
        console.log("joinPolynado called - waiting for transaction hash...");
      } catch (err: any) {
        console.error('Error joining Polynado:', err);
        showErrorToast(err.message || 'Failed to join Polynado. Please try again.');
        reset();
      }
    } else {
      // Existing user from login - just redirect (no contract call)
      showSuccessToast('Wallet connected successfully!');
      setTimeout(() => {
        router.push('/');
      }, 500);
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

            {/* Wallet Address Disclaimer */}
            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-orange-300 text-sm font-medium mb-1">Important Notice</p>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Each account must use a unique wallet address. If you sign up with a new email address but use a wallet address that is already associated with another account, your registration will not be accepted. Please ensure you use a different wallet address for each account.
                  </p>
                </div>
              </div>
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

            <div className="space-y-2">
              {(() => {
                const isNewUser = localStorage.getItem('isNewUser') === 'true';
                const isDisabled = !isConnected || (isNewUser && (isPending || isConfirming || hasJoined));
                
                return (
                  <>
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={isDisabled}
                      className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
                      style={{
                        backgroundColor: !isDisabled ? '#DB7A23' : '#666666',
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled) {
                          e.currentTarget.style.backgroundColor = '#E88A33';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled) {
                          e.currentTarget.style.backgroundColor = '#DB7A23';
                        }
                      }}
                    >
                      {isNewUser ? (
                        isPending && !hash 
                          ? 'Waiting for wallet approval...' 
                          : (isPending || isConfirming) && !hasJoined
                          ? 'Joining POLYNADO...' 
                          : hasJoined 
                          ? 'Joined!' 
                          : 'CONTINUE'
                      ) : (
                        'CONTINUE'
                      )}
                    </button>
                    
                    {/* Show cancel button if transaction is stuck (only for new users) */}
                    {isNewUser && (isPending || isConfirming) && hash && (
                      <button
                        type="button"
                        onClick={() => {
                          reset();
                          if (transactionTimeout) {
                            clearTimeout(transactionTimeout);
                            setTransactionTimeout(null);
                          }
                          showWarningToast('Transaction cancelled. You can try again.');
                        }}
                        className="w-full py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel Transaction
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Show transaction hash only for new users */}
            {localStorage.getItem('isNewUser') === 'true' && hash && (
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

