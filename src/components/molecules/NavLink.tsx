// src/components/molecules/NavLink.tsx
'use client';
import React from 'react';
import Link from 'next/link';

interface NavLinkProps {
    href: string;
    name: string;
    isActive: boolean;
    tooltipText: string; // New prop for the tooltip content
    iconPlaceholder: React.ElementType<any, keyof React.JSX.IntrinsicElements>;
    isNarrow?: boolean
    className?: string
}

const NavLink: React.FC<NavLinkProps> = ({
    href,
    name,
    isActive,
    tooltipText,
    iconPlaceholder: IconComponent,
    className = ''
}) => {
    // Note: The 'group' class is crucial here
    return (
        <Link
            href={href}
            // Increased desktop padding: p-2 on mobile, sm:p-4 on desktop
            className={`relative flex items-center p-2 sm:p-4 rounded-lg transition-all duration-150 group cursor-pointer
                ${isActive 
                    ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                } ${className}`}
        >
            {/* 1. Icon Component (Visible on Desktop/Large Screens, Hidden on Mobile/Small Screens) */}
            <span className="hidden sm:block">
                {/* Increased icon size to w-10 h-10 (40px x 40px) on desktop */}
                <IconComponent className={`sm:w-10 sm:h-10 sm:text-2xl transition-colors ${
                    isActive ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'
                }`} />
            </span>

            {/* 2. Link Content (Name) (Visible on Mobile/Small Screens, Hidden on Desktop/Large Screens) */}
            <span className={`font-medium sm:hidden ${isActive ? 'text-orange-400' : 'text-gray-300'}`}>
                {name}
            </span>

            {/* 3. Tooltip Implementation (Only shown on desktop) */}
            <span
                className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-md 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap
                   pointer-events-none z-50 shadow-lg
                   hidden sm:block"
            >
                {tooltipText}
            </span>
        </Link>
    );
};

export default NavLink; // Ensure you export your component