'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, storeToken, storeUserData, getUserData } from '@/services/authService';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/utils/toast';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useJoinPolynado } from '@/utils/nftContract';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { joinPolynado, hash, isPending: isJoinPending, isConfirming: isJoinConfirming, isSuccess: isJoinSuccess, error: joinError, reset: resetJoin } = useJoinPolynado();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletConnection, setShowWalletConnection] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      showErrorToast('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({
        email: email.trim(),
        password: password,
      });

      if (response.success) {
        storeToken(response.token);
        storeUserData(response.user);
        showSuccessToast('Login successful!');
        // Show wallet connection screen
        setShowWalletConnection(true);
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joinPolynado success
  useEffect(() => {
    if (isJoinSuccess && hash && showWalletConnection) {
      showSuccessToast('Successfully joined Polynado!');
      setHasJoined(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  }, [isJoinSuccess, hash, showWalletConnection, router]);

  // Handle joinPolynado error
  useEffect(() => {
    if (joinError && showWalletConnection) {
      showErrorToast(joinError.message || 'Failed to join Polynado. Please try again.');
      resetJoin();
    }
  }, [joinError, showWalletConnection, resetJoin]);

  const handleJoinPolynado = async () => {
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

  // Wallet Connection Screen
  const renderWalletConnection = () => (
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

      {hash && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleJoinPolynado}
        disabled={!isConnected || isJoinPending || isJoinConfirming || hasJoined}
        className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
        style={{
          backgroundColor: (isConnected && !isJoinPending && !isJoinConfirming && !hasJoined) ? '#DB7A23' : '#666666',
        }}
        onMouseEnter={(e) => {
          if (isConnected && !isJoinPending && !isJoinConfirming && !hasJoined) {
            e.currentTarget.style.backgroundColor = '#E88A33';
          }
        }}
        onMouseLeave={(e) => {
          if (isConnected && !isJoinPending && !isJoinConfirming && !hasJoined) {
            e.currentTarget.style.backgroundColor = '#DB7A23';
          }
        }}
      >
        {isJoinPending || isJoinConfirming ? 'Processing...' : hasJoined ? 'Joined!' : 'CONTINUE'}
      </button>
    </div>
  );

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
        {/* Login Card */}
        <div 
          className="rounded-2xl border border-gray-700/50 p-8 shadow-xl"
          style={{ 
            backgroundColor: '#1E2022',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {showWalletConnection ? (
            renderWalletConnection()
          ) : (
            <>
              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-2 text-center">
                Welcome Back
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Sign in to your account to continue
              </p>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    placeholder="Enter your email"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    placeholder="Enter your password"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-150 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isLoading ? '#666666' : '#DB7A23',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#E88A33';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#DB7A23';
                    }
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>

                {/* Forget Password & Create Account Links */}
                <div className="flex items-center justify-between text-sm pt-2">
                  <Link 
                    href="/forgot-password"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    Forget password?
                  </Link>
                  <Link 
                    href="/signup"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    Create new account
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

