// src/components/organisms/ReferralDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ReferralStatCard } from '@/components/molecules/ReferralStatCard';
import { ReferralLinkInput } from '@/components/molecules/ReferralLinkInput';
import { QRCodeSection } from '@/components/molecules/QRCodeSection';
import { RewardCard } from '@/components/molecules/RewardCard';
import { Heading } from '@/components/atoms/Heading';
import { getToken, getUserData } from '@/services/authService';

// Define the props for the component
interface ReferralDashboardProps {
  isHomePage?: boolean; // Optional prop to indicate if it's on the home page
}

// API Response Types
interface ReferredUser {
  _id: string;
  userId: string;
  userWallet: string;
  collectionId?: number;
  tokenId?: number;
  type?: string; // "nftMint" or "subscription"
  price?: string;
  priceInUsdt?: string;
  nftType?: string;
  referrerId: string;
  referrerWallet?: string | null;
  referralAmountInUsdt: string;
  referralPercentage?: number;
  blockNumber?: number;
  transactionHash?: string;
  expiryTimestamp?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ReferredUsersResponse {
  message: string;
  success: boolean;
  data: ReferredUser[];
}

interface ReferralStatsResponse {
  message: string;
  success: boolean;
  data: {
    referredUsers: ReferredUser[];
    referredUsersStats: {
      totalNumber: number;
      totalAmount: number | string;
      totalNFTMintUsers: number;
      totalSubscriptionUsers: number;
    };
  };
}

// Table Event Type
interface ReferralEvent {
  id: string;
  date: string;
  type: string;
  reward: string;
  status: string;
}

// Update the component signature to accept props
export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ isHomePage = false }) => {
  const [referralEvents, setReferralEvents] = useState<ReferralEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState([
    { value: 0, label: 'Total Referred Users', iconType: 'users' as const },
    { value: 0, label: 'Total Mints from Referrals', iconType: 'mints' as const },
    { value: 0, label: 'Total Subscriptions', iconType: 'subscriptions' as const },
    { value: '0 USDT', label: 'Total Rewards Earned', iconType: 'rewards' as const },
  ]);
  
  // Get userId from userData for referral link
  useEffect(() => {
    const userData = getUserData() as any;
    const userId = userData?.userId || '';
    if (userId) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://polynado.xyz';
      setReferralLink(`${baseUrl}/signup?ref=${userId}`);
    } else {
      setReferralLink('');
    }
  }, []);

  const rewardCards = [
    {
      image: '/NFT.png',
      title: 'NFT Mint Referral',
      description: 'Earn $150 for every successful NFT mint through your referral link.',
    },
    {
      image: '/NFT.png',
      title: 'Instant Tracking',
      description: 'All referrals are tracked automatically and displayed in real-time on your dashboard.',
    },
    {
      image: '/NFT.png',
      title: 'Subscription Referral',
      description: 'Earn $50 for every subscription signup through your referral link.',
    },
  ];

  // Convert wei to USDT (assuming 18 decimals) or format already converted USDT values
  const formatRewardAmount = (amount: number | string): string => {
    // Convert to number for comparison
    const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // If the value is already in USDT format (small number or decimal), format it directly
    // We consider values less than 1e12 (1 trillion) as already in USDT format
    if (numValue < 1e12) {
      return `${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    }
    
    // Otherwise, treat it as wei format and convert
    try {
      const weiAmount = typeof amount === 'string' ? BigInt(amount) : BigInt(Math.floor(amount));
      const decimals = 18;
      const divisor = BigInt(10 ** decimals);
      const whole = weiAmount / divisor;
      const remainder = weiAmount % divisor;
      
      if (remainder === BigInt(0)) {
        return `${whole.toString()} USDT`;
      } else {
        const remainderStr = remainder.toString().padStart(decimals, '0');
        const trimmedRemainder = remainderStr.replace(/0+$/, '');
        const decimalValue = parseFloat(`0.${trimmedRemainder}`);
        const totalValue = Number(whole) + decimalValue;
        return `${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
      }
    } catch (error) {
      // Fallback: if BigInt conversion fails, just format as is
      return `${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Determine reward status based on referralRewards
  const getRewardStatus = (referralRewards: number | string): string => {
    const amount = typeof referralRewards === 'string' ? BigInt(referralRewards) : BigInt(referralRewards);
    // If rewards > 0, consider it as "Paid", otherwise "Pending"
    return amount > BigInt(0) ? 'Paid' : 'Pending';
  };

  // Fetch referred users and stats from API
  useEffect(() => {
    const fetchReferredUsers = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        
        if (!token) {
          console.error('No authentication token found');
          setIsLoading(false);
          return;
        }

        const response = await fetch('https://polynado-backend.onrender.com/api/referral/referred-users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch referred users: ${response.statusText}`);
        }

        const responseData: ReferralStatsResponse = await response.json();
        console.log("responseData", responseData);
        
        // Check if response is successful and has data
        if (!responseData.success || !responseData.data) {
          throw new Error('Invalid API response structure');
        }

        const data = responseData.data;
        console.log("data", data);
        console.log("referredUsers array:", data.referredUsers);
        console.log("referredUsers length:", data.referredUsers?.length);
        
        // Update stats from API response
        if (data.referredUsersStats) {
          const statsData = data.referredUsersStats;
          const formattedTotalAmount = formatRewardAmount(statsData.totalAmount);
          
          setStats([
            { value: statsData.totalNumber, label: 'Total Referred Users', iconType: 'users' as const },
            { value: statsData.totalNFTMintUsers, label: 'Total Mints from Referrals', iconType: 'mints' as const },
            { value: statsData.totalSubscriptionUsers, label: 'Total Subscriptions', iconType: 'subscriptions' as const },
            { value: formattedTotalAmount, label: 'Total Rewards Earned', iconType: 'rewards' as const },
          ]);
        }

        // Update referral events from referredUsers array
        if (data.referredUsers && Array.isArray(data.referredUsers)) {
          console.log("Processing referredUsers, count:", data.referredUsers.length);
          
          // Sort by date (newest first) - sort by createdAt before mapping
          const sortedData = [...data.referredUsers].sort((a, b) => {
            try {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } catch (error) {
              console.error('Error sorting by date:', error, { a, b });
              return 0;
            }
          });
          
          console.log("sortedData:", sortedData);
          
          // Map sorted data to events
          const events: ReferralEvent[] = sortedData.map((user, index) => {
            try {
              console.log(`Processing user ${index}:`, user);
              
              // Determine event type based on type field, nftType, or collectionId
              let eventType = 'User Registration';
              if (user.type === 'nftMint') {
                if (user.nftType) {
                  eventType = `NFT Mint (${user.nftType})`;
                } else if (user.collectionId) {
                  eventType = user.collectionId === 1 ? 'NFT Mint (Standard)' : user.collectionId === 2 ? 'NFT Mint (Pro)' : 'NFT Mint';
                } else {
                  eventType = 'NFT Mint';
                }
              } else if (user.type === 'subscription') {
                eventType = 'Subscription';
              } else if (user.nftType) {
                eventType = `NFT Mint (${user.nftType})`;
              } else if (user.collectionId) {
                eventType = user.collectionId === 1 ? 'NFT Mint (Standard)' : user.collectionId === 2 ? 'NFT Mint (Pro)' : 'NFT Mint';
              }
              
              // Format reward amount - handle both wei format and decimal string format
              let rewardAmount = '0 USDT';
              if (user.referralAmountInUsdt) {
                rewardAmount = formatRewardAmount(user.referralAmountInUsdt);
              }
              
              // Determine status based on referralAmountInUsdt
              const amountValue = parseFloat(String(user.referralAmountInUsdt || '0'));
              const rewardStatus = amountValue > 0 ? 'Paid' : 'Pending';
              
              const event = {
                id: user.userWallet || user.userId || 'N/A',
                date: formatDate(user.createdAt),
                type: eventType,
                reward: rewardAmount,
                status: rewardStatus,
              };
              
              console.log(`Created event ${index}:`, event);
              return event;
            } catch (error) {
              console.error(`Error processing user ${index}:`, error, user);
              // Return a fallback event instead of breaking the entire mapping
              return {
                id: user.userWallet || user.userId || 'N/A',
                date: user.createdAt ? formatDate(user.createdAt) : 'N/A',
                type: 'Unknown',
                reward: '0 USDT',
                status: 'Pending',
              };
            }
          });
          
          console.log("Final events array:", events);
          console.log("Events length:", events.length);
          setReferralEvents(events);
        } else {
          console.warn("referredUsers is not an array or is missing:", data.referredUsers);
          setReferralEvents([]);
        }
      } catch (error) {
        console.error('Error fetching referred users:', error);
        // Keep empty array on error
        setReferralEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isHomePage) {
      fetchReferredUsers();
    }
  }, [isHomePage]);

  return (
    <section className="mt-12">
      {/* Header (Always Visible) */}
      <Heading level={2} className="mb-1 text-2xl text-white">
        Referral Dashboard
      </Heading>
      <p className="text-sm text-gray-400 mb-6">
      Share Polynado and earn rewards
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Loading referred users...
                      </td>
                    </tr>
                  ) : referralEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No referred users found.
                      </td>
                    </tr>
                  ) : (
                    referralEvents.map((event, idx) => (
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
                          <span className={
                            event.type.includes('NFT Mint') 
                              ? 'text-[#0fd8ff]' 
                              : event.type === 'Subscription' 
                              ? 'text-[#d27cf4]' 
                              : 'text-[#f7aa50]'
                          }>
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
                    ))
                  )}
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
                {(() => {
                  const totalRewardsStat = stats.find(stat => stat.label === 'Total Rewards Earned');
                  const rewardValue = totalRewardsStat?.value || '0 USDT';
                  const displayValue = typeof rewardValue === 'string' ? rewardValue : `${rewardValue} USDT`;
                  return `${displayValue} Request Payout`;
                })()}
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