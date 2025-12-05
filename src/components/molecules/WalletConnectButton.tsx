// components/ConnectButtons.tsx

'use client'; // <-- MUST be included for client-side hooks (useEffect, useRef, useAccount)

import React, { useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
// Ensure this path is correct and the utility function is defined
import { showSuccessAlert } from "@/utils/SweetAlertUtils";

interface WalletConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * A client component that manages the wallet connection state 
 * and displays the RainbowKit Connect button.
 */
const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
    // Wagmi hook to track wallet connection status
    const { isConnected } = useAccount();

    // Ref to track the previous connection state to detect changes
    const wasConnected = useRef(isConnected);

    useEffect(() => {
        // Check if the connection status has changed since the last render
        // and ensure this is not the initial mount (where isConnected == wasConnected.current)
        if (isConnected !== wasConnected.current) {

            // Call the external SweetAlert function
            showSuccessAlert(
                `Your wallet has been ${isConnected ? "connected" : "disconnected"} successfully.`,
            );

            // Fire optional callbacks
            if (isConnected) {
                onConnect?.();
            } else {
                onDisconnect?.();
            }

            // Update the ref to the current state for the next render cycle
            wasConnected.current = isConnected;
        }
    }, [isConnected]); // Reruns whenever the connection status changes

    return (
        <ConnectButton
            showBalance={false}
            accountStatus="address"
            chainStatus="none"
        />
    );
};

export default WalletConnect;