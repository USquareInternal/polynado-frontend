// src/services/marketService.ts

const API_BASE_URL = 'https://polynado-backend-testnet.onrender.com';

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
 */
export const fetchMarketsViaProxy = async (): Promise<MarketData[]> => {
  try {
    const response = await fetch('/api/markets', {
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

    // Log the response received by the client
    console.log('=== Markets API Response (Client-side) ===');
    console.log('Full response:', JSON.stringify(data, null, 2));
    console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);
    if (Array.isArray(data)) {
      console.log('Number of markets:', data.length);
      if (data.length > 0) {
        console.log('First market sample:', JSON.stringify(data[0], null, 2));
        console.log('First market outcomePrices:', data[0].outcomePrices);
        console.log('First market outcomePrices type:', typeof data[0].outcomePrices);
      }
    } else if (data.data && Array.isArray(data.data)) {
      console.log('Number of markets (in data.data):', data.data.length);
      if (data.data.length > 0) {
        console.log('First market sample:', JSON.stringify(data.data[0], null, 2));
        console.log('First market outcomePrices:', data.data[0].outcomePrices);
        console.log('First market outcomePrices type:', typeof data.data[0].outcomePrices);
      }
    } else if (data.markets && Array.isArray(data.markets)) {
      console.log('Number of markets (in data.markets):', data.markets.length);
      if (data.markets.length > 0) {
        console.log('First market sample:', JSON.stringify(data.markets[0], null, 2));
        console.log('First market outcomePrices:', data.markets[0].outcomePrices);
        console.log('First market outcomePrices type:', typeof data.markets[0].outcomePrices);
      }
    }
    console.log('==========================================');

    // Handle different response structures
    let markets: MarketData[] = [];
    if (data.success && data.data) {
      markets = data.data;
    } else if (data.success && data.markets) {
      markets = data.markets;
    } else if (Array.isArray(data)) {
      markets = data as MarketData[];
    } else {
      throw new Error('Invalid API response structure');
    }

    console.log('Processed markets count:', markets.length);
    return markets;
  } catch (error) {
    console.error('Error fetching markets via proxy:', error);
    throw error;
  }
};

