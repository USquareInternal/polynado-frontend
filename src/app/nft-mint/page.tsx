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
} from '@/utils/nftContract';
import { showSuccessAlert,showFailedAlert } from "@/utils/SweetAlertUtils";

const NFTMintDashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [mintingStep, setMintingStep] = useState<'idle' | 'approving' | 'minting' | 'success' | 'error'>('idle');
  const [standardError, setStandardError] = useState<string | null>(null);
  const [proError, setProError] = useState<string | null>(null);

  // Derive a userId (login not wired yet)
  const userId = React.useMemo(
    () => (address ? address : `guest-${Math.random().toString(36).slice(2, 8)}`),
    [address]
  );

  // Read contract data (per collection)
  const { collection: standardCollection, isLoading: isLoadingStandardCollection } = useCollectionInfo(1);
  const { collection: proCollection, isLoading: isLoadingProCollection } = useCollectionInfo(2);
  const { current: standardCurrent, max: standardMax, isLoading: isLoadingStandardSupply, refetch: refetchStandardSupply } = useCollectionSupply(1);
  const { current: proCurrent, max: proMax, isLoading: isLoadingProSupply, refetch: refetchProSupply } = useCollectionSupply(2);
  const { publicMintActive: publicMintActiveStandard, isLoading: isLoadingMintActiveStandard } = usePublicMintActive(1);
  const { publicMintActive: publicMintActivePro, isLoading: isLoadingMintActivePro } = usePublicMintActive(2);
  const { whitelistMintActive: whitelistMintActiveStandard, isLoading: isLoadingWhitelistActiveStandard } = useWhitelistMintActive(1);
  const { whitelistMintActive: whitelistMintActivePro, isLoading: isLoadingWhitelistActivePro } = useWhitelistMintActive(2);
  const { isWhitelisted, isLoading: isLoadingWhitelistStatus, refetch: refetchWhitelistStatus } = useWhitelistStatus(userId);
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useNFTBalance(address as `0x${string}` | undefined);
  const { usdtAddress: usdtAddressFromContract, usdtDecimals, isLoading: isLoadingUsdtMeta } = useUSDTMeta();

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

  const hasMinted = (balance ?? BigInt(0)) > BigInt(0);

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
    (!usdtEnvAddress && isLoadingUsdtMeta);

  // Debug logging
  useEffect(() => {
    console.log('Collection data', {
      standardCollection,
      proCollection,
      standardSupply: { current: standardCurrent, max: standardMax },
      proSupply: { current: proCurrent, max: proMax },
    });
  }, [standardCollection, proCollection, standardCurrent, standardMax, proCurrent, proMax]);


  const formatPrice = (raw?: bigint) => {
    if (raw === undefined || raw === null) return 'N/A';
    const decimals = usdtDecimals ?? 6;
    const divisor = 10 ** decimals;
    const val = Number(raw) / divisor;
    return `${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
  };
  const formattedStandardPrice = formatPrice(standardMintPrice);
  const formattedProPrice = formatPrice(proMintPrice);

  const proBenefits = [
    'Unlimited Advanced Analytics',
    'Priority Support Channel',
    'Early Feature Access',
    'Private Community Pass',
  ];

  const standardMaxSupply = standardMax ? Number(standardMax) : undefined;
  const standardRemainingSupply = standardMax !== undefined && standardCurrent !== undefined ? Number(standardMax - standardCurrent) : undefined;
  const standardProgress = standardMax && standardCurrent !== undefined && standardMax > 0 ? (Number(standardCurrent) / Number(standardMax)) * 100 : 0;

  const proMaxSupply = proMax ? Number(proMax) : undefined;
  const proRemainingSupply = proMax !== undefined && proCurrent !== undefined ? Number(proMax - proCurrent) : undefined;
  const proProgress = proMax && proCurrent !== undefined && proMax > 0 ? (Number(proCurrent) / Number(proMax)) * 100 : 0;

  // Track pending mint request details (per collection)
  const [pendingCollectionId, setPendingCollectionId] = useState<number | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const isStandardProcessing =
    pendingCollectionId === 1 &&
    (mintingStep === 'approving' || mintingStep === 'minting' || isApproving || isMinting);
  const isProProcessing =
    pendingCollectionId === 2 &&
    (mintingStep === 'approving' || mintingStep === 'minting' || isApproving || isMinting);

  const standardButtonEnabled =
    isConnected &&
    !whitelistBlockedStandard &&
    !isStandardProcessing &&
    standardMintPrice !== undefined &&
    standardMintPrice !== null &&
    mintingWindowOpenStandard &&
    !isStatusLoading &&
    !hasMinted;

  const proButtonEnabled =
    isConnected &&
    !whitelistBlockedPro &&
    !isProProcessing &&
    proMintPrice !== undefined &&
    proMintPrice !== null &&
    mintingWindowOpenPro &&
    !isStatusLoading &&
    !hasMinted;

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
      setPendingCollectionId(null);
      setPendingUserId(null);
    }
  }, [isPublicMintSuccess, isWhitelistMintSuccess, mintingStep, refetchBalance, refetchStandardSupply, refetchProSupply]);

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
      setTierError(pendingCollectionId, approveError.message || 'Approval failed');
    }
    if (publicMintError || whitelistMintError) {
      setMintingStep('error');
      setTierError(
        pendingCollectionId,
        publicMintError?.message || whitelistMintError?.message || 'Minting failed'
      );
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
      setTierError(collectionId, error?.message || 'Minting failed');
      showFailedAlert(
        `Something Went Wrong. Please try again.`,
    );
    }
  };

  const handleMint = async (collectionId: number) => {
    if (!isConnected || !address) {
      setTierError(collectionId, 'Please connect your wallet');
      return;
    }

    const whitelistReadyLocal =
      (collectionId === 1 ? whitelistReadyStandard : whitelistReadyPro) === true;
    const whitelistBlockedLocal =
      collectionId === 1 ? whitelistBlockedStandard : whitelistBlockedPro;
    const mintingWindowOpenLocal =
      collectionId === 1 ? mintingWindowOpenStandard : mintingWindowOpenPro;

    const mintingAllowed =
      !hasMinted &&
      !whitelistBlockedLocal &&
      (mintingWindowOpenLocal === true || whitelistReadyLocal);

    if (!mintingAllowed) {
      setTierError(collectionId, 'Minting is not active.');
      return;
    }

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
    <div className=" mx-auto px-4 py-8">
      {/* NFT Tiers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* STANDARD TIER */}
        <div
          className="relative rounded-xl overflow-hidden border border-orange-500/40 shadow-[0_0_30px_rgba(255,140,60,0.2)] p-6"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 12%, rgba(255,140,60,0.15) 0%, rgba(255,140,60,0) 46%),' +
              'radial-gradient(circle at 88% 85%, rgba(255,115,45,0.12) 0%, rgba(255,115,45,0) 48%),' +
              'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
          }}
        >
          {/* 3D Cube Image Container */}
          <div className="relative flex justify-center items-center mb-6">
            <div className="relative">
              {/* Glowing base */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-500/30 rounded-full blur-xl"></div>
              {/* Cube Image */}
              <img
                src="/image 32.png"
                alt="Standard Tier NFT"
                className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,140,60,0.5)]"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white text-center mb-6">STANDARD TIER</h3>

          {/* Supply Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white mb-1">Supply Remaining</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingStandardSupply || isLoadingStandardCollection ? '...' : (standardRemainingSupply ?? 'N/A')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingStandardSupply || isLoadingStandardCollection ? '...' : (standardMaxSupply ?? 'N/A')}
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
            onClick={() => handleMint(1)}
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
            {hasMinted
              ? 'Minted'
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
          className="relative rounded-xl overflow-hidden border border-orange-500/50 shadow-[0_0_30px_rgba(255,140,60,0.3)] p-6"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 12%, rgba(255,140,60,0.25) 0%, rgba(255,140,60,0) 46%),' +
              'radial-gradient(circle at 88% 85%, rgba(255,115,45,0.20) 0%, rgba(255,115,45,0) 48%),' +
              'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
          }}
        >
          {/* 3D Cube Image Container with enhanced effects */}
          <div className="relative flex justify-center items-center mb-6">
            <div className="relative">
              {/* Enhanced glowing base */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-orange-500/40 rounded-full blur-2xl animate-pulse"></div>
              {/* Cube Image with enhanced glow */}
              <img
                src="/image 32.png"
                alt="Pro Tier NFT"
                className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(255,140,60,0.7)]"
                style={{
                  filter: 'brightness(1.1) saturate(1.2)',
                }}
              />
              {/* Particle effects overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-ping"></div>
                <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-orange-500 rounded-full opacity-70 animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white text-center mb-6">PRO TIER</h3>

          {/* Supply Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white mb-1">Supply Remaining</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingProSupply || isLoadingProCollection ? '...' : (proRemainingSupply ?? 'N/A')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingProSupply || isLoadingProCollection ? '...' : (proMaxSupply ?? 'N/A')}
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
            onClick={() => handleMint(2)}
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
            {hasMinted
              ? 'Minted'
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
        className="relative rounded-xl overflow-hidden border border-orange-500/40 shadow-[0_0_30px_rgba(255,140,60,0.2)] p-6"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 12%, rgba(255,140,60,0.15) 0%, rgba(255,140,60,0) 46%),' +
            'radial-gradient(circle at 88% 85%, rgba(255,115,45,0.12) 0%, rgba(255,115,45,0) 48%),' +
            'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
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

