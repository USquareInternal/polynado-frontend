/**
 * Server-side API URL (for Next.js API routes)
 * Uses environment variable if set, otherwise defaults to testnet backend.
 */
export const SERVER_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/**
 * All API endpoints in one place.
 */
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${SERVER_API_BASE_URL}/api/auth/signup`,
    LOGIN: `${SERVER_API_BASE_URL}/api/auth/login`,
    VERIFY_REFERRAL: `${SERVER_API_BASE_URL}/api/auth/verify-referral-code`,
    MY_DETAILS: `${SERVER_API_BASE_URL}/api/auth/myDetails`,
    FORGOT_PASSWORD_SEND_OTP: `${SERVER_API_BASE_URL}/api/auth/forgot-password/send-otp`,
    FORGOT_PASSWORD_VERIFY_OTP: `${SERVER_API_BASE_URL}/api/auth/forgot-password/verify-otp`,
    FORGOT_PASSWORD_RESET: `${SERVER_API_BASE_URL}/api/auth/forgot-password/reset-password`,
  },
  WHITELIST: {
    REQUEST: `${SERVER_API_BASE_URL}/api/whitelist/request`,
    STATUS: `${SERVER_API_BASE_URL}/api/whitelist/status`,
  },
  MARKETS: {
    LIST: `${SERVER_API_BASE_URL}/api/markets`,
    PANCAKE: `${SERVER_API_BASE_URL}/api/pancake-markets`,
    PROXY: '/api/markets',
  },
  REFERRAL: {
    REFERRED_USERS: `${SERVER_API_BASE_URL}/api/referral/referred-users`,
  },
  WITHDRAWAL: {
    HISTORY: `${SERVER_API_BASE_URL}/api/withdrawal/history`,
  },
  CHATBOT: {
    CHAT: `${SERVER_API_BASE_URL}/api/chatbot/chat`,
  },
  STRIPE: {
    CREATE_CHECKOUT_SESSION: `${SERVER_API_BASE_URL}/api/stripe/create-checkout-session`,
    CHECKOUT_SESSION: `${SERVER_API_BASE_URL}/api/stripe/checkout-session`,
  },
  PORTFOLIO: {
    GET: (walletAddress: string) => `${SERVER_API_BASE_URL}/api/portfolio/polymarket?wallet=${walletAddress}`,
    PANCAKE: (walletAddress: string) => `${SERVER_API_BASE_URL}/api/portfolio/pancake?wallet=${walletAddress}`,
  },
} as const;

