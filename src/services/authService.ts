// src/services/authService.ts

const API_BASE_URL = 'https://polynado-backend-n2he.onrender.com';

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

/**
 * Verify referral code
 */
export const verifyReferralCode = async (
 referralCode: string
): Promise<VerifyReferralResponse> => {  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-referral-code`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

