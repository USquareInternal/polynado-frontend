'use client';
import React from 'react';
import Link from 'next/link';
import { MenuOutlined } from '@ant-design/icons'; // Import Ant Design Icon for the hamburger
import { Heading } from '@/components/atoms/Heading'; // Assuming you want to keep this import
import WalletConnect from '../molecules/WalletConnectButton'; // Assuming this is your actual WalletConnect component

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
  return (
    // The main header container: Fixed, full width, high z-index, and background color.
    // NOTE: The previous version used 'p-4' here. I'm reverting to the 'py-3' and 'px-6' 
    // from your first code block for a more compact, border-inclusive look.
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
            {/* Using Ant Design Icon as requested in the previous context, or use a path if not available */}
            <MenuOutlined className="w-6 h-6" />
          </button>

          {/* Welcome Text (Visible on sm: and up) */}
          <h2 className="text-xl font-medium hidden sm:block text-white">
            {welcomeText}
          </h2>
        </div>

        {/* === Right Section: Login & Wallet Connect Buttons === */}
        <div className="flex items-center gap-3">
          {/* Login Button */}
          <Link href="/login">
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all duration-150 text-white border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 bg-transparent"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              Login
            </button>
          </Link>
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