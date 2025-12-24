'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAccount, useReadContract } from 'wagmi';
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import {
  useApproveUSDT,
  usePublicMintActive,
  getNFTContractAddress,
  useWhitelistMintActive,
  useWhitelistStatus,
  useNFTBalance,
  useUSDTMeta,
  usePublicMint,
  useWhitelistMint,
  useCollectionInfo,
  useCollectionSupply,
  useUserInfo,
} from '@/utils/nftContract';
import { showSuccessAlert,showFailedAlert } from "@/utils/SweetAlertUtils";
import { isUserRejection, showRejectionToast } from '@/utils/toast';
import { useWalletValidation } from '@/hooks/useWalletValidation';
import { getUserData } from '@/services/authService';
import Spinner from '@/components/atoms/Spinner';

const NFTMintDashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [mintingStep, setMintingStep] = useState<'idle' | 'approving' | 'minting' | 'success' | 'error'>('idle');
  const [standardError, setStandardError] = useState<string | null>(null);
  const [proError, setProError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authUserData, setAuthUserData] = useState<any>(null);
  
  // Validate wallet address mapping
  useWalletValidation();

  // Get user ID and auth user data from localStorage (from login response)
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setAuthUserData(userData);
      // Use userId or reffralId as userId
      const id = (userData as any).userId || (userData as any).reffralId;
      if (id) {
        setUserId(id);
      }
    }
  }, []);

  // Read contract data (per collection)
  const { collection: standardCollection, isLoading: isLoadingStandardCollection, error: standardCollectionError } = useCollectionInfo(1);
  const { collection: proCollection, isLoading: isLoadingProCollection, error: proCollectionError } = useCollectionInfo(2);
  const { current: standardCurrent, max: standardMax, isLoading: isLoadingStandardSupply, refetch: refetchStandardSupply } = useCollectionSupply(1);
  const { current: proCurrent, max: proMax, isLoading: isLoadingProSupply, refetch: refetchProSupply } = useCollectionSupply(2);
  const { publicMintActive: publicMintActiveStandard, isLoading: isLoadingMintActiveStandard } = usePublicMintActive(1);
  const { publicMintActive: publicMintActivePro, isLoading: isLoadingMintActivePro } = usePublicMintActive(2);
  const { whitelistMintActive: whitelistMintActiveStandard, isLoading: isLoadingWhitelistActiveStandard } = useWhitelistMintActive(1);
  const { whitelistMintActive: whitelistMintActivePro, isLoading: isLoadingWhitelistActivePro } = useWhitelistMintActive(2);
  const { isWhitelisted, isLoading: isLoadingWhitelistStatus, refetch: refetchWhitelistStatus } = useWhitelistStatus(userId || undefined);
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useNFTBalance(address as `0x${string}` | undefined);
  const { usdtAddress: usdtAddressFromContract, usdtDecimals, isLoading: isLoadingUsdtMeta } = useUSDTMeta();
  
  // Get user info to check which NFTs they've minted
  const { userInfo, isLoading: isLoadingUserInfo, refetch: refetchUserInfo } = useUserInfo(userId || undefined);
  
  // Auth fallback flags from login response
  const authHasStandardNFT = authUserData?.isMintedStandardNFT === true;
  const authHasProNFT = authUserData?.isMintedProNFT === true;

  // Check which NFTs user has minted from mintedColls (mapped to collectionIds)
  // Handle both bigint and number types
  const hasStandardNFTOnChain = userInfo?.collectionIds?.some(id => {
    const numId = typeof id === 'bigint' ? Number(id) : Number(id);
    return numId === 1;
  }) ?? false;
  const hasProNFTOnChain = userInfo?.collectionIds?.some(id => {
    const numId = typeof id === 'bigint' ? Number(id) : Number(id);
    return numId === 2;
  }) ?? false;

  const hasStandardNFT = hasStandardNFTOnChain || authHasStandardNFT;
  const hasProNFT = hasProNFTOnChain || authHasProNFT;


  // Check USDT allowance
  const nftContractAddress = getNFTContractAddress();
  const usdtEnvAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}` | undefined;
  const usdtAddress = (usdtEnvAddress || usdtAddressFromContract) as `0x${string}` | undefined;

  // Write hooks for minting
  const { approveUSDT, isPending: isApproving, isSuccess: isApproveSuccess, error: approveError, reset: resetApprove } = useApproveUSDT(usdtAddress, nftContractAddress);
  const { publicMint, isPending: isPublicMinting, isSuccess: isPublicMintSuccess, error: publicMintError, reset: resetPublicMint } = usePublicMint();
  const { whitelistMint, isPending: isWhitelistMinting, isSuccess: isWhitelistMintSuccess, error: whitelistMintError, reset: resetWhitelistMint } = useWhitelistMint();
  const isMinting = isPublicMinting || isWhitelistMinting;
  
  const { data: allowance } = useReadContract({
    address: usdtAddress,
    abi: [
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'allowance',
    args: address && nftContractAddress ? [address, nftContractAddress] : undefined,
    query: {
      enabled: !!address && !!usdtAddress && !!nftContractAddress,
    },
  });

  // Check if user has minted any NFT (for backward compatibility)
  const hasMinted = hasStandardNFT || hasProNFT;

  const standardMintPrice = standardCollection?.mintPrice;
  const proMintPrice = proCollection?.mintPrice;

  const whitelistBlockedStandard = isWhitelisted === true && whitelistMintActiveStandard === false;
  const whitelistBlockedPro = isWhitelisted === true && whitelistMintActivePro === false;
  const whitelistReadyStandard = isWhitelisted === true && whitelistMintActiveStandard === true;
  const whitelistReadyPro = isWhitelisted === true && whitelistMintActivePro === true;

  const mintingWindowOpenStandard =
    isWhitelisted === true ? whitelistReadyStandard || publicMintActiveStandard === true : publicMintActiveStandard === true;
  const mintingWindowOpenPro =
    isWhitelisted === true ? whitelistReadyPro || publicMintActivePro === true : publicMintActivePro === true;

  const isStatusLoading =
    isLoadingMintActiveStandard ||
    isLoadingMintActivePro ||
    isLoadingWhitelistActiveStandard ||
    isLoadingWhitelistActivePro ||
    isLoadingWhitelistStatus ||
    isLoadingBalance ||
    isLoadingUserInfo ||
    (!usdtEnvAddress && isLoadingUsdtMeta);

  // Error logging for collection data
  useEffect(() => {
    if (standardCollectionError) {
      console.error('Error fetching standard collection:', standardCollectionError);
    }
    if (proCollectionError) {
      console.error('Error fetching pro collection:', proCollectionError);
    }
  }, [standardCollectionError, proCollectionError]);

  // Format price function - Price comes in Ether format (18 decimals), display as USDT
  const formatPrice = (raw?: bigint) => {
    if (raw === undefined || raw === null) {
      return 'N/A';
    }
    
    // Price comes in Ether format (18 decimals)
    const decimals = 18;
    
    // Use bigint division for precision
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    const remainder = raw % divisor;
    
    // Handle remainder
    if (remainder === BigInt(0)) {
      // No decimal part
      const numValue = Number(whole);
      return `${numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USDT`;
    } else {
      // Convert remainder to decimal string
      const remainderStr = remainder.toString().padStart(decimals, '0');
      const trimmedRemainder = remainderStr.replace(/0+$/, '');
      
      // Combine whole and decimal parts
      const decimalValue = parseFloat(`0.${trimmedRemainder}`);
      const totalValue = Number(whole) + decimalValue;
      
      return `${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
    }
  };
  const formattedStandardPrice = formatPrice(standardMintPrice);
  const formattedProPrice = formatPrice(proMintPrice);

  // Format supply numbers (bigint) - convert to readable format without losing precision
  const formatSupplyNumber = (num?: bigint): string => {
    if (num === undefined || num === null) return 'N/A';
    
    // Convert bigint to string for precision
    const numStr = num.toString();
    
    // Format with commas for readability
    // Add commas every 3 digits from right to left
    const formatted = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return formatted;
  };

  const proBenefits = [
    'Unlimited Advanced Analytics',
    'Priority Support Channel',
    'Early Feature Access',
    'Private Community Pass',
  ];

  // Calculate supply values using bigint arithmetic (preserve precision)
  // Remaining supply = maxSupply - currentSupply (from getCurrentSupply)
  const standardRemainingSupply = standardMax !== undefined && standardCurrent !== undefined 
    ? standardMax - standardCurrent 
    : undefined;
  const standardProgress = standardMax && standardCurrent !== undefined && standardMax > BigInt(0)
    ? Number((standardCurrent * BigInt(10000)) / standardMax) / 100 // Use bigint for precision, then convert to number for percentage
    : 0;

  const proRemainingSupply = proMax !== undefined && proCurrent !== undefined 
    ? proMax - proCurrent 
    : undefined;
  const proProgress = proMax && proCurrent !== undefined && proMax > BigInt(0)
    ? Number((proCurrent * BigInt(10000)) / proMax) / 100 // Use bigint for precision, then convert to number for percentage
    : 0;

  // Track pending mint request details (per collection)
  const [pendingCollectionId, setPendingCollectionId] = useState<number | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const isStandardProcessing =
    pendingCollectionId === 1 &&
    (mintingStep === 'approving' || mintingStep === 'minting' || isApproving || isMinting);
  const isProProcessing =
    pendingCollectionId === 2 &&
    (mintingStep === 'approving' || mintingStep === 'minting' || isApproving || isMinting);

  // Standard button: disabled if Pro NFT Minted OR Standard NFT is minted
  // Enable button as soon as critical data is available, don't wait for all status checks
  const standardButtonEnabled =
    isConnected &&
    !whitelistBlockedStandard &&
    !isStandardProcessing &&
    standardMintPrice !== undefined &&
    standardMintPrice !== null &&
    mintingWindowOpenStandard &&
    // Only wait for critical loading states: user info (to check NFTs) and mint price
    !isLoadingUserInfo &&
    !isLoadingStandardCollection &&
    // Don't wait for other status checks - they can load in background
    !hasStandardNFT &&
    !hasProNFT; // Disable if Pro NFT Minted

  // Pro button: disabled only if Pro NFT Minted (can upgrade from Standard)
  // Enable button as soon as critical data is available, don't wait for all status checks
  const proButtonEnabled =
    isConnected &&
    !whitelistBlockedPro &&
    !isProProcessing &&
    proMintPrice !== undefined &&
    proMintPrice !== null &&
    mintingWindowOpenPro &&
    // Only wait for critical loading states: user info (to check NFTs) and mint price
    !isLoadingUserInfo &&
    !isLoadingProCollection &&
    // Don't wait for other status checks - they can load in background
    !hasProNFT; // Only disable if Pro NFT Minted (Standard NFT doesn't block Pro)

  const showLoader =
    isStatusLoading ||
    isLoadingUserInfo ||
    isStandardProcessing ||
    isProProcessing ||
    mintingStep === 'approving' ||
    mintingStep === 'minting';

  // Handle approve success - proceed to mint
  useEffect(() => {
    if (isApproveSuccess && mintingStep === 'approving') {
      setMintingStep('minting');
      if (pendingCollectionId !== null && pendingUserId) {
        handleMintAfterApprove(pendingCollectionId, pendingUserId);
      }
    }
  }, [isApproveSuccess, mintingStep, pendingCollectionId, pendingUserId]);

  // Handle mint success
  useEffect(() => {
    const succeeded = (isPublicMintSuccess || isWhitelistMintSuccess) && mintingStep === 'minting';
    if (succeeded) {
      setMintingStep('success');
      refetchBalance?.();
      refetchStandardSupply?.();
      refetchProSupply?.();
      refetchUserInfo?.(); // Refetch user info to update minted collections
      setPendingCollectionId(null);
      setPendingUserId(null);
    }
  }, [isPublicMintSuccess, isWhitelistMintSuccess, mintingStep, refetchBalance, refetchStandardSupply, refetchProSupply, refetchUserInfo]);

  // Helper to assign error to the correct tier
  const setTierError = (collectionId: number | null, message: string | null) => {
    if (collectionId === 1) {
      setStandardError(message);
    } else if (collectionId === 2) {
      setProError(message);
    } else {
      // Fallback: apply to both if we don't know which tier
      setStandardError(message);
      setProError(message);
    }
  };

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setMintingStep('error');
      // Check if user rejected the transaction
      if (isUserRejection(approveError)) {
        showRejectionToast();
        setTierError(pendingCollectionId, null); // Clear error message for rejection
      } else {
        setTierError(pendingCollectionId, approveError.message || 'Approval failed');
      }
    }
    if (publicMintError || whitelistMintError) {
      setMintingStep('error');
      const mintError = publicMintError || whitelistMintError;
      // Check if user rejected the transaction
      if (mintError && isUserRejection(mintError)) {
        showRejectionToast();
        setTierError(pendingCollectionId, null); // Clear error message for rejection
      } else {
        setTierError(
          pendingCollectionId,
          publicMintError?.message || whitelistMintError?.message || 'Minting failed'
        );
      }
    }
  }, [approveError, publicMintError, whitelistMintError, pendingCollectionId]);

  const handleMintAfterApprove = async (collectionId: number, user: string) => {
    try {
      if (isWhitelisted) {
        await whitelistMint(user, collectionId);
      } else {
        await publicMint(user, collectionId);
      }
    } catch (error: any) {
      setMintingStep('error');
      // Check if user rejected the transaction
      if (isUserRejection(error)) {
        showRejectionToast();
        setTierError(collectionId, null); // Clear error message for rejection
      } else {
        setTierError(collectionId, error?.message || 'Minting failed');
        showFailedAlert(
          `Something Went Wrong. Please try again.`,
      );
      }
    }
  };

  const handleMint = async (collectionId: number) => {
    if (!isConnected || !address) {
      setTierError(collectionId, 'Please connect your wallet');
      return;
    }

    if (!userId) {
      setTierError(collectionId, 'User ID not found. Please login again.');
      return;
    }

    const whitelistReadyLocal =
      (collectionId === 1 ? whitelistReadyStandard : whitelistReadyPro) === true;
    const whitelistBlockedLocal =
      collectionId === 1 ? whitelistBlockedStandard : whitelistBlockedPro;
    const mintingWindowOpenLocal =
      collectionId === 1 ? mintingWindowOpenStandard : mintingWindowOpenPro;

    // const mintingAllowed =
    //   !hasMinted &&
    //   !whitelistBlockedLocal &&
    //   (mintingWindowOpenLocal === true || whitelistReadyLocal);

    // if (!mintingAllowed) {
    //   setTierError(collectionId, 'Minting is not active.');
    //   return;
    // }

    const collection = collectionId === 1 ? standardCollection : proCollection;
    const mintPrice = collection?.mintPrice;
    if (mintPrice === undefined || mintPrice === null) {
      setTierError(collectionId, 'Unable to fetch mint price. Please try again.');
      return;
    }

    // Check if public mint is active
    if (!mintingWindowOpenLocal) {
      setTierError(collectionId, 'Minting is not currently active.');
      return;
    }

    if (mintingWindowOpenLocal === undefined && !isStatusLoading) {
      setTierError(collectionId, 'Unable to check mint status. Please try again.');
      return;
    }

    try {
      setTierError(collectionId, null);
      setMintingStep('approving');
      setPendingCollectionId(collectionId);
      setPendingUserId(userId);

      // Check if we need to approve (allowance is less than mint price)
      const needsApproval = !allowance || allowance < mintPrice;

      if (needsApproval) {
        // Approve USDT spending (approve slightly more than needed for gas efficiency)
        const approveAmount = mintPrice * BigInt(2); // Approve 2x the amount
        await approveUSDT(approveAmount);
      } else {
        // Already approved, proceed directly to mint
        setMintingStep('minting');
        await handleMintAfterApprove(collectionId, userId);
      }
    } catch (error: any) {
      setMintingStep('error');
      // Check if user rejected the transaction
      if (isUserRejection(error)) {
        showRejectionToast();
        setTierError(collectionId, null); // Clear error message for rejection
        return;
      }
      
      // Parse error message for better user feedback
      const errorMsg = error?.message || error?.shortMessage || 'Transaction failed';
      if (errorMsg.includes('MintPriceNotSet')) {
        setTierError(collectionId, 'Mint price is not set in the contract. Please contact the contract owner.');
      } else if (errorMsg.includes('PublicMintNotActive')) {
        setTierError(collectionId, 'Public minting is not currently active.');
      } else if (errorMsg.includes('InsufficientPayment')) {
        setTierError(collectionId, 'Insufficient USDT balance or allowance.');
      } else {
        setTierError(collectionId, errorMsg);
        showFailedAlert(
          `Something Went Wrong. Please try again.`,
      );
      }
      console.error('Mint error:', error);
    }
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 fullhd:px-16 py-8 xl:py-12 fullhd:py-16 max-w-7xl xl:max-w-[1600px] fullhd:max-w-[1800px] relative">
      {showLoader && (
        <div 
          className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/70"
          style={{ 
            pointerEvents: 'all',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Spinner visible={showLoader} size="lg" />
        </div>
      )}
      {/* Header Section */}
      <div className="mb-8 xl:mb-12 fullhd:mb-16">
        <h1 className="text-3xl sm:text-4xl xl:text-5xl fullhd:text-6xl font-bold text-white mb-3 xl:mb-4 fullhd:mb-6">
          Mint Your Polynado NFT
        </h1>
        <p className="text-base sm:text-lg xl:text-xl fullhd:text-2xl text-gray-400 max-w-4xl xl:max-w-5xl fullhd:max-w-6xl">
          Unlock permanent Pro access to Polynado's market intelligence platform. Choose between Standard or Pro tier NFTs to gain lifetime access to advanced analytics, AI-powered insights, and exclusive features.
        </p>
      </div>

      {/* NFT Tiers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 fullhd:gap-16 mb-8 xl:mb-12 fullhd:mb-16">
        {/* STANDARD TIER */}
        <div
          className="relative rounded-xl overflow-hidden p-6 flex flex-col h-full"
          style={{
            borderColor: '#6C6C6C',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          {/* 3D Cube Image Container */}
          <div className="relative flex justify-center items-center mb-6" style={{ minHeight: '400px' }}>
            <div className="relative">
              {/* Cube Image */}
              <img
                src="/image 32.png"
                alt="Standard Tier NFT"
                className=" object-contain relative z-10"
                style={{ width: '300px', height: '300px' }}
              />
            </div>
          </div>

          {/* Title with Price */}
          <div className="flex justify-between items-center mb-6" style={{ minHeight: '32px' }}>
            <h3 className="text-xl font-bold text-white">STANDARD TIER</h3>
            <span className="text-xl font-bold text-orange-400">
              {isLoadingStandardCollection ? '...' : formattedStandardPrice}
            </span>
          </div>

          {/* Supply Information */}
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white mb-1">Supply Remaining</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingStandardSupply || isLoadingStandardCollection ? '...' : formatSupplyNumber(standardRemainingSupply)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingStandardSupply || isLoadingStandardCollection ? '...' : formatSupplyNumber(standardMax)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${standardProgress}%` }}
              />
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={() => {
              if (!standardButtonEnabled) return;
              handleMint(1);
            }}
            disabled={!standardButtonEnabled}
            className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 relative overflow-hidden ${
              standardButtonEnabled ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-50'
            }`}
            style={
              standardButtonEnabled
                ? {
                    backgroundImage:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow:
                      '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }
                : {
                    background: '#4a4a4a',
                    color: '#9ca3af',
                  }
            }
          >
            {hasProNFT
              ? 'Pro NFT Minted'
              : hasStandardNFT
              ? 'Standard NFT is Minted'
              : !isConnected
              ? 'Connect Wallet'
              : whitelistBlockedStandard
              ? 'Whitelist mint is not active'
              : isStandardProcessing && (mintingStep === 'approving' || isApproving)
              ? 'Approving...'
              : isStandardProcessing && (mintingStep === 'minting' || isMinting)
              ? 'Minting...'
              : 'Mint Now'}
          </button>
          {standardError && (
            <p className="text-xs text-red-400 text-center mt-2">{standardError}</p>
          )}
        </div>

        {/* PRO TIER */}
        <div
          className="relative rounded-xl overflow-hidden p-6 flex flex-col h-full"
          style={{
            borderColor: '#6C6C6C',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          {/* 3D Cube Video Container */}
          <div className="relative flex justify-center items-center mb-6" style={{ minHeight: '400px' }}>
            <div className="relative">
              {/* Cube Video */}
              <video
                src="/Revolving_Cube_With_Flowing_Particles.mp4"
                className="object-contain relative z-10"
                style={{ width: '400px', height: '400px' }}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
              />
            </div>
          </div>

          {/* Title with Price */}
          <div className="flex justify-between items-center mb-6" style={{ minHeight: '32px' }}>
            <h3 className="text-xl font-bold text-white">PRO TIER</h3>
            <span className="text-xl font-bold text-orange-400">
              {isLoadingProCollection ? '...' : formattedProPrice}
            </span>
          </div>

          {/* Supply Information */}
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white mb-1">Supply Remaining</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingProSupply || isLoadingProCollection ? '...' : formatSupplyNumber(proRemainingSupply)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingProSupply || isLoadingProCollection ? '...' : formatSupplyNumber(proMax)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${proProgress}%` }}
              />
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={() => {
              if (!proButtonEnabled) return;
              handleMint(2);
            }}
            disabled={!proButtonEnabled}
            className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 relative overflow-hidden ${
              proButtonEnabled ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-50'
            }`}
            style={
              proButtonEnabled
                ? {
                    backgroundImage:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow:
                      '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                  }
                : {
                    background: '#4a4a4a',
                    color: '#9ca3af',
                  }
            }
          >
            {hasProNFT
              ? 'Pro NFT Minted'
              : hasStandardNFT
              ? 'Upgrade to Pro'
              : !isConnected
              ? 'Connect Wallet'
              : whitelistBlockedPro
              ? 'Whitelist mint is not active'
              : isProProcessing && (mintingStep === 'approving' || isApproving)
              ? 'Approving...'
              : isProProcessing && (mintingStep === 'minting' || isMinting)
              ? 'Minting...'
              : 'Mint Now'}
          </button>
          {proError && (
            <p className="text-xs text-red-400 text-center mt-2">{proError}</p>
          )}
        </div>
      </div>

      {/* Common Features Section */}
      <div
        className="relative rounded-xl overflow-hidden p-6"
        style={{
          borderColor: '#6C6C6C',
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
      >
        {/* Title with icon */}
        <div className="flex items-center gap-2 mb-6">
          <SettingOutlined className="text-orange-400 text-xl" />
          <h3 className="text-xl font-bold text-white">Common features</h3>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              <span className="text-orange-400">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NFTMintPage: React.FC = () => {
  return (
    <MainLayout>
      <NFTMintDashboard />
    </MainLayout>
  );
};

export default NFTMintPage;

