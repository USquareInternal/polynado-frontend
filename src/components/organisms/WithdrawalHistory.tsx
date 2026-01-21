// src/components/organisms/WithdrawalHistory.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Heading } from '@/components/atoms/Heading';
import { getToken } from '@/services/authService';
import { WalletOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '@/config/apiConfig';

interface Withdrawal {
  _id: string;
  date: string;
  amount: string;
  status: 'Completed' | 'Processing';
}

interface WithdrawalHistoryResponse {
  message: string;
  success: boolean;
  data: Withdrawal[];
}

export const WithdrawalHistory: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [totalRewards, setTotalRewards] = useState<string>('0 USDT');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch withdrawal history
  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError('Please login to view withdrawal history');
          setIsLoading(false);
          return;
        }

        // TODO: Replace with actual API endpoint when available
        // For now, using mock data structure
        const response = await fetch(API_ENDPOINTS.WITHDRAWAL.HISTORY, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // No withdrawal history found
            setWithdrawals([]);
            setTotalRewards('0 USDT');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch withdrawal history');
        }

        const data: WithdrawalHistoryResponse = await response.json();
        
        if (data.success && data.data) {
          // Sort by date (newest first)
          const sorted = [...data.data].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setWithdrawals(sorted);
          
          // Calculate total rewards
          const total = sorted.reduce((sum, w) => sum + parseFloat(w.amount), 0);
          setTotalRewards(`${total} USDT`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching withdrawal history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawalHistory();
  }, []);

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

  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <Heading level={2} className="mb-1 text-2xl text-white">
            Withdrawal History
          </Heading>
          <p className="text-sm text-gray-400">
            Track all your reward withdrawals and their status.
          </p>
        </div>

        {/* Total Rewards Earned Card */}
        <div 
          className="rounded-xl border border-[#DB7A23] bg-[#0f1113] shadow-[0_0_18px_rgba(255,140,0,0.18)] p-4 flex items-center gap-3"
          style={{ minWidth: '200px' }}
        >
          <div className="flex-shrink-0">
            <WalletOutlined className="text-2xl text-[#DB7A23]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Rewards Earned</p>
            <p className="text-xl font-bold text-white">{totalRewards}</p>
          </div>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="overflow-hidden rounded-xl border border-[#2c2f33] bg-[#0f1113] shadow-[0_0_18px_rgba(0,0,0,0.35)]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Loading withdrawal history...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            {error}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <WalletOutlined className="text-4xl text-gray-600" />
              <div>
                <p className="text-lg font-semibold text-gray-300 mb-1">
                  No Withdrawal History Found
                </p>
                <p className="text-sm text-gray-500">
                  You haven't made any withdrawals yet. Your withdrawal history will appear here once you request a payout.
                </p>
              </div>
            </div>
          </div>
        ) : (
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
                  <th className="px-4 py-3 text-left font-semibold">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Withdrawal Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Withdrawal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2226]">
                {withdrawals.map((withdrawal, idx) => (
                  <tr
                    key={withdrawal._id}
                    className="transition-colors hover:bg-[#15181c]"
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#000000' : '#1E2022',
                    }}
                  >
                    <td className="px-4 py-3 text-gray-400">{formatDate(withdrawal.date)}</td>
                    <td className="px-4 py-3 text-gray-200">{withdrawal.amount} USDT</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          withdrawal.status === 'Completed'
                            ? 'text-[#6edb8b]'
                            : withdrawal.status === 'Processing'
                            ? 'text-[#f7aa50]'
                            : 'text-[#ffcf68]'
                        }
                      >
                        {withdrawal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Processing Time Info */}
      <div className="mt-6 rounded-xl border border-[#c06923] bg-[#0f1113] shadow-[0_0_18px_rgba(255,140,0,0.18)] p-6">
        <div className="flex items-start gap-3">
          <ExclamationCircleOutlined className="text-xl text-[#DB7A23] flex-shrink-0 mt-1" />
          <div>
            <p className="text-base font-semibold text-white mb-2">Processing Time</p>
            <p className="text-sm text-gray-400">
              Withdrawals are typically processed within 3-5 business days. You'll receive a confirmation email once your withdrawal is completed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

