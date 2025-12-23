'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/atoms/Footer';
import { useAccount } from 'wagmi';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isConnected, address } = useAccount();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleConnect = () => {}; // Wagmi handles connection
    const handleDisconnect = () => {}; // Wagmi handles disconnection

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
                    userAddress={address}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />

                {/* 3. Page Content */}
                {/* The main content now starts immediately below the header's height (h-16) */}
                {/* Responsive: 98% on mobile/tablet, optimized for 1920x1080 */}
                <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 fullhd:px-16" 
                      style={{
                        maxWidth: "98%", 
                        margin: "50px auto 10px",
                        width: "98%"
                      }}>
                    <div className="max-w-7xl xl:max-w-[1600px] fullhd:max-w-[1800px] mx-auto">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};