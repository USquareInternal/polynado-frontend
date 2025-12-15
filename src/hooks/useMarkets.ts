// src/hooks/useMarkets.ts
"use client"; // ⬅️ ADD THIS LINE AT THE TOP
import { useState, useEffect } from 'react';
import { MarketCardProps } from '@/components/molecules/MarketCard'; // Assuming you define this type here or pass it in

const API_URL = '/api/markets';

// --- 1. Type Definitions for API Data (Internal) ---

interface MarketApiData {
  id: string;
  question: string;
  category: string;
  liquidityNum: number;
  volumeNum: number;
  oneDayPriceChange: number;
  outcomePrices: string; // e.g., "[\"0.24\", \"0.76\"]"
}

// --- 2. Data Transformation Function (Mapper) ---

/**
 * Maps the raw API response to the format expected by MarketCardProps.
 */
const mapApiDataToMarketCardProps = (data: MarketApiData): MarketCardProps => {
  // Parse the JSON string from the API
  const [yesPriceStr, noPriceStr] = JSON.parse(data.outcomePrices) as string[];

  // Convert price strings to numbers (0 to 1)
  const yesPrice = parseFloat(yesPriceStr);
  const noPrice = parseFloat(noPriceStr);

  // Calculate percentages and handle potential NaN/invalid data gracefully
  const yesPercentage = Math.round(yesPrice * 100);
  const noPercentage = Math.round(noPrice * 100);

  // Calculate Payout: Payout is often 1 / Price
  const getPay = (price: number) => {
    // Check for valid price to avoid division by zero or infinity
    return price > 0 && price <= 1 ? (1 / price).toFixed(2) + ' USDT' : '— USDT';
  };

  // Format price change
  const changeNum = data.oneDayPriceChange * 100;
  const change = (changeNum >= 0 ? '+' : '') + changeNum.toFixed(1) + '%';

  // Format volume/liquidity (M for millions, K for thousands)
  const formatVolume = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  return {
    title: data.question,
    category: data.category.replace(/-/g, ' ').toUpperCase(),
    yesPay: getPay(yesPrice),
    noPay: getPay(noPrice),
    yesPercentage: yesPercentage,
    noPercentage: noPercentage,
    volume: formatVolume(data.volumeNum),
    liquidity: formatVolume(data.liquidityNum),
    change: change,
    yesLabel: '',
    noLabel: '',
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
  const [markets, setMarkets] = useState<MarketCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // ... (rest of the hook remains the same)

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        // Now fetching from the local server endpoint
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const apiData: MarketApiData[] = await response.json();

        // Map, filter, and limit the data
        const cardProps = apiData
          .filter(market => market.outcomePrices && market.question)
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
  }, [limit]);

  return { markets, isLoading, error };
};