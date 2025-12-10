'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAccount, useReadContract } from 'wagmi';
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useMintPrice, useMaxSupply, useRemainingSupply, useApproveUSDT, useMintNFT, usePublicMintActive, getNFTContractAddress } from '@/utils/nftContract';

const NFTMintDashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [isMinted, setIsMinted] = useState(false);
  const [mintingStep, setMintingStep] = useState<'idle' | 'approving' | 'minting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read contract data
  const { mintPrice, isLoading: isLoadingPrice, error: priceError } = useMintPrice();
  const { maxSupply, isLoading: isLoadingMaxSupply, error: maxSupplyError } = useMaxSupply();
  const { remainingSupply, isLoading: isLoadingRemainingSupply, error: remainingSupplyError } = useRemainingSupply();
  const { publicMintActive, isLoading: isLoadingMintActive } = usePublicMintActive();

  // Write hooks for minting
  const { approveUSDT, isPending: isApproving, isSuccess: isApproveSuccess, error: approveError, reset: resetApprove } = useApproveUSDT();
  const { mint, isPending: isMinting, isSuccess: isMintSuccess, error: mintError, reset: resetMint } = useMintNFT();

  // Check USDT allowance
  const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}` | undefined;
  const nftContractAddress = getNFTContractAddress();
  
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
      contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    });
  }, [mintPrice, maxSupply, remainingSupply, isLoadingPrice, isLoadingMaxSupply, isLoadingRemainingSupply, priceError, maxSupplyError, remainingSupplyError]);


  // Format mint price (assuming USDT with 6 decimals)
  const formattedPrice = useMemo(() => {
    if (isLoadingPrice) return 'Loading...';
    if (priceError) return 'N/A';
    // Check if mintPrice is undefined/null, not if it's 0 (0n is a valid price)
    if (mintPrice === undefined || mintPrice === null) return 'N/A';
    // USDT has 6 decimals, so divide by 1e6
    const priceInUSDT = Number(mintPrice) / 1e6;
    return `${priceInUSDT.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
  }, [mintPrice, isLoadingPrice, priceError]);

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
      setIsMinted(true);
    }
  }, [isMintSuccess, mintingStep]);

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

    // Validate contract state before minting
    if (mintPrice === undefined || mintPrice === null) {
      setErrorMessage('Unable to fetch mint price. Please try again.');
      return;
    }

    // Check if mint price is set (contract requires non-zero price)
    if (mintPrice === BigInt(0)) {
      setErrorMessage('Mint price is not set in the contract. Please contact the contract owner.');
      return;
    }

    // Check if public mint is active
    if (publicMintActive === false) {
      setErrorMessage('Public minting is not currently active.');
      return;
    }

    if (publicMintActive === undefined && !isLoadingMintActive) {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Section: Exclusive Lifetime Pro NFT */}
        <div
          className="relative rounded-2xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(255,126,53,0.25)] p-8"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,140,60,0.15) 0%, rgba(255,140,60,0) 60%),' +
              'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Exclusive Lifetime Pro NFT</h2>

          {/* Shield Image Container */}
          <div className="relative flex justify-center items-center my-8">
            <div className="relative">
              <img
                src="/NFT.png"
                alt="Pro NFT Shield"
                className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(255,140,60,0.5)]"
                style={{
                  filter: isMinted ? 'brightness(1.2) saturate(1.3)' : 'brightness(0.7) saturate(0.6)',
                }}
              />
              {isMinted && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-green-500 px-6 py-2 rounded-lg transform -rotate-12 shadow-lg">
                    <span className="text-white font-bold text-lg">MINTED</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Text */}
          <div className="text-center space-y-3 mb-6">
            <p className="text-lg font-semibold text-white">One-Time Mint. Forever Access.</p>
            {isLoading ? (
              <p className="text-gray-400">Loading contract data...</p>
            ) : (
              <>
                <p className="text-gray-300">
                  <span className="text-white font-medium">Price: </span>
                  {formattedPrice}
                </p>
                <p className="text-gray-300">
                  <span className="text-white font-medium">Max Supply: </span>
                  {formattedMaxSupply}
                </p>
                <p className="text-gray-300">
                  <span className="text-white font-medium">Remaining Supply: </span>
                  {formattedRemainingSupply}
                </p>
              </>
            )}
          </div>

          {/* Mint Button */}
          <div className="space-y-2">
            {isMinted ? (
              <button
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 cursor-pointer relative overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  border: "none",
                  boxShadow: '3px 4px 5px 0px rgba(16, 185, 129, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                }}
              >
                Pro Access Unlocked!
              </button>
            ) : (
              <>
                <button
                  onClick={handleMint}
                  disabled={
                    !isConnected || 
                    isApproving || 
                    isMinting || 
                    mintingStep === 'approving' || 
                    mintingStep === 'minting' ||
                    mintPrice === BigInt(0) ||
                    publicMintActive === false ||
                    isLoadingMintActive
                  }
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-150 relative overflow-hidden ${
                    isConnected && 
                    !isApproving && 
                    !isMinting && 
                    mintingStep === 'idle' &&
                    mintPrice !== BigInt(0) &&
                    publicMintActive !== false &&
                    !isLoadingMintActive
                      ? 'cursor-pointer hover:brightness-110'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  style={
                    isConnected && 
                    !isApproving && 
                    !isMinting && 
                    mintingStep === 'idle' &&
                    mintPrice !== BigInt(0) &&
                    publicMintActive !== false &&
                    !isLoadingMintActive
                      ? {
                          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                          border: "none",
                          boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                        }
                      : {
                          background: '#4a4a4a',
                          border: "none",
                          color: '#9ca3af',
                        }
                  }
                >
                  {!isConnected
                    ? 'Login to Mint'
                    : isLoadingMintActive
                    ? 'Checking Status...'
                    : mintPrice === BigInt(0)
                    ? 'Mint Not Available'
                    : publicMintActive === false
                    ? 'Mint Not Active'
                    : mintingStep === 'approving' || isApproving
                    ? 'Approving USDT...'
                    : mintingStep === 'minting' || isMinting
                    ? 'Minting NFT...'
                    : mintingStep === 'error'
                    ? 'Retry Mint'
                    : 'Mint Now'}
                </button>
                {errorMessage && (
                  <p className="text-xs text-red-400 text-center mt-2">{errorMessage}</p>
                )}
                {mintingStep === 'success' && (
                  <p className="text-xs text-green-400 text-center mt-2">Mint successful!</p>
                )}
              </>
            )}
            {!isConnected && (
              <p className="text-xs text-gray-400 text-center mt-2">
                *Connect your wallet to check eligibility.*
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Your Pro Benefits Status */}
        <div
          className="relative rounded-2xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(255,126,53,0.25)] p-8"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,140,60,0.15) 0%, rgba(255,140,60,0) 60%),' +
              'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Pro Benefits Status</h2>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 mb-8">
            {isMinted ? (
              <>
                <CheckCircleOutlined className="text-green-500 text-2xl" />
                <div>
                  <p className="text-white font-semibold">Status: ACTIVE (Minted)</p>
                </div>
              </>
            ) : (
              <>
                <CloseCircleOutlined className="text-2xl" style={{ color: '#FF494A' }} />
                <div>
                  <p className="text-[#FF494A] font-semibold">Status: Inactive (Mint to Unlock)</p>
                </div>
              </>
            )}
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            {proBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                {isMinted ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <LockOutlined className="text-gray-500 text-lg" />
                )}
                <span className={`${isMinted ? 'text-white font-medium' : 'text-gray-400'}`}>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Background Shield (Faded) */}
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <img
              src="/NFT.png"
              alt="Background Shield"
              className="w-65 h-65 object-contain rounded-xl"
              // style={{
              //   filter: isMinted ? 'brightness(1.5) saturate(1.5)' : 'brightness(0.3) saturate(0.3)',
              // }}
            />
          </div>
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

