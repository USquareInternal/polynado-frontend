'use client';
import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts/MainLayout';
import { CheckOutlined, CrownOutlined, ThunderboltOutlined } from '@ant-design/icons';

const SubscriptionPage: React.FC = () => {
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
        style={{ 
          backgroundColor: '#000000',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(219, 122, 35, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(219, 122, 35, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, rgba(30, 32, 34, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)
          `
        }}
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
                </div>

                {/* CTA Button */}
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
                    <span className="text-4xl font-bold text-orange-400">$20/m</span>
                  </div>
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
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }}
                >
                  Choose Standard
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
              {/* Best Value Badge */}
              <div className="absolute top-4 right-4">
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

              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Subscription</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-orange-400">$100/m</span>
                  </div>
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
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }}
                >
                  Go Pro
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

