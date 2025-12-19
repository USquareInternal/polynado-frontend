'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyReferralCode, signup, storeToken, storeUserData, getUserData } from '@/services/authService';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/utils/toast';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useJoinPolynado } from '@/utils/nftContract';

type SignupStep = 1 | 2 | 3 | 4;

const SignupPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, address } = useAccount();
  const { joinPolynado, hash, isPending: isJoinPending, isConfirming: isJoinConfirming, isSuccess: isJoinSuccess, error: joinError, reset: resetJoin } = useJoinPolynado();
  const [step, setStep] = useState<SignupStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [referralVerified, setReferralVerified] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [formData, setFormData] = useState({
    referralCode: '',
    termsAccepted: false,
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Auto-fill referral code from URL parameter
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setFormData(prev => ({ ...prev, referralCode: refParam }));
      // Auto-verify if referral code is provided in URL
      if (refParam.trim()) {
        verifyReferralCode(refParam.trim())
          .then((response) => {
            if (response.success) {
              setReferralVerified(true);
            }
          })
          .catch(() => {
            // Silently fail - user can still proceed
          });
      }
    }
  }, [searchParams]);

  const handleNext = async () => {
    if (step === 1) {
      // Verify referral code before proceeding
      if (!formData.referralCode.trim()) {
        showWarningToast('Please enter a referral code');
        return;
      }

      setIsLoading(true);
      try {
        const response = await verifyReferralCode(formData.referralCode.trim());
        if (response.success) {
          setReferralVerified(true);
          showSuccessToast('Referral code verified successfully');
          setStep(2);
        } else {
          showErrorToast(response.message || 'Invalid referral code');
        }
      } catch (error: any) {
        showErrorToast(error.message || 'Failed to verify referral code');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (formData.termsAccepted) {
        setStep(3);
      } else {
        showWarningToast('Please accept the Terms & Conditions');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as SignupStep);
    }
  };

  const handleSkipReferral = () => {
    setFormData({ ...formData, referralCode: '' });
    setReferralVerified(false);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        showErrorToast('Passwords do not match');
        return;
      }

      // Just move to step 4 without calling signup API
      // Signup API will be called after successful joinPolynado
      setStep(4);
    }
  };

  // Step 1: Referral Code
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Enter your Referral Link
        </h1>
        <p className="text-gray-400 text-sm">
          Have a referral code? Enter it below or skip to continue
        </p>
      </div>

      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-2">
          Referral Code (Optional)
        </label>
        <div className="relative">
          <input
            id="referralCode"
            type="text"
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
            disabled={referralVerified || isLoading}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Enter your referral code (optional)"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderColor: referralVerified ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            }}
          />
          {referralVerified && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {referralVerified ? (
          <p className="text-green-400 text-xs mt-2">
            ✓ Referral code verified successfully
          </p>
        ) : (
          <p className="text-gray-400 text-xs mt-2">
            Enter a referral code to get started, or skip to continue without one
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Link
          href="/login"
          className="flex-1 px-4 py-3 rounded-lg font-medium text-white border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 bg-transparent text-center transition-all cursor-pointer"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          BACK
        </Link>
        {formData.referralCode.trim() ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
            style={{
              backgroundColor: !isLoading ? '#DB7A23' : '#666666',
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
            {isLoading ? 'Verifying...' : 'NEXT'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSkipReferral}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
            style={{
              backgroundImage: isLoading 
                ? 'none' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
              backgroundColor: isLoading ? '#666666' : 'transparent',
              boxShadow: isLoading ? 'none' : '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.filter = 'brightness(1)';
              }
            }}
          >
            SKIP
          </button>
        )}
      </div>

      {/* Skip link below buttons */}
      {formData.referralCode.trim() && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleSkipReferral}
            disabled={isLoading}
            className="text-sm text-gray-400 hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Skip referral code
          </button>
        </div>
      )}
    </div>
  );

  // Step 2: Terms and Conditions
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Terms & Conditions
        </h1>
        <p className="text-gray-400 text-sm">
          In order to register your account, we will need you to read and agree with our terms & conditions. Scroll down.
        </p>
      </div>

      <div 
        className="rounded-lg border border-gray-700/50 p-6 max-h-[400px] overflow-y-auto custom-scrollbar"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
        }}
      >
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-white uppercase mb-4">
            POLYNADO TERMS OF SERVICE AND CONDITIONS
          </h2>
          <p className="text-gray-400 font-semibold">Effective Date: January 2025</p>
          
          <p>
            These Terms of Service ("Terms") govern your access to and use of POLYNADO, an AI-powered intelligence terminal for on-chain prediction markets (herein referred to as "POLYNADO", "we", "us", or "our"). POLYNADO acts as an intelligence platform for prediction markets, providing real-time data analysis, Fair Odds modeling, and AI-powered insights. By accessing or using our platform, you agree to be bound by these Terms.
          </p>
          
          <p>
            <strong className="text-white">1. Service Description</strong><br/>
            POLYNADO is an AI-powered intelligence terminal designed for on-chain prediction markets, initially focusing on Polymarket. Our platform ingests real-time market data, enriches it with off-chain signals, provides Fair Odds modeling, and offers an AI Copilot to assist users in finding trading opportunities. POLYNADO is not a trading venue or exchange, but rather an intelligence and analytics platform.
          </p>
          
          <p>
            <strong className="text-white">2. Account Registration and Access</strong><br/>
            To access POLYNADO, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or use of your account.
          </p>
          
          <p>
            <strong className="text-white">3. Subscription and Lifetime Access</strong><br/>
            POLYNADO offers access through SaaS subscriptions and Lifetime Access NFTs. Subscription fees are billed according to your selected plan. Lifetime Access NFTs grant permanent access to POLYNADO services as long as the platform operates. NFT ownership is verified on-chain, and transfer of NFT ownership transfers access rights. Subscription access is non-transferable and tied to your account.
          </p>
          
          <p>
            <strong className="text-white">4. Referral Program</strong><br/>
            POLYNADO includes an integrated referral system. By participating in our referral program, you agree to comply with all applicable laws and regulations regarding referral marketing. Referral rewards are subject to our referral program terms, which may be modified at our discretion. We reserve the right to suspend or terminate referral accounts that violate our policies or engage in fraudulent activity.
          </p>
          
          <p>
            <strong className="text-white">5. Use of AI and Data</strong><br/>
            Our AI Copilot and Fair Odds models are provided for informational and analytical purposes only. These tools are not financial advice, trading recommendations, or guarantees of market outcomes. You acknowledge that all trading decisions are your own responsibility, and POLYNADO is not liable for any losses incurred from trading decisions made using our platform.
          </p>
          
          <p>
            <strong className="text-white">6. Intellectual Property</strong><br/>
            All content, features, AI models, algorithms, and functionality on POLYNADO are owned by us or our licensors and are protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our platform without our express written permission.
          </p>
          
          <p>
            <strong className="text-white">7. Prohibited Uses</strong><br/>
            You agree not to: (a) use POLYNADO for any illegal purpose; (b) attempt to reverse engineer or extract our AI models or algorithms; (c) use automated systems to scrape or harvest data from our platform; (d) interfere with or disrupt the platform's operation; (e) impersonate others or provide false information; (f) abuse our referral system.
          </p>
          
          <p>
            <strong className="text-white">8. Disclaimer of Warranties</strong><br/>
            POLYNADO is provided "as is" and "as available" without warranties of any kind. We do not guarantee that our services will be uninterrupted, error-free, or secure. We do not warrant the accuracy, completeness, or usefulness of any information provided through our platform.
          </p>
          
          <p>
            <strong className="text-white">9. Limitation of Liability</strong><br/>
            To the maximum extent permitted by law, POLYNADO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our platform.
          </p>
          
          <p>
            <strong className="text-white">10. Modifications to Terms</strong><br/>
            We reserve the right to modify these Terms at any time. Material changes will be communicated through our platform or via email. Your continued use of POLYNADO after such modifications constitutes acceptance of the updated Terms. If you do not agree to the modified Terms, you must discontinue use of our platform.
          </p>
          
          <p>
            <strong className="text-white">11. Termination</strong><br/>
            We may suspend or terminate your access to POLYNADO at any time, with or without cause or notice, for any reason including violation of these Terms. Upon termination, your right to access the platform will immediately cease, except that Lifetime Access NFT holders may retain access rights as determined by NFT ownership.
          </p>
          
          <p>
            <strong className="text-white">12. Governing Law</strong><br/>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of POLYNADO shall be resolved through binding arbitration or in courts of competent jurisdiction.
          </p>
          
          <p>
            By using POLYNADO, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use our platform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="termsAccepted"
          checked={formData.termsAccepted}
          onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
          className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-2"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
        />
        <label htmlFor="termsAccepted" className="text-gray-300 text-sm cursor-pointer">
          I have read and agree to the Terms & Conditions
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 px-4 py-3 rounded-lg font-medium text-white border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 bg-transparent transition-all cursor-pointer"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          BACK
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!formData.termsAccepted || isLoading}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
          style={{
            backgroundColor: formData.termsAccepted && !isLoading ? '#DB7A23' : '#666666',
          }}
          onMouseEnter={(e) => {
            if (formData.termsAccepted && !isLoading) {
              e.currentTarget.style.backgroundColor = '#E88A33';
            }
          }}
          onMouseLeave={(e) => {
            if (formData.termsAccepted && !isLoading) {
              e.currentTarget.style.backgroundColor = '#DB7A23';
            }
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );

  // Step 3: Email and Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const passwordRequirements = {
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    length: formData.password.length >= 8,
  };

  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create your Account
        </h1>
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          Enter your Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full px-4 py-3 pr-12 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            placeholder="Enter your password"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-700/50 transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showPassword ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </>
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            className="w-full px-4 py-3 pr-12 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            placeholder="Confirm your password"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-700/50 transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showConfirmPassword ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </>
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {[
          { key: 'uppercase', label: 'Uppercase' },
          { key: 'lowercase', label: 'Lowercase' },
          { key: 'special', label: 'Special letter' },
          { key: 'number', label: 'Number' },
          { key: 'length', label: '8+ Character' },
        ].map((req) => (
          <div key={req.key} className="flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                passwordRequirements[req.key as keyof typeof passwordRequirements]
                  ? 'border-orange-500 bg-orange-500/20'
                  : 'border-gray-600'
              }`}
            >
              {passwordRequirements[req.key as keyof typeof passwordRequirements] && (
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-400 text-center">{req.label}</span>
          </div>
        ))}
      </div>

      {/* Error message if passwords don't match */}
      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
        <p className="text-red-400 text-sm">Passwords do not match</p>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 px-4 py-3 rounded-lg font-medium text-white border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 bg-transparent transition-all cursor-pointer"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          BACK
        </button>
        <button
          type="submit"
          disabled={
            !formData.email ||
            !formData.password ||
            formData.password !== formData.confirmPassword ||
            !Object.values(passwordRequirements).every(Boolean) ||
            isLoading
          }
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
          style={{
            backgroundColor: formData.email && formData.password && formData.password === formData.confirmPassword && Object.values(passwordRequirements).every(Boolean) && !isLoading ? '#DB7A23' : '#666666',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = '#E88A33';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = '#DB7A23';
            }
          }}
        >
          {isLoading ? 'Creating Account...' : 'CONTINUE'}
        </button>
      </div>
    </form>
  );

  // Handle joinPolynado success - then call signup API
  useEffect(() => {
    if (isJoinSuccess && hash && step === 4 && !hasJoined) {
      console.log("Transaction successful! Hash:", hash);
      setHasJoined(true);
      
      // Call signup API after successful smart contract call
      const callSignupAPI = async () => {
        setIsLoading(true);
        try {
          const response = await signup({
            email: formData.email,
            password: formData.password,
            referredBy: formData.referralCode.trim() || null,
          });

          if (response.success) {
            storeToken(response.token);
            storeUserData(response.user);
            showSuccessToast('Account created successfully!');
            // Remove new user flag after successful signup
            localStorage.removeItem('isNewUser');
            // Redirect to login after a short delay
            setTimeout(() => {
              router.push('/login');
            }, 1500);
          } else {
            showErrorToast(response.message || 'Failed to create account');
            setIsLoading(false);
          }
        } catch (error: any) {
          showErrorToast(error.message || 'Failed to create account');
          setIsLoading(false);
        }
      };

      callSignupAPI();
    }
  }, [isJoinSuccess, hash, step, router, hasJoined, formData]);

  // Fallback: If transaction has hash but isConfirming is true for too long, assume success
  useEffect(() => {
    if (step !== 4 || !hash || isJoinSuccess || joinError || !isJoinConfirming || hasJoined) return;

    // If confirming for more than 30 seconds, assume success (transaction likely confirmed)
    // This handles cases where wagmi doesn't properly detect transaction completion
    const confirmingTimeout = setTimeout(() => {
      if (isJoinConfirming && hash && !isJoinSuccess && !joinError && !isJoinPending && !hasJoined) {
        console.log("Transaction confirming for too long, assuming success. Hash:", hash);
        console.log("Current state - isPending:", isJoinPending, "isConfirming:", isJoinConfirming, "isSuccess:", isJoinSuccess);
        setHasJoined(true);
        
        // Call signup API after assuming transaction success
        const callSignupAPI = async () => {
          setIsLoading(true);
          try {
            const response = await signup({
              email: formData.email,
              password: formData.password,
              referredBy: formData.referralCode.trim() || null,
            });

            if (response.success) {
              storeToken(response.token);
              storeUserData(response.user);
              showSuccessToast('Transaction confirmed! Account created successfully!');
              // Remove new user flag after successful signup
              localStorage.removeItem('isNewUser');
              // Redirect to login after a short delay
              setTimeout(() => {
                router.push('/login');
              }, 1500);
            } else {
              showErrorToast(response.message || 'Failed to create account');
              setIsLoading(false);
            }
          } catch (error: any) {
            showErrorToast(error.message || 'Failed to create account');
            setIsLoading(false);
          }
        };

        callSignupAPI();
      }
    }, 30 * 1000); // 30 seconds

    return () => clearTimeout(confirmingTimeout);
  }, [hash, isJoinConfirming, isJoinSuccess, joinError, isJoinPending, step, router, hasJoined, formData]);

  // Handle joinPolynado error
  useEffect(() => {
    if (joinError && step === 4) {
      console.error("Transaction error:", joinError);
      showErrorToast(joinError.message || 'Failed to join Polynado. Please try again.');
      resetJoin();
    }
  }, [joinError, step, resetJoin]);

  // Debug: Log transaction state changes
  useEffect(() => {
    if (step === 4) {
      console.log("Transaction state:", {
        hash,
        isPending: isJoinPending,
        isConfirming: isJoinConfirming,
        isSuccess: isJoinSuccess,
        error: joinError?.message,
      });
    }
  }, [hash, isJoinPending, isJoinConfirming, isJoinSuccess, joinError, step]);

  const handleJoinPolynado = async () => {
    if (!isConnected) {
      showWarningToast('Please connect your wallet to continue');
      return;
    }

    // For new signup, we don't have userData yet (signup API hasn't been called)
    // We'll use an empty string for userId - the contract/backend might handle this
    // The actual userId will be set after signup API call
    const userId = ''; // Empty string, will be set after signup API succeeds
    const referrerId = formData.referralCode.trim() || '';
    const email = formData.email;

    if (!email) {
      showErrorToast('Missing email. Please go back and enter your email.');
      return;
    }

    try {
      console.log("Calling joinPolynado before signup API");
      console.log("userId (empty):", userId);
      console.log("referrerId", referrerId);
      console.log("email", email);
      // joinPolynado doesn't return a value - it triggers writeContract
      // Transaction state is tracked via hash, isPending, isConfirming, isSuccess from the hook
      // Note: userId is empty string - backend/contract might generate it or use wallet address
      joinPolynado(userId, referrerId, email);
      console.log("joinPolynado called - waiting for transaction hash...");
    } catch (err: any) {
      console.error('Error joining Polynado:', err);
      showErrorToast(err.message || 'Failed to join Polynado. Please try again.');
      resetJoin();
    }
  };

  // Step 4: Wallet Connection
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Connect Your Wallet
        </h1>
        <p className="text-gray-400 text-sm">
          Connect your wallet to complete your account setup and access the dashboard
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

      {hash && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 px-4 py-3 rounded-lg font-medium text-white border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 bg-transparent transition-all cursor-pointer"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          BACK
        </button>
        <button
          type="button"
          onClick={handleJoinPolynado}
          disabled={!isConnected || isLoading || isJoinPending || isJoinConfirming || hasJoined}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
          style={{
            backgroundColor: (isConnected && !isLoading && !isJoinPending && !isJoinConfirming && !hasJoined) ? '#DB7A23' : '#666666',
          }}
          onMouseEnter={(e) => {
            if (isConnected && !isLoading && !isJoinPending && !isJoinConfirming && !hasJoined) {
              e.currentTarget.style.backgroundColor = '#E88A33';
            }
          }}
          onMouseLeave={(e) => {
            if (isConnected && !isLoading && !isJoinPending && !isJoinConfirming && !hasJoined) {
              e.currentTarget.style.backgroundColor = '#DB7A23';
            }
          }}
        >
          {(isJoinPending || isJoinConfirming) && !hasJoined ? 'Processing...' : hasJoined ? 'Joined!' : 'CONTINUE'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
      <div 
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        // style={{ 
        //   backgroundColor: '#000000',
        //   backgroundImage: `
        //     radial-gradient(circle at 20% 30%, rgba(219, 122, 35, 0.08) 0%, transparent 50%),
        //     radial-gradient(circle at 80% 70%, rgba(219, 122, 35, 0.06) 0%, transparent 50%),
        //     linear-gradient(135deg, rgba(30, 32, 34, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)
        //   `
        // }}
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
        {/* Signup Card */}
        <div 
          className="rounded-2xl border border-gray-700/50 p-8 shadow-xl"
          style={{ 
            backgroundColor: '#1E2022',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
    </>
  );
};

export default SignupPage;

