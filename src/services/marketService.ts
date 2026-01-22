// src/services/marketService.ts


import { API_ENDPOINTS } from '@/config/apiConfig';

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
  confidenceScore?: number;
  yesPercentage?: number;
  noPercentage?: number;
  yesPrice?: number;
  yesPay?: string;
  noPay?: string;
  volume?: string | number;
  liquidity?: string | number;
  change?: string;
  action?: string;
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
  momentum: number | number[];
  polynadoFair: number;
  edge: number;
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
  confidenceScore?: number;
}

interface PancakeMarketsResponse {
  message: string;
  success: boolean;
  data: PancakeMarketData[];
}

const isPancakeMarketData = (value: unknown): value is PancakeMarketData => {
  return !!value && typeof value === 'object' && 'pancakeId' in (value as Record<string, unknown>);
};

/**
 * Maps PancakeSwap market data to MarketData format
 */
const mapPancakeToMarketData = (pancakeMarket: PancakeMarketData): MarketData => {
  // Calculate noPrice from yesPrice
  const noPrice = 1 - pancakeMarket.yesPrice;
  const noPercentage = 100 - pancakeMarket.yesPercentage;
  
  const confidenceScore = pancakeMarket.confidenceScore ?? pancakeMarket.polynadoFair ?? pancakeMarket.yesPercentage;

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
    polynadoFair: pancakeMarket.polynadoFair,
    edge: pancakeMarket.edge,
    confidenceScore: typeof confidenceScore === 'number' ? confidenceScore : Number(confidenceScore) || 0,
    // Only pass momentum if it's an array; hook will generate defaults otherwise
    momentum: Array.isArray(pancakeMarket.momentum) ? pancakeMarket.momentum : undefined,
    openInterest: pancakeMarket.openInterest.toString(),
    price: pancakeMarket.currentPrice,
    action: pancakeMarket.action, // Map action field
  };
};

/**
 * Fetches all markets from the Polynado backend API
 */
export const fetchMarkets = async (): Promise<MarketData[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.MARKETS.LIST, {
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
    // Use backend endpoints directly (proxy route was removed).
    // Robust fallback order:
    // 1) If BSC chainId: try pancake with chain param
    // 2) If 404: pancake without chain param
    // 3) If still failing: fall back to standard markets without chain param
    // 4) Non-BSC: try standard with chain param; if 404, retry without.
    const isBSCChain = chainId !== undefined && BSC_CHAIN_IDS.includes(chainId);

    const buildUrl = (usePancake: boolean, withChainParam: boolean) => {
      const queryParams = withChainParam && chainId ? `?chainId=${chainId}` : '';
      return usePancake
        ? `${API_ENDPOINTS.MARKETS.PANCAKE}${queryParams}`
        : `${API_ENDPOINTS.MARKETS.LIST}${queryParams}`;
    };

    const tryFetch = async (url: string): Promise<Response> => {
      return fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
    };

    let response: Response;

    if (isBSCChain) {
      // Try Pancake with chain param
      response = await tryFetch(buildUrl(true, true));
      if (response.status === 404) {
        // Retry Pancake without chain param
        response = await tryFetch(buildUrl(true, false));
      }
      if (response.status === 404) {
        // Fallback to standard markets without chain param
        response = await tryFetch(buildUrl(false, false));
      }
    } else {
      // Non-BSC: standard markets with chain param (if provided)
      response = await tryFetch(buildUrl(false, !!chainId));
      if (response.status === 404 && chainId) {
        // Retry without chain param
        response = await tryFetch(buildUrl(false, false));
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
    }

    const data: MarketsResponse | PancakeMarketsResponse = await response.json();

    // Log the response received by the client
    console.log('=== Markets API Response (Client-side) ===');
    console.log('Chain ID:', chainId);
    console.log('Full response:', JSON.stringify(data, null, 2));
    console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);

    // Handle different response structures
    let markets: MarketData[] = [];
    
    // Check if response has a `data` array (either regular markets or PancakeSwap markets)
    if ('success' in data && data.success && 'data' in data && Array.isArray(data.data)) {
      // If the first item has `pancakeId`, it's PancakeSwap format
      if (data.data.length > 0 && isPancakeMarketData(data.data[0])) {
        markets = (data.data as PancakeMarketData[]).map(mapPancakeToMarketData);
        console.log('PancakeSwap markets mapped:', markets.length);
      } else {
        // Regular markets response (`MarketData[]`)
        markets = (data as MarketsResponse).data || [];
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

