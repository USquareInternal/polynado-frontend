// src/utils/nftContract.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import NFTmintABI from '@/abi/NFTmintABI.json.json';

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
] as const;

// Contract address - should be set in environment variables
// Get address dynamically since env vars are available at runtime
const getContractAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    if (typeof window !== 'undefined') {
      console.warn('NFT Contract Address not set in NEXT_PUBLIC_NFT_CONTRACT_ADDRESS');
    }
    return undefined;
  }
  return address as `0x${string}`;
};

// Export function to get address dynamically
export const getNFTContractAddress = () => getContractAddress();

/**
 * Custom hook to read mint price from the NFT contract
 */
export const useMintPrice = () => {
  const contractAddress = getContractAddress();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'mintPrice',
    query: {
      enabled: !!contractAddress, // Only query if contract address is set
    },
  });

  return {
    mintPrice: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Custom hook to read MAX_SUPPLY from the NFT contract
 */
export const useMaxSupply = () => {
  const contractAddress = getContractAddress();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'MAX_SUPPLY',
    query: {
      enabled: !!contractAddress, // Only query if contract address is set
    },
  });

  return {
    maxSupply: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Custom hook to read remainingSupply from the NFT contract
 */
export const useRemainingSupply = () => {
  const contractAddress = getContractAddress();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'remainingSupply',
    query: {
      enabled: !!contractAddress, // Only query if contract address is set
    },
  });

  return {
    remainingSupply: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Custom hook to check if public mint is active
 */
export const usePublicMintActive = () => {
  const contractAddress = getContractAddress();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: NFTmintABI,
    functionName: 'publicMintActive',
    query: {
      enabled: !!contractAddress,
    },
  });

  return {
    publicMintActive: data as boolean | undefined,
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
    if (typeof window !== 'undefined') {
      console.warn('USDT Contract Address not set in NEXT_PUBLIC_USDT_ADDRESS');
    }
    return undefined;
  }
  return address as `0x${string}`;
};

/**
 * Hook to approve USDT spending for NFT contract
 */
export const useApproveUSDT = () => {
  const usdtAddress = getUSDTAddress();
  const nftContractAddress = getContractAddress();
  
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveUSDT = async (amount: bigint) => {
    if (!usdtAddress || !nftContractAddress) {
      throw new Error('USDT or NFT contract address not set');
    }

    writeContract({
      address: usdtAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [nftContractAddress, amount],
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
 * Hook to mint NFT
 */
export const useMintNFT = () => {
  const contractAddress = getContractAddress();
  
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = async (quantity: number = 1, referralCode: string = 'ADMIN') => {
    if (!contractAddress) {
      throw new Error('NFT contract address not set');
    }

    // Empty bytes32 array for merkle proof (not using whitelist)
    const merkleProof: `0x${string}`[] = [];

    writeContract({
      address: contractAddress,
      abi: NFTmintABI,
      functionName: 'mint',
      args: [BigInt(quantity), merkleProof, referralCode],
    });
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
};

