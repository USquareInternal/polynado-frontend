// src/services/portfolioService.ts

import { API_ENDPOINTS } from '@/config/apiConfig';
import { getToken } from './authService';

export interface Market {
  title: string;
  icon?: string;
}

export interface BetData {
  market: Market;
  yourPick: string;
  entryPrice: number;
  currentPrice: number;
  profitLoss: number;
  status: 'ACTIVE' | 'WIN' | 'LOSS';
}

export interface PortfolioResponse {
  message: string;
  success: boolean;
  data: {
    wallet: string;
    winRate: number;
    totalBets: number;
    totalValue: number;
    realizedPnL: number;
    unrealizedPnL: number;
    activeBets: BetData[];
    closedBets: BetData[];
    categoryExposure: Record<string, number>;
    pnlHistory: any[];
  };
}

/**
 * Fetches portfolio data for a given wallet address
 */
export const fetchPortfolio = async (walletAddress: string): Promise<PortfolioResponse['data']> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.PORTFOLIO.GET("0x23cb796cf58Bfa12352F0164f479deedbd50658E"), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio: ${response.status} ${response.statusText}`);
    }

    const data: PortfolioResponse = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid API response structure');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
};

