'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyForgotPasswordOtp } from '@/services/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const FP_EMAIL_KEY = 'forgotPasswordEmail';
const FP_RESET_TOKEN_KEY = 'forgotPasswordResetToken';

const ForgotPasswordVerifyPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load email from sessionStorage; if missing, redirect to step 1
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedEmail = sessionStorage.getItem(FP_EMAIL_KEY);
    if (!storedEmail) {
      router.replace('/forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      showErrorToast('Please enter the OTP');
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyForgotPasswordOtp(email.trim(), otp.trim());
      if (typeof window !== 'undefined') {
        if (response.resetToken) {
          sessionStorage.setItem(FP_RESET_TOKEN_KEY, response.resetToken);
        } else {
          throw new Error('Reset token not received from server');
        }
      }
      showSuccessToast('OTP verified. Proceed to reset password.');
      router.push('/forgot-password/reset');
    } catch (error: any) {
      showErrorToast(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div 
          className="rounded-2xl border border-gray-700/50 p-8 shadow-xl"
          style={{ 
            backgroundColor: '#1E2022',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Verify OTP
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Step 2 of 3: Enter the OTP sent to <span className="text-white font-semibold">{email || 'your email'}</span>.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                placeholder="Enter the OTP"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              />
            </div>

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
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between text-sm pt-2">
              <Link 
                href="/forgot-password"
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                Back to Email
              </Link>
              <Link 
                href="/login"
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordVerifyPage;

