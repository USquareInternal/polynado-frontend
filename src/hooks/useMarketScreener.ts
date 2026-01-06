// src/hooks/useMarketScreener.ts
"use client";
import { useState, useEffect } from 'react';
import { fetchMarketsViaProxy, MarketData } from '@/services/marketService';

export interface MarketScreenerRow {
  id: string;
  marketQuestion: string;
  category: string;
  yesPercentage: number;
  yesPrice: number;
  polynadoFair: number;
  edge: number;
  momentum: number[];
  volume: number;
  openInterest: number;
  isFavorited?: boolean;
}

/**
 * Maps API market data to MarketScreenerRow format
 */
const mapToMarketScreenerRow = (data: MarketData, index: number): MarketScreenerRow => {
  // Handle yesPrice and yesPercentage from API
  // Priority: 1. outcomePrices array/string (outcomePrices[0] * 100), 2. yesPrice from API, 3. yesPercentage
  let yesPrice = 0.5;
  let yesPercentage = 50;

  if (data.outcomePrices) {
    // Handle outcomePrices as array or string - this takes priority
    let prices: number[] = [];
    if (Array.isArray(data.outcomePrices)) {
      prices = data.outcomePrices;
    } else if (typeof data.outcomePrices === 'string' && data.outcomePrices.trim().length > 0) {
      try {
        const trimmed = data.outcomePrices.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            prices = parsed.map(p => typeof p === 'string' ? parseFloat(p) : p);
          }
        }
      } catch (e) {
        console.warn('Error parsing outcomePrices string:', data.outcomePrices);
      }
    }
    
    if (prices.length >= 2) {
      yesPrice = prices[0];
      yesPercentage = prices[0] * 100; // Use outcomePrices[0] * 100
    }
  } else if (data.yesPrice !== undefined) {
    yesPrice = data.yesPrice;
    yesPercentage = data.yesPercentage !== undefined ? data.yesPercentage : Math.round(yesPrice * 100);
  } else if (data.yesPercentage !== undefined) {
    yesPercentage = data.yesPercentage;
    yesPrice = yesPercentage / 100;
  }

  // Get polynado fair value (keep as decimal, e.g., 0.2 means 20%)
  // Display will show it as percentage
  let polynadoFair = data.polynadoFair !== undefined ? data.polynadoFair : yesPrice;
  // If polynadoFair is >= 1, assume it's already a percentage and convert to decimal
  if (polynadoFair >= 1) {
    polynadoFair = polynadoFair / 100;
  }

  // Get edge value (edge is already in percentage points, e.g., -79.9 means -79.9%)
  const edge = data.edge !== undefined ? data.edge : 0;

  // Generate momentum data (7 points) - use yesPercentage as base
  // Always ensure momentum is a valid array with at least 7 points
  let momentum: number[] = [];
  if (data.momentum && Array.isArray(data.momentum) && data.momentum.length > 0) {
    momentum = data.momentum;
  } else {
    // Generate default momentum trend based on yesPercentage
    momentum = [
      yesPercentage - 10,
      yesPercentage - 7,
      yesPercentage - 5,
      yesPercentage - 3,
      yesPercentage - 1,
      yesPercentage,
      yesPercentage,
    ].map(v => Math.max(0, Math.min(100, v)));
  }
  
  // Ensure momentum has at least 7 points
  if (momentum.length < 7) {
    const lastValue = momentum.length > 0 ? momentum[momentum.length - 1] : yesPercentage;
    while (momentum.length < 7) {
      momentum.push(lastValue);
    }
  }

  // Format volume/liquidity (M for millions, K for thousands) - 2 decimals
  const formatVolume = (num: number | undefined): string => {
    if (!num || num === 0) return '0.00';
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
    return '$' + num.toFixed(2);
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

  // Get volume - handle both string and number
  let volume = 0;
  if (typeof data.volume === 'number') {
    volume = data.volume;
  } else if (typeof data.volume === 'string') {
    volume = parseFloat(data.volume.replace(/[^0-9.]/g, '')) || 0;
  } else if (data.volumeNum !== undefined) {
    volume = data.volumeNum;
  }

  // Get openInterest - handle both string and number
  let openInterest = 0;
  if (typeof data.openInterest === 'number') {
    openInterest = data.openInterest;
  } else if (typeof data.openInterest === 'string') {
    openInterest = parseFloat(data.openInterest.replace(/[^0-9.]/g, '')) || 0;
  } else if (data.liquidityNum !== undefined) {
    // Fallback to liquidityNum if openInterest not available
    openInterest = data.liquidityNum;
  }

  return {
    id: data.id || `market-${index}`,
    marketQuestion: data.question || '',
    category: (data.category || 'uncategorized').replace(/-/g, ' '),
    yesPercentage,
    yesPrice,
    polynadoFair, // Keep as decimal (0.2 = 20%)
    edge, // Keep as percentage points
    momentum,
    volume,
    openInterest,
    isFavorited: false,
  };
};

/**
 * Custom hook to fetch market screener data
 */
export const useMarketScreener = () => {
  const [markets, setMarkets] = useState<MarketScreenerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch markets from the API
        const apiData = await fetchMarketsViaProxy();

        // Map to MarketScreenerRow format
        const screenerRows = apiData
          .filter(market => market.question || market.id)
          .map((market, index) => mapToMarketScreenerRow(market, index));

        setMarkets(screenerRows);

      } catch (err) {
        console.error("Failed to fetch market screener data:", err);
        setError("Could not load market data. Please check the network connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return { markets, isLoading, error };
};

