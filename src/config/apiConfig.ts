// src/config/apiConfig.ts
// Centralized API configuration using environment variables

/**
 * Base API URL for the backend (client-side)
 * Uses environment variable if set, otherwise defaults to testnet backend.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://polynado-backend-testnet.onrender.com';

/**
 * Server-side API URL (for Next.js API routes)
 * Uses environment variable if set, otherwise defaults to testnet backend.
 */
export const SERVER_API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://polynado-backend-testnet.onrender.com';

/**
 * All API endpoints in one place.
 */
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY_REFERRAL: `${API_BASE_URL}/api/auth/verify-referral-code`,
    MY_DETAILS: `${API_BASE_URL}/api/auth/myDetails`,
  },
  WHITELIST: {
    REQUEST: `${API_BASE_URL}/api/whitelist/request`,
    STATUS: `${API_BASE_URL}/api/whitelist/status`,
  },
  MARKETS: {
    LIST: `${API_BASE_URL}/api/markets`,
    PROXY: '/api/markets',
  },
  REFERRAL: {
    REFERRED_USERS: `${API_BASE_URL}/api/referral/referred-users`,
  },
  WITHDRAWAL: {
    HISTORY: `${API_BASE_URL}/api/withdrawal/history`,
  },
  CHATBOT: {
    CHAT: `${API_BASE_URL}/api/chatbot/chat`,
  },
  STRIPE: {
    CREATE_CHECKOUT_SESSION: `${API_BASE_URL}/api/stripe/create-checkout-session`,
    CHECKOUT_SESSION: `${API_BASE_URL}/api/stripe/checkout-session`,
  },
  PORTFOLIO: {
    GET: (walletAddress: string) => `${API_BASE_URL}/api/portfolio/polymarket?wallet=${walletAddress}`,
  },
} as const;

