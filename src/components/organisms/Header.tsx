'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MenuOutlined } from '@ant-design/icons';
import { Heading } from '@/components/atoms/Heading';
import WalletConnect from '../molecules/WalletConnectButton';
import UserDropdown from '../molecules/UserDropdown';
import { getToken, getUserData } from '@/services/authService';

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

  useEffect(() => {
    // Check if user is logged in
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUserEmail(userData.email);
      setReferralId(userData.reffralId || null);
    } else {
      setIsLoggedIn(false);
      setUserEmail(null);
      setReferralId(null);
    }
  }, []);

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
          {isLoggedIn && userEmail && referralId ? (
            // Display user dropdown when logged in
            <UserDropdown userEmail={userEmail} referralId={referralId} />
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