// src/components/organisms/ReferralDashboard.tsx
"use client";

import React from 'react';
import { ReferralStatCard } from '@/components/molecules/ReferralStatCard';
import { ReferralLinkInput } from '@/components/molecules/ReferralLinkInput';
import { QRCodeSection } from '@/components/molecules/QRCodeSection';
import { RewardCard } from '@/components/molecules/RewardCard';
import { Heading } from '@/components/atoms/Heading';

// Define the props for the component
interface ReferralDashboardProps {
  isHomePage?: boolean; // Optional prop to indicate if it's on the home page
}

// Update the component signature to accept props
export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ isHomePage = false }) => {
  const referralLink = 'https://polynado.xyz/?ref=dave123';

  const stats = [
    { value: 12, label: 'Total Referred Users', iconType: 'users' as const },
    { value: 8, label: 'Total Mints from Referrals', iconType: 'mints' as const },
    { value: 4, label: 'Total Subscriptions', iconType: 'subscriptions' as const },
    { value: '240 USDT', label: 'Total Rewards Earned', iconType: 'rewards' as const },
  ];

  const rewardCards = [
    {
      image: '/NFT.png',
      title: 'NFT Mint Referral',
      description: 'Earn $150 for every successful NFT mint through your referral link.',
    },
    {
      image: '/image 12.png',
      title: 'Instant Tracking',
      description: 'All referrals are tracked automatically and displayed in real-time on your dashboard.',
    },
    {
      image: '/image 7.svg',
      title: 'Subscription Referral',
      description: 'Earn $50 for every subscription signup through your referral link.',
    },
  ];

  const referralEvents = [
    { id: '0x742d...A8B3', date: 'Dec 7, 2025 14:23', type: 'NFT Mint', reward: '150 USDT', status: 'Paid' },
    { id: '0x943b...C2D4', date: 'Dec 7, 2025 11:45', type: 'Subscription', reward: '250 USDT', status: 'Confirmed' },
    { id: '0x488f...E1A9', date: 'Dec 6, 2025 19:12', type: 'Subscription', reward: '250 USDT', status: 'Confirmed' },
    { id: '0x1d2c...F7B6', date: 'Dec 6, 2025 16:34', type: 'NFT Mint', reward: '150 USDT', status: 'Paid' },
    { id: '0x1d2c...45A5', date: 'Dec 5, 2025 22:18', type: 'Subscription', reward: '250 USDT', status: 'Pending' },
    { id: '0x1d2c...90Mk', date: 'Dec 5, 2025 14:58', type: 'NFT Mint', reward: '150 USDT', status: 'Pending' },
    { id: '0x1d2c...U134', date: 'Dec 4, 2025 20:41', type: 'NFT Mint', reward: '250 USDT', status: 'Paid' },
    { id: '0x1d2c...90SD', date: 'Dec 4, 2025 14:56', type: 'NFT Mint', reward: '150 USDT', status: 'Pending' },
    { id: '0x1d2c...F464', date: 'Dec 4, 2025 11:59', type: 'Subscription', reward: '150 USDT', status: 'Confirmed' },
  ];

  return (
    <section className="mt-12">
      {/* Header (Always Visible) */}
      <Heading level={2} className="mb-1 text-2xl text-white">
        Referral Dashboard
      </Heading>
      <p className="text-sm text-gray-400 mb-6">
        Share Polynado and earn rewards for every successful referral.
      </p>

      {/* Stats Cards (Always Visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map((stat, index) => (
          <ReferralStatCard
            key={index}
            value={stat.value}
            label={stat.label}
            iconType={stat.iconType}
          />
        ))}
      </div>

      {/* Conditionally Rendered Sections for /referral page */}
      {!isHomePage && (
        <>
          {/* Link + QR container */}
          <div className="mb-8 rounded-[12px] border border-[#a85a21]/60 bg-[#141516] shadow-[0_0_12px_rgba(255,140,0,0.18)] p-4 sm:p-6">
            <div className="flex flex-col gap-6">
              <ReferralLinkInput referralLink={referralLink} />

              <div className="flex items-center justify-center">
                <span className="text-gray-300 text-sm  font-semibold ">OR</span>
              </div>

              <QRCodeSection referralLink={referralLink} />
            </div>
          </div>

          {/* Referral Events Table */}
          <p className="mt-6 mb-2 text-base font-semibold text-white">Referred Users History</p>
          <div className="overflow-hidden rounded-xl border border-[#2c2f33] bg-[#0f1113] shadow-[0_0_18px_rgba(0,0,0,0.35)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-200">
                <thead>
                  <tr
                    className="text-gray-100"
                    style={{
                      background:
                        'linear-gradient(90deg, #DB7A23 0%, #000000 100%)',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <th className="px-4 py-3 text-left font-semibold">Referee ID/Wallet</th>
                    <th className="px-4 py-3 text-left font-semibold">Date Of Event</th>
                    <th className="px-4 py-3 text-left font-semibold">Event Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Reward Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Reward Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2226]">
                  {referralEvents.map((event, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-[#15181c]"
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#000000' : '#1E2022',
                      }}
                    >
                      <td className="px-4 py-3">{event.id}</td>
                      <td className="px-4 py-3 text-gray-400">{event.date}</td>
                      <td className="px-4 py-3">
                        <span className={event.type === 'NFT Mint' ? 'text-[#0fd8ff]' : 'text-[#d27cf4]'}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-200">{event.reward}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            event.status === 'Paid'
                              ? 'text-[#6edb8b]'
                              : event.status === 'Pending'
                              ? 'text-[#f7aa50]'
                              : 'text-[#ffcf68]'
                          }
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payout Request */}
          <div className="mt-6 rounded-xl border border-[#c06923] bg-[#0f1113] shadow-[0_0_18px_rgba(255,140,0,0.18)] p-6 text-center text-gray-200">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '29.67px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#FFFFFF',
              }}
            >
              Payout Request
            </p>
            <p
              className="mt-2 mb-5"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '17.34px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#FFFFFF',
              }}
            >
              Available Pending Balance (Confirmed Rewards)
            </p>
            <div className="flex justify-center mt-10 mb-5">
              <button
                className="px-6 py-2 rounded-full text-sm font-semibold text-white cursor-pointer hover:cursor-pointer relative overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                  color: "white",
                  border: "none",
                  boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  position: 'relative',
                }}
              >
                350 USDT Request Payout
              </button>
            </div>
            <p
              className="mt-4"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: 'rgba(255, 255, 255, 0.65)',
              }}
            >
              Payouts are processed within 3-5 business days
            </p>
          </div>

          {/* How to Earn Rewards Section */}
          <div className="mt-8">
            <Heading level={2} className="mb-4 text-2xl text-white">
              How to Earn Rewards
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rewardCards.map((card, index) => (
                <RewardCard
                  key={index}
                  image={card.image}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};