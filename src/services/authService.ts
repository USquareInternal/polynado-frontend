// src/services/authService.ts

import { API_ENDPOINTS } from '@/config/apiConfig';

export interface SignupRequest {
  email: string;
  password: string;
  referredBy?: string | null;
}

export interface SignupResponse {
  message: string;
  success: boolean;
  user: {
    userId: string;
    referredBy: string | null;
    email: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  success: boolean;
  user: {
    _id: string;
    reffralId: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  token: string;
}

export interface VerifyReferralRequest {
 referralCode: string;
}

export interface VerifyReferralResponse {
  success: boolean;
  message: string;
  data?: {
    reffralId: string;
    email?: string;
  };
}

export interface ApiError {
  message: string;
  success: false;
  error?: string;
}

export interface ForgotPasswordSendOtpResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordVerifyOtpResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResetResponse {
  success: boolean;
  message: string;
}

/**
 * Verify referral code
 */
export const verifyReferralCode = async (
 referralCode: string
): Promise<VerifyReferralResponse> => {  
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_REFERRAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({referralCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify referral code');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign up a new user
 */
export const signup = async (
  signupData: SignupRequest
): Promise<SignupResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: signupData.email,
        password: signupData.password,
        referredBy: signupData.referredBy || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to sign up');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send OTP to email for password reset
 */
export const sendForgotPasswordOtp = async (
  email: string
): Promise<ForgotPasswordSendOtpResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_SEND_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP sent to email
 */
export const verifyForgotPasswordOtp = async (
  email: string,
  otp: string
): Promise<ForgotPasswordVerifyOtpResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid OTP');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password using verified OTP
 */
export const resetPasswordWithOtp = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<ForgotPasswordResetResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Store token in localStorage
 */
export const storeToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

/**
 * Store user data in localStorage
 */
export const storeUserData = (userData: LoginResponse['user'] | SignupResponse['user']) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userData', JSON.stringify(userData));
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): LoginResponse['user'] | SignupResponse['user'] | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
  }
  return null;
};

/**
 * Decode JWT token to get user info (fallback method)
 */
export const decodeToken = (token: string): { userId?: string; exp?: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * User details response interface
 */
export interface UserDetailsResponse {
  message: string;
  success: boolean;
  user: {
    _id: string;
    userId: string;
    referredBy: string | null;
    rewardByNFTMint: number;
    rewardBySubscription: number;
    referralRewards: number;
    rewardWithdrawn: number;
    isMintedStandardNFT: boolean;
    isMintedProNFT: boolean;
    isSubscribedStandard: boolean;
    isSubscribedPro: boolean;
    standardSubscriptionExpiryTimestamp: string | number | null;
    proSubscriptionExpiryTimestamp: string | number | null;
    isWhitelisted: boolean;
    email: string;
    walletAddress?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

/**
 * Whitelist request response interface
 */
export interface WhitelistRequestResponse {
  message: string;
  success: boolean;
  data: {
    userId: string;
    email: string;
    walletAddress: string;
    status: string;
    requestedAt: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

/**
 * Fetch user details
 */
export const fetchUserDetails = async (): Promise<UserDetailsResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.MY_DETAILS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user details');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Request whitelist access
 */
export const requestWhitelist = async (walletAddress: string): Promise<WhitelistRequestResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.WHITELIST.REQUEST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        walletAddress,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to request whitelist');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get whitelist request status
 */
export const getWhitelistRequestStatus = async (): Promise<WhitelistRequestResponse | null> => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(API_ENDPOINTS.WHITELIST.STATUS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      // No request found, return null
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch whitelist request status');
    }

    return data;
  } catch (error) {
    // If error is 404 or no request exists, return null
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    // For other errors, log but don't throw (optional - can be handled by caller)
    console.error('Error fetching whitelist request status:', error);
    return null;
  }
};

