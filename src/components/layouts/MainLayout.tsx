'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/atoms/Footer'

interface MainLayoutProps {
    children: React.ReactNode;
}

// --- Mock Wallet/Auth State for Layout Context ---
const MOCK_USER_ADDRESS = "0xPolynado12345...89abc";

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // The 'lg' breakpoint matches the desktop view where the sidebar is always visible.
    // The 'pl-20' matches the desktopWidthClass ('lg:w-20') in Sidebar.tsx.

    const MAIN_CONTENT_PADDING = 'lg:pl-20'; // Left padding for desktop sidebar offset
    const HEADER_HEIGHT_PADDING = 'pt-16'; // Top padding to offset the fixed header (h-16 = 64px)

    return (
        // ✅ 1. Set the root background color to dark
        <div className="min-h-screen bg-[#000000]">

            {/* SIDEBAR (Organism) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={toggleSidebar}
            />

            {/* 2. Main Content Wrapper: Flexible column layout */}
            <div className={`flex flex-col min-h-screen ${MAIN_CONTENT_PADDING} ${HEADER_HEIGHT_PADDING}`}>

                {/* HEADER (Organism) */}
                {/* ✅ 2. KEEP sticky top-0 and z-20, REMOVE 'shadow-sm' to allow merging visually. */}

                <Header
                    welcomeText="Welcome Back !"
                    onMenuClick={toggleSidebar}
                    isConnected={isConnected}
                    userAddress={MOCK_USER_ADDRESS}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />

                {/* 3. Page Content */}
                {/* The main content now starts immediately below the header's height (h-16) */}
                <main className="flex-1" style={{maxWidth:"98%", margin:"50px auto 10px"}}>
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};