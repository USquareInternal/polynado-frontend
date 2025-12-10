// src/components/organisms/Sidebar.tsx
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import NavLink from '../molecules/NavLink';
import {
    LineChartOutlined,
    StarOutlined,
    FileTextOutlined,
    EllipsisOutlined,
    CloseOutlined,
    GiftOutlined,
    TeamOutlined,
} from '@ant-design/icons';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

const CUSTOM_LOGO_PATH = '/path/to/your/logo/icon.svg';

const navItems = [
    { name: 'NFT Mint', href: '/nft-mint', icon: GiftOutlined },
    { name: 'Referral', href: '/referral', icon: TeamOutlined },
];


export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();

    // Define the narrow desktop width
    const desktopWidthClass = 'lg:w-20'; // 80px

    // Define a standard header height (e.g., 64px tall, h-16)
    const headerHeightClass = 'h-16';

    // --- Logo Container Classes ---
    const logoContainerClasses = `p-4 flex items-center bg-[#1E2022]
                                  justify-between ${headerHeightClass}
                                  lg:justify-center lg:px-0 lg:${headerHeightClass} 
                                  overflow-hidden`;

    return (
        <>
            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Content */}
            <div className={`fixed inset-y-0 left-0 z-50 h-full w-64 bg-[#1E2022] border-r border-gray-700 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 ${desktopWidthClass} lg:flex-shrink-0 lg:shadow-none`}>

                {/* 2. Logo Container */}
                <div className={logoContainerClasses}>

                    <span className="flex items-center h-full mb-8 pt-5 lg:flex lg:justify-center">
                        <img
                            src='/image 7.svg'
                            alt="Logo"
                            className="max-h-12 max-w-full"
                        />
                    </span>

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 text-white hover:bg-gray-700 rounded-lg"
                        aria-label="Close sidebar"
                    >
                        <CloseOutlined className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-2 lg:p-2 lg:space-y-4">
                    {navItems.map(item => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <NavLink
                                key={item.name}
                                href={item.href}
                                name={item.name}
                                isActive={isActive}
                                tooltipText={item.name}
                                iconPlaceholder={item.icon}
                                isNarrow={true}
                                className="lg:justify-center"
                            />
                        );
                    })}
                </nav>
            </div>
        </>
    );
};