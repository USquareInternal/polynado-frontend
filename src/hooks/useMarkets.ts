// src/hooks/useMarkets.ts
"use client";
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { MarketCardProps } from '@/components/molecules/MarketCard';
import { fetchMarketsViaProxy, MarketData } from '@/services/marketService';

// --- 1. Type Definitions for API Data (Internal) ---

interface MarketApiData {
  id: string;
  question: string;
  category: string;
  liquidityNum?: number;
  volumeNum?: number;
  oneDayPriceChange?: number;
  outcomePrices?: string; // e.g., "[\"0.24\", \"0.76\"]"
  price?: number;
  priceChange?: number;
  polynadoFair?: number;
  edge?: number;
  momentum?: number[];
  volume24h?: string;
  openInterest?: string;
  yesPercentage?: number;
  noPercentage?: number;
  yesPay?: string;
  noPay?: string;
  volume?: string;
  liquidity?: string;
  change?: string;
}

// --- 2. Data Transformation Function (Mapper) ---

/**
 * Maps the raw API response to the format expected by MarketCardProps.
 */
const mapApiDataToMarketCardProps = (data: MarketApiData | MarketData): MarketCardProps => {
  // Handle different data structures from API
  let yesPrice = 0.5;
  let noPrice = 0.5;
  let yesPercentage = 50;
  let noPercentage = 50;
  let yesPay = '$0.50';
  let noPay = '$0.50';
  let volume = '0';
  let liquidity = '0';
  let change = '↑0%';

  // Priority: outcomePrices takes precedence for percentages
  if (data.outcomePrices) {
    // Handle outcomePrices as array or string
    let prices: number[] = [];
    if (Array.isArray(data.outcomePrices)) {
      prices = data.outcomePrices;
    } else if (typeof data.outcomePrices === 'string' && data.outcomePrices.trim().length > 0) {
      try {
        const trimmed = data.outcomePrices.trim();
        // Check if it looks like a JSON array
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            prices = parsed.map(p => typeof p === 'string' ? parseFloat(p) : p);
          }
        }
      } catch (e) {
        // Silently handle parse errors and use defaults
        console.warn('Error parsing outcomePrices, using defaults:', data.outcomePrices);
      }
    }
    
    if (prices.length >= 2) {
      yesPrice = prices[0];
      noPrice = prices[1];
      yesPercentage = prices[0] * 100; // Use outcomePrices[0] * 100
      noPercentage = prices[1] * 100; // Use outcomePrices[1] * 100
    }
  }

  // If percentages are directly provided (and outcomePrices not available), use them
  if (data.yesPercentage !== undefined && !data.outcomePrices) {
    yesPercentage = data.yesPercentage;
    yesPrice = yesPercentage / 100;
  }
  if (data.noPercentage !== undefined && !data.outcomePrices) {
    noPercentage = data.noPercentage;
    noPrice = noPercentage / 100;
  }

  // Calculate Payout: Payout is often 1 / Price
  const getPay = (price: number) => {
    if (price > 0 && price <= 1) {
      return '$' + (1 / price).toFixed(2);
    }
    return '$0.00';
  };

  // Use provided pay values or calculate them
  if (data.yesPay) {
    yesPay = data.yesPay;
  } else {
    yesPay = getPay(yesPrice);
  }
  if (data.noPay) {
    noPay = data.noPay;
  } else {
    noPay = getPay(noPrice);
  }

  // Format price change
  if (data.change) {
    change = data.change;
  } else if (data.oneDayPriceChange !== undefined) {
    const changeNum = data.oneDayPriceChange * 100;
    change = (changeNum >= 0 ? '↑' : '↓') + Math.abs(changeNum).toFixed(1) + '%';
  } else if (data.priceChange !== undefined) {
    change = (data.priceChange >= 0 ? '↑' : '↓') + Math.abs(data.priceChange).toFixed(1) + '%';
  }

  // Helper function to format number and strip trailing zeros
  const formatNumber = (num: number, decimals: number): string => {
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  };

  // Format volume/liquidity (M for millions, K for thousands) - 2 decimals with $ sign, strip trailing zeros
  const formatVolume = (num: number | undefined) => {
    if (!num || num === 0) return '$0';
    if (num >= 1000000) return '$' + formatNumber(num / 1000000, 2) + 'M';
    if (num >= 1000) return '$' + formatNumber(num / 1000, 2) + 'K';
    return '$' + formatNumber(num, 2);
  };

  // Parse and format volume/liquidity string to 2 decimals
  const parseAndFormatVolume = (value: string | number | undefined): string => {
    if (!value) return '0.00';
    if (typeof value === 'number') {
      return formatVolume(value);
    }
    // If it's a string, try to parse it
    const numValue = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(numValue)) return '0.00';
    return formatVolume(numValue);
  };

  // Use provided volume/liquidity or calculate from numbers - always format to 2 decimals
  if (data.volume) {
    volume = parseAndFormatVolume(data.volume);
  } else if (data.volumeNum !== undefined) {
    volume = formatVolume(data.volumeNum);
  } else if (data.volume24h) {
    volume = parseAndFormatVolume(data.volume24h);
  } else {
    volume = '0.00';
  }

  if (data.liquidity) {
    liquidity = parseAndFormatVolume(data.liquidity);
  } else if (data.liquidityNum !== undefined) {
    liquidity = formatVolume(data.liquidityNum);
  } else if (data.openInterest) {
    liquidity = parseAndFormatVolume(data.openInterest);
  } else {
    liquidity = '0.00';
  }

  return {
    title: data.question || '',
    category: (data.category || '').replace(/-/g, ' ').toUpperCase(),
    yesPay,
    noPay,
    yesPercentage,
    noPercentage,
    volume,
    liquidity,
    change,
    yesLabel: 'Yes',
    noLabel: 'No',
    yesPayout: '',
  };
};

// --- 3. Custom React Hook ---

/**
 * Custom hook to fetch and process market data from the Polymarket API.
 * @param limit The maximum number of markets to return.
 * @returns An object containing the fetched markets, loading state, and error state.
 */
export const useMarkets = (limit: number = 4) => {
  const chainId = useChainId();
  const [markets, setMarkets] = useState<MarketCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch markets from the API with chainId
        const apiData = await fetchMarketsViaProxy(chainId);

        // Map, filter, and limit the data
        const cardProps = apiData
          .filter(market => market.question || market.id)
          .map(mapApiDataToMarketCardProps)
          .slice(0, limit);

        setMarkets(cardProps);

      } catch (err) {
        console.error("Failed to fetch markets:", err);
        setError("Could not load market data. Please check the network connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, [limit, chainId]);

  return { markets, isLoading, error };
};