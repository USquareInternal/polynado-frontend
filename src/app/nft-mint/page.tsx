'use client';
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAccount } from 'wagmi';
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const NFTMintDashboard: React.FC = () => {
  const { isConnected } = useAccount();
  const [isMinted, setIsMinted] = useState(false);

  const proBenefits = [
    'Unlimited Advanced Analytics',
    'Priority Support Channel',
    'Early Feature Access',
    'Private Community Pass',
  ];

  const handleMint = () => {
    if (isConnected) {
      // Handle mint logic here
      setIsMinted(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Section: Exclusive Lifetime Pro NFT */}
        <div
          className="relative rounded-2xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(255,126,53,0.25)] p-8"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,140,60,0.15) 0%, rgba(255,140,60,0) 60%),' +
              'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Exclusive Lifetime Pro NFT</h2>

          {/* Shield Image Container */}
          <div className="relative flex justify-center items-center my-8">
            <div className="relative">
              <img
                src="/NFT.png"
                alt="Pro NFT Shield"
                className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(255,140,60,0.5)]"
                style={{
                  filter: isMinted ? 'brightness(1.2) saturate(1.3)' : 'brightness(0.7) saturate(0.6)',
                }}
              />
              {isMinted && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-green-500 px-6 py-2 rounded-lg transform -rotate-12 shadow-lg">
                    <span className="text-white font-bold text-lg">MINTED</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Text */}
          <div className="text-center space-y-3 mb-6">
            <p className="text-lg font-semibold text-white">One-Time Mint. Forever Access.</p>
            <p className="text-gray-300">Supply: 1/1 Remaining.</p>
          </div>

          {/* Mint Button */}
          <div className="space-y-2">
            {isMinted ? (
              <button
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 cursor-pointer relative overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  border: "none",
                  boxShadow: '3px 4px 5px 0px rgba(16, 185, 129, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                }}
              >
                Pro Access Unlocked!
              </button>
            ) : (
              <button
                onClick={handleMint}
                disabled={!isConnected}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 relative overflow-hidden ${
                  isConnected
                    ? 'cursor-pointer hover:brightness-110'
                    : 'cursor-not-allowed opacity-50'
                }`}
                style={
                  isConnected
                    ? {
                        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                        border: "none",
                        boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                      }
                    : {
                        background: '#4a4a4a',
                        border: "none",
                        color: '#9ca3af',
                      }
                }
              >
                {isConnected ? 'Mint Now' : 'Login to Mint'}
              </button>
            )}
            {!isConnected && (
              <p className="text-xs text-gray-400 text-center mt-2">
                *Connect your wallet to check eligibility.*
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Your Pro Benefits Status */}
        <div
          className="relative rounded-2xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(255,126,53,0.25)] p-8"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,140,60,0.15) 0%, rgba(255,140,60,0) 60%),' +
              'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Pro Benefits Status</h2>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 mb-8">
            {isMinted ? (
              <>
                <CheckCircleOutlined className="text-green-500 text-2xl" />
                <div>
                  <p className="text-white font-semibold">Status: ACTIVE (Minted)</p>
                </div>
              </>
            ) : (
              <>
                <CloseCircleOutlined className="text-2xl" style={{ color: '#FF494A' }} />
                <div>
                  <p className="text-[#FF494A] font-semibold">Status: Inactive (Mint to Unlock)</p>
                </div>
              </>
            )}
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            {proBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                {isMinted ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <LockOutlined className="text-gray-500 text-lg" />
                )}
                <span className={`${isMinted ? 'text-white font-medium' : 'text-gray-400'}`}>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Background Shield (Faded) */}
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <img
              src="/NFT.png"
              alt="Background Shield"
              className="w-65 h-65 object-contain rounded-xl"
              // style={{
              //   filter: isMinted ? 'brightness(1.5) saturate(1.5)' : 'brightness(0.3) saturate(0.3)',
              // }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const NFTMintPage: React.FC = () => {
  return (
    <MainLayout>
      <NFTMintDashboard />
    </MainLayout>
  );
};

export default NFTMintPage;

