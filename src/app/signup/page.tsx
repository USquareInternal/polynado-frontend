'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SignupStep = 1 | 2 | 3;

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState({
    referralCode: '',
    termsAccepted: false,
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as SignupStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as SignupStep);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) {
      // Handle final submission
      console.log('Signup data:', formData);
      // Navigate to home page
      router.push('/');
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
          You must enter the referral link to continue
        </p>
      </div>

      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-2">
          Referral Link (Required)
        </label>
        <input
          id="referralCode"
          type="text"
          value={formData.referralCode}
          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
          placeholder="Enter your referral link (required)"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        />
        <p className="text-gray-400 text-xs mt-2">
          You must enter the referral link to continue
        </p>
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
        <button
          type="button"
          onClick={handleNext}
          disabled={!formData.referralCode.trim()}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
          style={{
            backgroundColor: formData.referralCode.trim() ? '#DB7A23' : '#666666',
          }}
          onMouseEnter={(e) => {
            if (formData.referralCode.trim()) {
              e.currentTarget.style.backgroundColor = '#E88A33';
            }
          }}
          onMouseLeave={(e) => {
            if (formData.referralCode.trim()) {
              e.currentTarget.style.backgroundColor = '#DB7A23';
            }
          }}
        >
         NEXT
        </button>
      </div>
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
          disabled={!formData.termsAccepted}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
          style={{
            backgroundColor: formData.termsAccepted ? '#DB7A23' : '#666666',
          }}
          onMouseEnter={(e) => {
            if (formData.termsAccepted) {
              e.currentTarget.style.backgroundColor = '#E88A33';
            }
          }}
          onMouseLeave={(e) => {
            if (formData.termsAccepted) {
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
            !Object.values(passwordRequirements).every(Boolean)
          }
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
          style={{
            backgroundColor: formData.email && formData.password && formData.password === formData.confirmPassword && Object.values(passwordRequirements).every(Boolean) ? '#DB7A23' : '#666666',
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
          CONTINUE
        </button>
      </div>
    </form>
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
        </div>
      </div>
    </div>
    </>
  );
};

export default SignupPage;

