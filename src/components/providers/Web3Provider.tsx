// src/components/providers/Web3Provider.tsx

"use client";

import "@rainbow-me/rainbowkit/styles.css";
import React, { useMemo, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  AvatarComponent,
  DisclaimerComponent,
  RainbowKitProvider,
  Theme,
  lightTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";

import merge from "lodash.merge";
// Make sure this utility returns the chains and project ID, and is server-safe
import { walletConfigOptions } from "@/utils/chainUtils";

// Initialize QueryClient only once (safe to do outside render cycle)
const queryClient = new QueryClient();

interface Web3ModalProviderProps {
  children: React.ReactNode;
}

// --- Component Logic ---
export const Web3ModalProvider: React.FC<Web3ModalProviderProps> = ({
  children,
}) => {
  // 1. 🟢 CRITICAL HYDRATION FIX: State to track if the client is fully mounted
  const [isMounted, setIsMounted] = useState(false);

  // 2. 🟢 Effect to set mounted state after initial render
  useEffect(() => {
    // This runs only once on the client side after hydration
    setIsMounted(true);
  }, []);

  // 3. Wagmi Config (Runs on server, but its output is guarded by the mount check)
  const walletConfig = useMemo(() => {
    return getDefaultConfig(walletConfigOptions);
  }, []);

  // 4. Theme Calculation (Uses themeReady logic, which is now redundant but kept as a safeguard)
  const myTheme = useMemo(() => {
    // Always return the base theme if not mounted to ensure a stable default.
    // If you are relying on env vars, it's safer to ensure they only run on the client.
    if (!isMounted) return lightTheme();

    return merge(lightTheme(), {
      colors: {
        accentColor: process.env.NEXT_PUBLIC_BTN_PRIMARY || "#DB7A23",
        connectButtonBackground: process.env.NEXT_PUBLIC_BTN_PRIMARY || "#DB7A23",
        connectButtonText: process.env.NEXT_PUBLIC_BTN_TEXT || "#ffffff",
      },
      radii: {
        connectButton:
          process.env.NEXT_PUBLIC_CONNECT_WALLET_BUTTON_BORDER_RADIUS || "100px",
      },
      fonts: {
        body: process.env.NEXT_PUBLIC_FONT_FAMILY || "'Poppins', sans-serif",
      },
    } as Theme);
  }, [isMounted]); // Recalculate only when isMounted changes

  // --- Custom Components (Remain the same) ---
  const Disclaimer: DisclaimerComponent = ({ Text }) => (
    <Text>{process.env.NEXT_PUBLIC_TITLE}</Text>
  );

  const CustomAvatar: AvatarComponent = ({ size }) => {
    // NOTE: If the image source is dynamic or its rendering changes based on client data, 
    // it could also cause a mismatch. Using a static public path is generally safe.
    return (
      <img
        src={"/image 7.svg"}
        width={size}
        height={size}
        style={{ borderRadius: size }}
        alt="Custom Avatar"
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  };
  // -------------------------------------------

  // 5. 🛑 CRITICAL FIX: Guard the render of the entire provider stack
  if (!isMounted) {
    // Renders nothing on the server (or a simple, static placeholder)
    return null;
  }

  // 6. Render the full Web3 stack only when the client is ready
  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={myTheme}
          avatar={CustomAvatar}
          appInfo={{
            learnMoreUrl: undefined,
            disclaimer: Disclaimer,
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3ModalProvider;