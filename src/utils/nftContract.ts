// src/utils/nftContract.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import NFTmintABI from '@/abi/NFTmintABI.json';

// ERC20 ABI for USDT approve function
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
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
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract address - should be set in environment variables
// Get address dynamically since env vars are available at runtime
const getContractAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  
  // console.log('[getContractAddress] Environment variable:', address);
  
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    if (typeof window !== 'undefined') {
      console.warn('[getContractAddress] NFT Contract Address not set in NEXT_PUBLIC_NFT_CONTRACT_ADDRESS');
    }
    return undefined;
  }
  // console.log('[getContractAddress] Returning address:', address);
  return address as `0x${string}`;
};

// Export function to get address dynamically
export const getNFTContractAddress = () => getContractAddress();

/**
 * Hook to read USDT contract address and decimals from the NFT contract
 */
export const useUSDTMeta = () => {
  const contractAddress = getContractAddress();

  const usdtAddressResult = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'usdtToken',
    query: { enabled: !!contractAddress },
  });

  const usdtAddress = usdtAddressResult.data as `0x${string}` | undefined;

  // Try to read decimals from USDT contract
  const decimalsResult = useReadContract({
    address: usdtAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!usdtAddress },
  });

  // Fallback to env override or 18 (most ERC20 tokens use 18 decimals)
  const fallbackDecimals = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS ?? 18);
  const usdtDecimals = decimalsResult.data !== undefined 
    ? Number(decimalsResult.data) 
    : fallbackDecimals;

  return {
    usdtAddress,
    usdtDecimals,
    isLoading: usdtAddressResult.isLoading || decimalsResult.isLoading,
    error: usdtAddressResult.error || decimalsResult.error,
    refetch: () => {
      usdtAddressResult.refetch?.();
      decimalsResult.refetch?.();
    },
  };
};

/**
 * Hook to read ERC721 balance for an address
 */
// Factory ABI does not expose holder balances; return undefined to avoid bad calls.
export const useNFTBalance = (_owner?: `0x${string}`) => ({
  balance: undefined as bigint | undefined,
  isLoading: false,
  error: undefined as Error | undefined,
  refetch: () => undefined,
});

/**
 * Hook to check if whitelist minting is active
 */
export const useWhitelistMintActive = (collectionId: number | bigint = 1) => {
  const { collection, isLoading, error, refetch } = useCollectionInfo(collectionId);
  // No separate whitelist flag; use collection active flag
  return {
    whitelistMintActive: collection?.isActive,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to check if an address is whitelisted
 */
export const useWhitelistStatus = (userId?: string) => {
  const contractAddress = getContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'isWhitelisted',
    args: userId ? [userId] : undefined,
    query: {
      enabled: !!contractAddress && !!userId,
    },
  });

  return {
    isWhitelisted: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
};

// ------------------------------------------------------------
// Collection metadata & supply
// ------------------------------------------------------------
export type CollectionInfo = {
  collectionAddress: `0x${string}`;
  name: string;
  symbol: string;
  maxSupply: bigint;
  mintPrice: bigint;
  isActive: boolean;
};

export const useCollectionInfo = (collectionId: number | bigint | undefined) => {
  const contractAddress = getContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'collections',
    args: collectionId !== undefined ? [BigInt(collectionId)] : undefined,
    query: {
      enabled: !!contractAddress && collectionId !== undefined,
    },
  });

  // Debug logging
  if (typeof window !== 'undefined' && data) {
    console.log(`[useCollectionInfo] Collection ${collectionId} raw data:`, {
      data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      keys: data && typeof data === 'object' ? Object.keys(data) : null,
      contractAddress,
      collectionId,
    });
  }

  const tuple = data as
    | {
        0: `0x${string}`;
        1: string;
        2: string;
        3: bigint;
        4: bigint;
        5: boolean;
        collectionAddress?: `0x${string}`;
        name?: string;
        symbol?: string;
        maxSupply?: bigint;
        mintPrice?: bigint;
        isActive?: boolean;
      }
    | undefined;

  const collection: CollectionInfo | undefined = tuple
    ? {
        collectionAddress: (tuple.collectionAddress ?? tuple[0]) as `0x${string}`,
        name: tuple.name ?? tuple[1],
        symbol: tuple.symbol ?? tuple[2],
        maxSupply: tuple.maxSupply ?? tuple[3],
        mintPrice: tuple.mintPrice ?? tuple[4],
        isActive: tuple.isActive ?? tuple[5],
      }
    : undefined;

  // Debug logging for parsed collection
  if (typeof window !== 'undefined') {
    console.log(`[useCollectionInfo] Collection ${collectionId} parsed:`, {
      collection,
      mintPrice: collection?.mintPrice,
      mintPriceString: collection?.mintPrice?.toString(),
      error,
      isLoading,
    });
  }

  return { collection, isLoading, error, refetch };
};

