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


// -------------------------------------------------------------------
// 🛑 FIX 1: STATIC CHAIN ARRAY (REQUIRED for getDefaultConfig typing)
// Only 2 chains: Polygon and BSC
// -------------------------------------------------------------------
export const allConfiguredChains = [
    bsc,
    polygon,
    bscTestnet,
] as const;
// -------------------------------------------------------------------


// --- UTILITIES (Remain server-safe) ---
export const getNetwork = (): Chain => {
    const chainId = process.env.NEXT_PUBLIC_APPKIT_CHAIN_ID;

    if (!chainId) {
        throw new Error("Environment variable NEXT_PUBLIC_APPKIT_CHAIN_ID is not set.");
    }

    switch (chainId) {
        case "bsc": return bsc;
        case "polygon": return polygon;
        case "bscTestnet": return bscTestnet;
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
};

// Single source of truth for the selected chain based on the env var.
const selectedChain = getNetwork();

// Include all configured chains for network switching support
const chains = allConfiguredChains as readonly [Chain, ...Chain[]];

// Configure transports for all chains
const transports: Record<number, ReturnType<typeof http>> = {};
allConfiguredChains.forEach((chain) => {
    const rpcUrl = chain.rpcUrls?.default?.http?.[0];
    if (rpcUrl) {
        transports[chain.id] = http(rpcUrl);
    }
});

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