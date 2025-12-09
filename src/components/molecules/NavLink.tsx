// src/components/molecules/NavLink.tsx
import React from 'react';
import { Button, ConfigProvider, Flex, Tooltip } from 'antd';

// components/NavLink.tsx (Conceptual implementation for tooltip)

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
    iconPlaceholder: IconComponent
}) => {
    // Note: The 'group' class is crucial here
    return (
        <a
            href={href}
            // Increased desktop padding: p-2 on mobile, sm:p-4 on desktop
            className={`relative flex items-center p-2 sm:p-4 rounded-lg transition-colors duration-150 group 
                ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            {/* 1. Icon Component (Visible on Desktop/Large Screens, Hidden on Mobile/Small Screens) */}
            <span className="hidden sm:block">
                {/* Increased icon size to w-8 h-8 (32px x 32px) on desktop */}
                <IconComponent className="sm:w-8 sm:h-8" />
            </span>

            {/* 2. Link Content (Name) (Visible on Mobile/Small Screens, Hidden on Desktop/Large Screens) */}
            <span className="font-medium sm:hidden">
                {name}
            </span>

            {/* 3. Tooltip Implementation (Only shown on desktop) */}
            <span
                className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-md 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap
                   pointer-events-none z-50
                   hidden sm:block"
            >
                {tooltipText}
            </span>
        </a>
    );
};

export default NavLink; // Ensure you export your component