'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAccount, useBalance, useChainId, useSwitchChain, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { allConfiguredChains } from '@/utils/chainUtils';
import { showSuccessAlert } from '@/utils/SweetAlertUtils';
import { CopyOutlined, DisconnectOutlined, CaretUpOutlined, CaretDownOutlined, CloseOutlined } from '@ant-design/icons';

interface CustomWalletButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// Network icon mapping - you can add actual network icons/images here
const getNetworkIcon = (chainId: number): string => {
  // Return network icon URL or use a default
  // For now, we'll use a simple colored circle based on chain
  const networkIcons: Record<number, string> = {
    56: '/networks/bsc.png', // BSC
    97: '/networks/bsc-testnet.png', // BSC Testnet
    137: '/networks/polygon.png', // Polygon
    43114: '/networks/avalanche.png', // Avalanche
    146: '/networks/sonic.png', // Sonic
    14601: '/networks/sonic-testnet.png', // Sonic Testnet
  };
  return networkIcons[chainId] || '/networks/default.png';
};

const getNetworkName = (chainId: number): string => {
  const chain = allConfiguredChains.find(c => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
};

const getNetworkSymbol = (chainId: number): string => {
  const chain = allConfiguredChains.find(c => c.id === chainId);
  return chain?.nativeCurrency?.symbol || 'ETH';
};

// Get chain image path
const getChainImage = (chainId: number): string => {
  const chainImages: Record<number, string> = {
    56: '/chains/bsc.png', // BSC
    137: '/chains/polygon.png', // Polygon
    8453: '/chains/kalshi.png', // Kalshi (update with actual chain ID if different)
  };
  return chainImages[chainId] || '/chains/default.png';
};

export const CustomWalletButton: React.FC<CustomWalletButtonProps> = ({ onConnect, onDisconnect }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const wasConnected = useRef<boolean | undefined>(undefined);

  // Format address
  const formatAddress = (addr: string | undefined): string => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      showSuccessAlert('Address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setShowModal(false);
    onDisconnect?.();
  };

  // Handle network switch
  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      // Check if chain is already active
      if (chainId === targetChainId) {
        showSuccessAlert(`Already connected to ${getNetworkName(targetChainId)}`);
        setShowNetworkDropdown(false);
        setShowNetworkSelector(false);
        return;
      }

      // Close dropdowns immediately (before user confirms)
      setShowNetworkDropdown(false);
      setShowNetworkSelector(false);

      // Switch chain - this will trigger MetaMask to switch networks
      // Don't show success message here - wait for actual chain change
      await switchChain({ chainId: targetChainId });
      
      // Note: Success message will be shown when chainId actually changes
      // via the useEffect that watches chainId changes
    } catch (err: any) {
      console.error('Failed to switch network:', err);
      
      // Handle different error cases
      if (err?.code === 4001) {
        // User rejected the request - don't show error, just log
        console.log('User rejected network switch');
      } else if (err?.code === 4902) {
        // Chain not added to wallet - MetaMask will prompt to add it
        console.log('Chain not added to wallet, MetaMask should prompt to add it');
        // Don't show error here as MetaMask will handle the prompt
      } else {
        // Other errors
        console.error('Network switch error:', err);
        showSuccessAlert(`Failed to switch network: ${err?.message || 'Unknown error'}`);
      }
    }
  };

  // Watch for chain changes and show success message when actually switched
  const prevChainId = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (prevChainId.current !== undefined && prevChainId.current !== chainId) {
      // Chain actually changed
      showSuccessAlert(`Switched to ${getNetworkName(chainId)}`);
    }
    prevChainId.current = chainId;
  }, [chainId]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNetworkDropdown(false);
      }
    };

    if (showModal || showNetworkDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showModal, showNetworkDropdown]);

  // Track connection state changes
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (wasConnected.current === undefined) {
      wasConnected.current = isConnected;
      return;
    }

    if (isConnected !== wasConnected.current) {
      showSuccessAlert(
        `Your wallet has been ${isConnected ? 'connected' : 'disconnected'} successfully.`
      );

      if (isConnected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    }

    wasConnected.current = isConnected;
  }, [isConnected, onConnect, onDisconnect]);

  if (!isMounted) {
    return (
      <div className="custom-connect-button-wrapper" style={{ minWidth: '120px', minHeight: '40px' }}></div>
    );
  }

  // If not connected, show RainbowKit connect button
  if (!isConnected) {
    return (
      <div className="custom-connect-button-wrapper" style={{ display: 'block', visibility: 'visible' }}>
        <ConnectButton
          showBalance={false}
          accountStatus="address"
          chainStatus="none"
        />
      </div>
    );
  }

  // Format balance - show 3 decimal places
  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}`
    : '0.000';

  const networkName = getNetworkName(chainId);
  const networkSymbol = getNetworkSymbol(chainId);

  return (
    <>
      {/* Wallet Address Button with Network Icon */}
      <div className="relative flex items-center gap-2">
        {/* Network Icon Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
          >
            {/* Network Icon - Chain Image */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden bg-[#2A2A2A]">
              <Image
                src={getChainImage(chainId)}
                alt={networkName}
                width={24}
                height={24}
                className="object-contain"
                onError={(e) => {
                  // Fallback to letter if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-white text-xs font-bold">${networkSymbol[0]?.toUpperCase() || networkName[0]?.toUpperCase() || 'N'}</span>`;
                  }
                }}
              />
            </div>
            {showNetworkDropdown ? (
              <CaretUpOutlined className="text-gray-400" />
            ) : (
              <CaretDownOutlined className="text-gray-400" />
            )}
          </button>

          {/* Network Dropdown */}
          {showNetworkDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-black/80 backdrop-blur-xl border border-gray-700/30 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="text-sm text-white font-semibold px-3 py-2.5 mb-1 text-center">Switch Network</div>
                <div className="space-y-1">
                  {allConfiguredChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => handleSwitchNetwork(chain.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        chain.id === chainId 
                          ? 'bg-gradient-to-r from-[#F5A366]/90 to-[#D16300]/90 border border-[#F5A366]/50 shadow-md shadow-[#F5A366]/20' 
                          : 'bg-transparent hover:bg-gray-800/30 border border-transparent hover:border-gray-700/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-900/50 flex-shrink-0 border border-gray-700/30">
                        <Image
                          src={getChainImage(chain.id)}
                          alt={chain.name}
                          width={40}
                          height={40}
                          className="object-contain"
                          onError={(e) => {
                            // Fallback to letter if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-white text-xs font-bold">${chain.nativeCurrency.symbol[0]?.toUpperCase() || chain.name[0]?.toUpperCase() || 'N'}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm text-white font-medium truncate">{chain.name}</div>
                        {chain.id === chainId && (
                          <div className="text-xs text-white/70 font-normal mt-0.5">Connected</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Address Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
        >
          <span className="text-sm text-white font-medium">{formatAddress(address)}</span>
          <CaretDownOutlined className="text-gray-400" />
        </button>
      </div>

      {/* Wallet Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden relative"
          >
            {/* Modal Header with Close Button */}
            <div className="relative p-4 pb-0 flex justify-end">
              {/* Close Button - Top Right */}
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity z-10"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                  boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                }}
              >
                <CloseOutlined className="text-sm" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-4">
              {/* Logo - Using image 7.svg */}
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src="/image 7.svg"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Wallet Address - Centered, Dark Gray for visibility */}
              <div className="text-center mb-1">
                <div className="text-base font-medium" style={{ color: '#333333' }}>{formatAddress(address)}</div>
              </div>

              {/* Balance - Centered, Dark Gray for visibility */}
              <div className="text-center mb-5">
                <div className="text-sm" style={{ color: '#333333' }}>{formattedBalance}</div>
              </div>

              {/* Action Buttons - Side by Side with Icons to Left, Orange Background */}
              <div className="flex gap-2">
                {/* Copy Address Button */}
                <button
                  onClick={copyAddress}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }}
                >
                  <CopyOutlined className="text-xs" />
                  <span className="text-xs font-medium">Copy Address</span>
                </button>

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }}
                >
                  <DisconnectOutlined className="text-xs" />
                  <span className="text-xs font-medium">Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

