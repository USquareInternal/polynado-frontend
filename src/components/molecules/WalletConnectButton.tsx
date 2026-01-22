// components/ConnectButtons.tsx

'use client'; // <-- MUST be included for client-side hooks (useEffect, useRef, useAccount)

import React from "react";
import { CustomWalletButton } from "./CustomWalletButton";

interface WalletConnectProps {
    onConnect?: () => void;
    onDisconnect?: () => void;
}

/**
 * A client component that manages the wallet connection state 
 * and displays the custom wallet button with modal.
 */
const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
    return (
        <div className="custom-connect-button-wrapper" style={{ display: 'block', visibility: 'visible' }}>
            <CustomWalletButton
                onConnect={onConnect}
                onDisconnect={onDisconnect}
            />
        </div>
    );
};

export default WalletConnect;