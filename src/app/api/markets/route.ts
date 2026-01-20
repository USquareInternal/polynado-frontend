// src/app/api/markets/route.ts

// This file creates a server-side endpoint at /api/markets that fetches
// data from the Polynado backend API, bypassing CORS restrictions.

import { SERVER_API_BASE_URL } from '@/config/apiConfig';
import { NextRequest } from 'next/server';

// BSC Chain IDs (Mainnet: 56, Testnet: 97)
const BSC_CHAIN_IDS = [56, 97];

export async function GET(request: NextRequest) {
    // Get chainId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const chainIdParam = searchParams.get('chainId');
    const chainId = chainIdParam ? parseInt(chainIdParam, 10) : null;
    
    // Determine which API endpoint to use based on chain ID
    const isBSC = chainId !== null && BSC_CHAIN_IDS.includes(chainId);
    const EXTERNAL_API_URL = isBSC 
        ? `${SERVER_API_BASE_URL}/api/pancake-markets`
        : `${SERVER_API_BASE_URL}/api/markets`;

    try {
        // 1. Fetch data from the Polynado backend API (Server-to-Server request)
        const response = await fetch(EXTERNAL_API_URL, {
            // Disable caching for real-time data
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // Forward the non-200 status code from the external API
            return new Response(JSON.stringify({ 
                message: `Failed to fetch markets: ${response.statusText}`,
                error: true 
            }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const data = await response.json();

        // Log the raw API response
        console.log('=== Markets API Response (Server-side) ===');
        console.log('Chain ID:', chainId, '| Using API:', isBSC ? 'pancake-markets' : 'markets');
        console.log('Full response:', JSON.stringify(data, null, 2));
        console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);
        if (Array.isArray(data)) {
          console.log('Number of markets:', data.length);
          if (data.length > 0) {
            console.log('First market sample:', JSON.stringify(data[0], null, 2));
          }
        } else if (data.data && Array.isArray(data.data)) {
          console.log('Number of markets (in data.data):', data.data.length);
          if (data.data.length > 0) {
            console.log('First market sample:', JSON.stringify(data.data[0], null, 2));
          }
        } else if (data.markets && Array.isArray(data.markets)) {
          console.log('Number of markets (in data.markets):', data.markets.length);
          if (data.markets.length > 0) {
            console.log('First market sample:', JSON.stringify(data.markets[0], null, 2));
          }
        }
        console.log('==========================================');

        // 2. Return the data to the client component
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Proxy error fetching markets:", error);
        return new Response(JSON.stringify({ 
            message: "Internal server error connecting to external API.",
            error: true 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}