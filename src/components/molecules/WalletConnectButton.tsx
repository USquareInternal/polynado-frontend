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
    const wasConnected = useRef<boolean | undefined>(undefined);
    // Ref to track if component has mounted to prevent showing alert on initial mount
    const isMounted = useRef(false);

    useEffect(() => {
        // Mark component as mounted after first render
        if (!isMounted.current) {
            isMounted.current = true;
            wasConnected.current = isConnected;
            return;
        }

        // Only show alert if connection state actually changed and component is mounted
        if (isConnected !== wasConnected.current && wasConnected.current !== undefined) {
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
        }

        // Update the ref to the current state for the next render cycle
        wasConnected.current = isConnected;
    }, [isConnected, onConnect, onDisconnect]); // Reruns whenever the connection status changes

    return (
        <div className="custom-connect-button-wrapper">
            <ConnectButton
                showBalance={false}
                accountStatus="address"
                chainStatus="none"
            />
        </div>
    );
};

export default WalletConnect;