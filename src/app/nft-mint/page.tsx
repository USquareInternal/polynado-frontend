'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAccount, useReadContract } from 'wagmi';
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useMintPrice, useMaxSupply, useRemainingSupply, useApproveUSDT, useMintNFT, usePublicMintActive, getNFTContractAddress, useWhitelistMintActive, useWhitelistStatus, useNFTBalance, useUSDTMeta } from '@/utils/nftContract';

const NFTMintDashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [mintingStep, setMintingStep] = useState<'idle' | 'approving' | 'minting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read contract data
  const { mintPrice, isLoading: isLoadingPrice, error: priceError } = useMintPrice();
  const { maxSupply, isLoading: isLoadingMaxSupply, error: maxSupplyError } = useMaxSupply();
  const { remainingSupply, isLoading: isLoadingRemainingSupply, error: remainingSupplyError, refetch: refetchRemainingSupply } = useRemainingSupply();
  const { publicMintActive, isLoading: isLoadingMintActive } = usePublicMintActive();
  const { whitelistMintActive, isLoading: isLoadingWhitelistActive } = useWhitelistMintActive();
  const { isWhitelisted, isLoading: isLoadingWhitelistStatus, refetch: refetchWhitelistStatus } = useWhitelistStatus(address as `0x${string}` | undefined);
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useNFTBalance(address as `0x${string}` | undefined);
  const { usdtAddress: usdtAddressFromContract, usdtDecimals, isLoading: isLoadingUsdtMeta } = useUSDTMeta();

  // Check USDT allowance
  const nftContractAddress = getNFTContractAddress();
  const usdtEnvAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}` | undefined;
  const usdtAddress = (usdtEnvAddress || usdtAddressFromContract) as `0x${string}` | undefined;

  // Write hooks for minting
  const { approveUSDT, isPending: isApproving, isSuccess: isApproveSuccess, error: approveError, reset: resetApprove } = useApproveUSDT(usdtAddress, nftContractAddress);
  const { mint, isPending: isMinting, isSuccess: isMintSuccess, error: mintError, reset: resetMint } = useMintNFT();
  
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
  const whitelistBlocked = isWhitelisted === true && whitelistMintActive === false;
  const whitelistReady = isWhitelisted === true && whitelistMintActive === true;
  const mintingWindowOpen =
    isWhitelisted === true
      ? whitelistReady || publicMintActive === true
      : publicMintActive === true;
  const isStatusLoading =
    isLoadingMintActive ||
    isLoadingWhitelistActive ||
    isLoadingWhitelistStatus ||
    isLoadingBalance ||
    (!usdtEnvAddress && isLoadingUsdtMeta);

  // Debug logging
  useEffect(() => {
    console.log('Contract Data:', {
      mintPrice,
      maxSupply,
      remainingSupply,
      isLoadingPrice,
      isLoadingMaxSupply,
      isLoadingRemainingSupply,
      priceError,
      maxSupplyError,
      remainingSupplyError,
      whitelistMintActive,
      isWhitelisted,
      balance,
      contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    });
  }, [mintPrice, maxSupply, remainingSupply, isLoadingPrice, isLoadingMaxSupply, isLoadingRemainingSupply, priceError, maxSupplyError, remainingSupplyError, whitelistMintActive, isWhitelisted, balance]);


  // Format mint price (assuming USDT with 6 decimals)
  const formattedPrice = useMemo(() => {
    if (isLoadingPrice) return 'Loading...';
    if (priceError) return 'N/A';
    if (mintPrice === undefined || mintPrice === null) return 'N/A';
    const decimals = usdtDecimals ?? 6;
    const divisor = 10 ** decimals;
    const priceInUSDT = Number(mintPrice) / divisor;
    return `${priceInUSDT.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
  }, [mintPrice, isLoadingPrice, priceError, usdtDecimals]);

  // Format max supply
  const formattedMaxSupply = useMemo(() => {
    if (isLoadingMaxSupply) return 'Loading...';
    if (maxSupplyError || maxSupply === undefined) return 'N/A';
    console.log(maxSupply);
    return maxSupply.toString();
  }, [maxSupply, isLoadingMaxSupply, maxSupplyError]);

  // Format remaining supply
  const formattedRemainingSupply = useMemo(() => {
    if (isLoadingRemainingSupply) return 'Loading...';
    if (remainingSupplyError || remainingSupply === undefined) return 'N/A';
    console.log(remainingSupply);
    return remainingSupply.toString();
  }, [remainingSupply, isLoadingRemainingSupply, remainingSupplyError]);

  const isLoading = isLoadingPrice || isLoadingMaxSupply || isLoadingRemainingSupply;

  const proBenefits = [
    'Unlimited Advanced Analytics',
    'Priority Support Channel',
    'Early Feature Access',
    'Private Community Pass',
  ];

  // Calculate supply metrics for both tiers
  const standardMaxSupply = maxSupply ? Number(maxSupply) : 100;
  const standardRemainingSupply = remainingSupply ? Number(remainingSupply) : 75;
  const standardMinted = standardMaxSupply - standardRemainingSupply;
  const standardProgress = standardMaxSupply > 0 ? (standardMinted / standardMaxSupply) * 100 : 0;

  const proMaxSupply = maxSupply ? Number(maxSupply) : 100;
  const proRemainingSupply = remainingSupply ? Number(remainingSupply) : 75;
  const proMinted = proMaxSupply - proRemainingSupply;
  const proProgress = proMaxSupply > 0 ? (proMinted / proMaxSupply) * 100 : 0;

  // Handle approve success - proceed to mint
  useEffect(() => {
    if (isApproveSuccess && mintingStep === 'approving') {
      setMintingStep('minting');
      handleMintAfterApprove();
    }
  }, [isApproveSuccess, mintingStep]);

  // Handle mint success
  useEffect(() => {
    if (isMintSuccess && mintingStep === 'minting') {
      setMintingStep('success');
      refetchBalance?.();
      refetchRemainingSupply?.();
    }
  }, [isMintSuccess, mintingStep, refetchBalance, refetchRemainingSupply]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setMintingStep('error');
      setErrorMessage(approveError.message || 'Approval failed');
    }
    if (mintError) {
      setMintingStep('error');
      setErrorMessage(mintError.message || 'Minting failed');
    }
  }, [approveError, mintError]);

  const handleMintAfterApprove = async () => {
    try {
      await mint(1, 'ADMIN');
    } catch (error: any) {
      setMintingStep('error');
      setErrorMessage(error?.message || 'Minting failed');
    }
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      setErrorMessage('Please connect your wallet');
      return;
    }

    const whitelistReadyLocal = whitelistMintActive === true && isWhitelisted === true;
    const mintingAllowed =
      !hasMinted &&
      !whitelistBlocked &&
      (publicMintActive === true || whitelistReadyLocal);

    if (!mintingAllowed) {
      setErrorMessage('Minting is not active.');
      return;
    }

    // Validate contract state before minting
    if (mintPrice === undefined || mintPrice === null) {
      setErrorMessage('Unable to fetch mint price. Please try again.');
      return;
    }

    // Check if public mint is active
    if (!mintingWindowOpen) {
      setErrorMessage('Minting is not currently active.');
      return;
    }

    if (mintingWindowOpen === undefined && !isStatusLoading) {
      setErrorMessage('Unable to check mint status. Please try again.');
      return;
    }

    try {
      setErrorMessage(null);
      setMintingStep('approving');

      // Check if we need to approve (allowance is less than mint price)
      const needsApproval = !allowance || allowance < mintPrice;

      if (needsApproval) {
        // Approve USDT spending (approve slightly more than needed for gas efficiency)
        const approveAmount = mintPrice * BigInt(2); // Approve 2x the amount
        await approveUSDT(approveAmount);
      } else {
        // Already approved, proceed directly to mint
        setMintingStep('minting');
        await handleMintAfterApprove();
      }
    } catch (error: any) {
      setMintingStep('error');
      // Parse error message for better user feedback
      const errorMsg = error?.message || error?.shortMessage || 'Transaction failed';
      if (errorMsg.includes('MintPriceNotSet')) {
        setErrorMessage('Mint price is not set in the contract. Please contact the contract owner.');
      } else if (errorMsg.includes('PublicMintNotActive')) {
        setErrorMessage('Public minting is not currently active.');
      } else if (errorMsg.includes('InsufficientPayment')) {
        setErrorMessage('Insufficient USDT balance or allowance.');
      } else {
        setErrorMessage(errorMsg);
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
                  {isLoadingRemainingSupply ? '...' : standardRemainingSupply}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingMaxSupply ? '...' : standardMaxSupply}
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
            onClick={handleMint}
            disabled={
              !isConnected ||
              whitelistBlocked ||
              isApproving ||
              isMinting ||
              mintingStep === 'approving' ||
              mintingStep === 'minting' ||
              isStatusLoading ||
              !mintingWindowOpen ||
              mintPrice === undefined ||
              mintPrice === null ||
              hasMinted
            }
            className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 relative overflow-hidden ${
              isConnected &&
              !whitelistBlocked &&
              !isApproving && 
              !isMinting && 
              mintingStep === 'idle' &&
              mintPrice !== undefined &&
              mintPrice !== null &&
              mintingWindowOpen &&
              !isStatusLoading &&
              !hasMinted
                ? 'cursor-pointer hover:brightness-110'
                : 'cursor-not-allowed opacity-50'
            }`}
            style={
              isConnected &&
              !whitelistBlocked &&
              !isApproving && 
              !isMinting && 
              mintingStep === 'idle' &&
              mintPrice !== undefined &&
              mintPrice !== null &&
              mintingWindowOpen &&
              !isStatusLoading &&
              !hasMinted
                ? {
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
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
              : mintingStep === 'approving' || isApproving
              ? 'Approving...'
              : mintingStep === 'minting' || isMinting
              ? 'Minting...'
              : 'Mint Now'}
          </button>
          {errorMessage && (
            <p className="text-xs text-red-400 text-center mt-2">{errorMessage}</p>
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
                  {isLoadingRemainingSupply ? '...' : proRemainingSupply}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-orange-400">
                  {isLoadingMaxSupply ? '...' : proMaxSupply}
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
            onClick={handleMint}
            disabled={
              !isConnected ||
              whitelistBlocked ||
              isApproving ||
              isMinting ||
              mintingStep === 'approving' ||
              mintingStep === 'minting' ||
              isStatusLoading ||
              !mintingWindowOpen ||
              mintPrice === undefined ||
              mintPrice === null ||
              hasMinted
            }
            className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 relative overflow-hidden ${
              isConnected &&
              !whitelistBlocked &&
              !isApproving && 
              !isMinting && 
              mintingStep === 'idle' &&
              mintPrice !== undefined &&
              mintPrice !== null &&
              mintingWindowOpen &&
              !isStatusLoading &&
              !hasMinted
                ? 'cursor-pointer hover:brightness-110'
                : 'cursor-not-allowed opacity-50'
            }`}
            style={
              isConnected &&
              !whitelistBlocked &&
              !isApproving && 
              !isMinting && 
              mintingStep === 'idle' &&
              mintPrice !== undefined &&
              mintPrice !== null &&
              mintingWindowOpen &&
              !isStatusLoading &&
              !hasMinted
                ? {
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
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
              : mintingStep === 'approving' || isApproving
              ? 'Approving...'
              : mintingStep === 'minting' || isMinting
              ? 'Minting...'
              : 'Mint Now'}
          </button>
          {errorMessage && (
            <p className="text-xs text-red-400 text-center mt-2">{errorMessage}</p>
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

