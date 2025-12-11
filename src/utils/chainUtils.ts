// src/config/chainUtils.ts

import {
    bscTestnet,
    bsc,
    polygon,
    avalanche,
    avalancheFuji,
} from "wagmi/chains";
import { defineChain, http } from 'viem';
import { Chain } from 'wagmi/chains';
import {
    metaMaskWallet, trustWallet, walletConnectWallet, coinbaseWallet,
    binanceWallet, rainbowWallet, phantomWallet, rabbyWallet, ledgerWallet,
    okxWallet, braveWallet, argentWallet, uniswapWallet, safepalWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { getDefaultConfig } from "@rainbow-me/rainbowkit";


// --- Custom Chain Definitions ---
const sonicChain = defineChain({
    id: 146,
    name: 'Sonic',
    nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.soniclabs.com'] } },
});

const sonicTestnetChain = defineChain({
    id: 14601,
    name: 'Sonic Testnet',
    nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.testnet.soniclabs.com'] } },
    blockExplorers: { default: { name: 'SonicScan', url: 'https://testnet.sonicscan.org' } },
    testnet: true,
});

const anvil = defineChain({
    id: 31337,
    name: 'anvil',
    nativeCurrency: { name: 'anvil', symbol: 'A', decimals: 18 },
    rpcUrls: { default: { http: ['http://127.0.0.1:8545/'] } },
    testnet: true,
});

const polygonAmoy = defineChain({
    id: 80002,
    name: 'Amoy',
    nativeCurrency: { name: 'Amoy', symbol: 'Pol', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc-amoy.polygon.technology'] } },
    blockExplorers: { default: { name: 'AmoyPolygon', url: 'https://amoy.polygonscan.com/' } },
    testnet: true,
});


// -------------------------------------------------------------------
// 🛑 FIX 1: STATIC CHAIN ARRAY (REQUIRED for getDefaultConfig typing)
// -------------------------------------------------------------------
export const allConfiguredChains = [
    bsc,
    bscTestnet,
    polygon,
    avalanche,
    avalancheFuji,
    sonicChain,
    sonicTestnetChain,
    anvil,
    polygonAmoy,
] as const;
// -------------------------------------------------------------------


// --- UTILITIES (Remain server-safe) ---
export const getNetwork = (): Chain => {
    const chainId = process.env.NEXT_PUBLIC_APPKIT_CHAIN_ID;

    if (!chainId) {
        throw new Error("Environment variable NEXT_PUBLIC_APPKIT_CHAIN_ID is not set.");
    }

    switch (chainId) {
        // ... (all chain switch cases remain here)
        case "bsc": return bsc;
        case "bscTestnet": return bscTestnet;
        case "polygon": return polygon;
        case "polygonAmoy": return polygonAmoy;
        case "avax": return avalanche;
        case "avaxFuji": return avalancheFuji;
        case "sonic": return sonicChain;
        case "sonicTestnet": return sonicTestnetChain;
        case "anvil": return anvil;
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
};

// Single source of truth for the selected chain based on the env var.
const selectedChain = getNetwork();
const chains = [selectedChain] as [Chain];
const transports = {
    [selectedChain.id]: http(selectedChain.rpcUrls.default.http[0]),
} as const;

// ... (getWalletSymbol and getWalletChainId utilities remain here)


// -------------------------------------------------------------------
// --- CONFIG OPTIONS (Server-Safe object to be consumed by the client) ---
// -------------------------------------------------------------------
export const walletConfigOptions: Parameters<typeof getDefaultConfig>[0] = {
    appName: process.env.NEXT_PUBLIC_TITLE || "My App",
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",

    // Use only the env-selected chain so we don't accidentally default to a testnet.
    chains,

    // Explicit transports keep RainbowKit/Wagmi aligned with the selected chain.
    transports,

    wallets: [
        {
            groupName: "Recommended",
            wallets: [
                metaMaskWallet, trustWallet, walletConnectWallet, coinbaseWallet,
            ],
        },
        {
            groupName: "Others",
            wallets: [
                binanceWallet, rainbowWallet, phantomWallet, rabbyWallet, ledgerWallet,
                okxWallet, braveWallet, argentWallet, uniswapWallet, safepalWallet,
            ],
        },
    ],
    // IMPORTANT: Keep ssr: true for Next.js
    ssr: true,
};