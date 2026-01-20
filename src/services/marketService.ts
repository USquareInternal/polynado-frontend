// src/services/marketService.ts

import { API_ENDPOINTS } from '@/config/apiConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://polynado-backend-testnet.onrender.com';

// BSC Chain IDs (Mainnet: 56, Testnet: 97)
const BSC_CHAIN_IDS = [56, 97];

export interface MarketData {
  id: string;
  question: string;
  category?: string;
  liquidityNum?: number;
  volumeNum?: number;
  oneDayPriceChange?: number;
  outcomePrices?: string | number[]; // Can be JSON string array or actual array
  price?: number;
  priceChange?: number;
  polynadoFair?: number;
  edge?: number;
  momentum?: number[];
  volume24h?: string;
  openInterest?: string;
  yesPercentage?: number;
  noPercentage?: number;
  yesPrice?: number;
  yesPay?: string;
  noPay?: string;
  volume?: string | number;
  liquidity?: string | number;
  change?: string;
}

export interface MarketsResponse {
  success: boolean;
  message?: string;
  data?: MarketData[];
  markets?: MarketData[];
}

// PancakeSwap market response structure
interface PancakeMarketData {
  id: string;
  pancakeId: string;
  question: string;
  slug: string;
  yesPrice: number;
  yesPercentage: number;
  volume: number;
  openInterest: number;
  action: string;
  currentPrice: number;
  status: string;
  endDate: string;
  outcomes: string[];
  outcomePrices: number[];
  liquidity: number;
  createdAt: string;
  updatedAt: string;
}

interface PancakeMarketsResponse {
  message: string;
  success: boolean;
  data: PancakeMarketData[];
}

/**
 * Maps PancakeSwap market data to MarketData format
 */
const mapPancakeToMarketData = (pancakeMarket: PancakeMarketData): MarketData => {
  // Calculate noPrice from yesPrice
  const noPrice = 1 - pancakeMarket.yesPrice;
  const noPercentage = 100 - pancakeMarket.yesPercentage;
  
  return {
    id: pancakeMarket.id,
    question: pancakeMarket.question,
    category: 'PancakeSwap', // Default category for PancakeSwap markets
    yesPrice: pancakeMarket.yesPrice,
    yesPercentage: pancakeMarket.yesPercentage,
    noPercentage: noPercentage,
    outcomePrices: pancakeMarket.outcomePrices || [pancakeMarket.yesPrice, noPrice],
    volume: pancakeMarket.volume,
    volumeNum: pancakeMarket.volume,
    liquidity: pancakeMarket.liquidity,
    liquidityNum: pancakeMarket.liquidity,
    openInterest: pancakeMarket.openInterest.toString(),
    price: pancakeMarket.currentPrice,
  };
};

/**
 * Fetches all markets from the Polynado backend API
 */
export const fetchMarkets = async (): Promise<MarketData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/markets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.statusText}`);
    }

    const data: MarketsResponse = await response.json();

    // Handle different response structures
    if (data.success && data.data) {
      return data.data;
    } else if (data.success && data.markets) {
      return data.markets;
    } else if (Array.isArray(data)) {
      return data as MarketData[];
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching markets:', error);
    throw error;
  }
};

/**
 * Fetches markets through the Next.js API route (proxy)
 * @param chainId Optional chain ID to determine which API to use (BSC uses pancake-markets)
 */
export const fetchMarketsViaProxy = async (chainId?: number): Promise<MarketData[]> => {
  try {
    // Build query string with chainId if provided
    const queryParams = chainId ? `?chainId=${chainId}` : '';
    const response = await fetch(`/api/markets${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.statusText}`);
    }

    const data: MarketsResponse | PancakeMarketsResponse = await response.json();

    // Log the response received by the client
    console.log('=== Markets API Response (Client-side) ===');
    console.log('Chain ID:', chainId);
    console.log('Full response:', JSON.stringify(data, null, 2));
    console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);

    // Handle different response structures
    let markets: MarketData[] = [];
    
    // Check if it's a PancakeSwap response
    if ('success' in data && data.success && 'data' in data && Array.isArray(data.data)) {
      const pancakeData = data as PancakeMarketsResponse;
      // Check if first item has pancakeId (PancakeSwap format)
      if (pancakeData.data.length > 0 && 'pancakeId' in pancakeData.data[0]) {
        // Map PancakeSwap markets to MarketData format
        markets = pancakeData.data.map(mapPancakeToMarketData);
        console.log('PancakeSwap markets mapped:', markets.length);
      } else {
        // Regular markets response
        markets = pancakeData.data as MarketData[];
      }
    } else if ('success' in data && data.success && 'markets' in data && Array.isArray(data.markets)) {
      markets = (data as MarketsResponse).markets || [];
    } else if (Array.isArray(data)) {
      markets = data as MarketData[];
    } else {
      throw new Error('Invalid API response structure');
    }

    console.log('Processed markets count:', markets.length);
    if (markets.length > 0) {
      console.log('First market sample:', JSON.stringify(markets[0], null, 2));
    }
    console.log('==========================================');

    return markets;
  } catch (error) {
    console.error('Error fetching markets via proxy:', error);
    throw error;
  }
};