export const useCollectionSupply = (collectionId: number | bigint | undefined) => {
  const contractAddress = getContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'getCollectionSupply',
    args: collectionId !== undefined ? [BigInt(collectionId)] : undefined,
    query: {
      enabled: !!contractAddress && collectionId !== undefined,
    },
  });

  const tuple = data as
    | {
        0: bigint;
        1: bigint;
        current?: bigint;
        max?: bigint;
      }
    | undefined;

  return {
    current: tuple ? tuple.current ?? tuple[0] : undefined,
    max: tuple ? tuple.max ?? tuple[1] : undefined,
    isLoading,
    error,
    refetch,
  };
};

export const usePublicMintActive = (collectionId: number | bigint = 1) => {
  const { collection, isLoading, error, refetch } = useCollectionInfo(collectionId);
  return {
    publicMintActive: collection?.isActive,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Get USDT contract address from environment variables
 */
const getUSDTAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_USDT_ADDRESS;
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return undefined;
  }
  return address as `0x${string}`;
};

/**
 * Hook to approve USDT spending for NFT contract
 */
export const useApproveUSDT = (
  usdtAddress?: `0x${string}`,
  nftContractAddress?: `0x${string}`,
) => {
  const resolvedUsdt = usdtAddress ?? getUSDTAddress();
  const resolvedNft = nftContractAddress ?? getContractAddress();
  
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveUSDT = async (amount: bigint) => {
    if (!resolvedUsdt || !resolvedNft) {
      throw new Error('USDT or NFT contract address not set');
    }

    writeContract({
      address: resolvedUsdt,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [resolvedNft, amount],
    });
  };

  return {
    approveUSDT,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook to mint via publicMint(userId, collectionId)
 */
export const usePublicMint = () => {
  const contractAddress = getContractAddress();

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const publicMint = async (userId: string, collectionId: number) => {
    if (!contractAddress) {
      throw new Error('NFT contract address not set');
    }

    writeContract({
      address: contractAddress,
      abi: NFTmintABI,
      functionName: 'publicMint',
      args: [userId, BigInt(collectionId)],
    });
  };

  return {
    publicMint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook to mint via whitelistMint(userId, collectionId)
 */
export const useWhitelistMint = () => {
  const contractAddress = getContractAddress();

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const whitelistMint = async (userId: string, collectionId: number) => {
    if (!contractAddress) {
      throw new Error('NFT contract address not set');
    }

    writeContract({
      address: contractAddress,
      abi: NFTmintABI,
      functionName: 'whitelistMint',
      args: [userId, BigInt(collectionId)],
    });
  };

  return {
    whitelistMint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook to join Polynado via joinPolynado(userId, referrerId, email)
 */
export const useJoinPolynado = () => {
  const contractAddress = getContractAddress();

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
      retry: 3,
      retryDelay: 2000,
    },
  });

  const joinPolynado = async (userId: string, referrerId: string, email: string) => {
    if (!contractAddress) {
      throw new Error('NFT contract address not set');
    }

    writeContract({
      address: contractAddress,
      abi: NFTmintABI,
      functionName: 'joinPolynado',
      args: [userId, referrerId || '', email],
    });
  };

  return {
    joinPolynado,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
};


/**
 * Hook to get userId by wallet address
 */
export const useUserIdByWallet = (walletAddress?: `0x${string}`) => {
  const contractAddress = getContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'walletToUserId',
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!walletAddress,
    },
  });

  return {
    userId: data as string | undefined,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get user info including minted collections
 */
export const useUserInfo = (userId?: string) => {
  const contractAddress = getContractAddress();
  const isEnabled = !!contractAddress && !!userId;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'getUserData',
    args: userId ? [userId] : undefined,
    query: {
      enabled: isEnabled,
    },
  });

  // Parse the new getUserData response structure:
  // userId (string), referrerId (string), email (string), 
  // referralRewards (uint256), nftRewards (uint256),
  // totalRefs (uint256), nftRefs (uint256),
  // minted (bool), mintedColls (uint256[])
  const tuple = data as
    | {
        0?: string;  // userId
        1?: string;  // referrerId
        2?: string;  // email
        3?: bigint;  // referralRewards
        4?: bigint;  // nftRewards
        5?: bigint;  // totalRefs
        6?: bigint;  // nftRefs
        7?: boolean; // minted
        8?: bigint[]; // mintedColls
        userId?: string;
        referrerId?: string;
        email?: string;
        referralRewards?: bigint;
        nftRewards?: bigint;
        totalRefs?: bigint;
        nftRefs?: bigint;
        minted?: boolean;
        mintedColls?: bigint[];
      }
    | undefined;

  const userInfo = tuple
    ? {
        userId: tuple.userId ?? tuple[0],
        referrerId: tuple.referrerId ?? tuple[1],
        email: tuple.email ?? tuple[2],
        referralRewards: tuple.referralRewards ?? tuple[3],
        nftRewards: tuple.nftRewards ?? tuple[4],
        totalRefs: tuple.totalRefs ?? tuple[5],
        nftRefs: tuple.nftRefs ?? tuple[6],
        isMinted: tuple.minted ?? tuple[7] ?? false,
        // Map mintedColls to collectionIds for backward compatibility
        collectionIds: tuple.mintedColls ?? tuple[8] ?? [],
      }
    : undefined;

  return {
    userInfo,
    isLoading,
    error,
    refetch,
  };
};

