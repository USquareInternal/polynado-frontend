'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuOutlined } from '@ant-design/icons';
import { Heading } from '@/components/atoms/Heading';
import WalletConnect from '../molecules/WalletConnectButton';
import UserDropdown from '../molecules/UserDropdown';
import { getToken, getUserData } from '@/services/authService';
import { useAccount } from 'wagmi';

// Define the type for the component's props
interface HeaderProps {
  // Props to handle mobile sidebar toggle
  onMenuClick: () => void;
  welcomeText: string;
  // Props for the WalletConnect molecule
  isConnected: boolean;
  userAddress?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  welcomeText,
  isConnected,
  userAddress,
  onConnect,
  onDisconnect,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);
  const { address: wagmiAddress } = useAccount();
  const pathname = usePathname();
  
  // Use wagmi address if available, otherwise fall back to prop
  const displayAddress = wagmiAddress || userAddress;
  
  // Format wallet address (first 6 + last 4 characters)
  const formatAddress = (addr: string | undefined): string => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Function to check and update auth state
  const checkAuthState = () => {
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUserEmail(userData.email);
      setReferralId((userData as any).userId || null);
    } else {
      setIsLoggedIn(false);
      setUserEmail(null);
      setReferralId(null);
    }
  };

  useEffect(() => {
    // Check auth state on mount and when pathname changes
    checkAuthState();

    // Listen to storage events (when authToken or userData changes in other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen to custom events for same-tab updates
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [pathname]); // Re-check when route changes

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full py-3 border-b border-gray-700 lg:left-20 lg:w-[calc(100%-5rem)]"
      style={{ backgroundColor: '#1E2022' }}
    >
      <div className="flex justify-between items-center w-full px-6 lg:pl-12">

        <div className="flex items-center space-x-4">

          {/* Mobile Menu Button (Hamburger) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 text-white"
            aria-label="Open sidebar menu"
          >
            <MenuOutlined className="w-6 h-6" />
          </button>

          {/* Welcome Text (Visible on sm: and up) */}
          <h2 className="text-xl font-medium hidden sm:block text-white">
            {welcomeText}
          </h2>
        </div>

        {/* === Right Section: User Info/Login & Wallet Connect Buttons === */}
        <div className="flex items-center gap-3">
          {isLoggedIn && userEmail ? (
            // Display user dropdown when logged in
            <div className="flex items-center gap-3">
              <UserDropdown userEmail={userEmail} referralId={referralId || null} />
              {/* Display wallet address when connected */}
              {/* {isConnected && displayAddress && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-300 font-mono">
                    {formatAddress(displayAddress)}
                  </span>
                </div>
              )} */}
            </div>
          ) : (
            // Login Button with orange gradient
            <Link href="/login">
              <button
                className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                  boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                Login
              </button>
            </Link>
          )}
          {/* Pass the required props down to WalletConnect */}
          <WalletConnect
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>

      </div>
    </header>
  );
};