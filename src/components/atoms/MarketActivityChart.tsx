// src/components/atoms/MarketActivityChart.tsx
import React from 'react';

// Placeholder for the Market Activity Chart component
export const MarketActivityChart: React.FC = () => {
    // Define the path to your placeholder image
    const PLACEHOLDER_IMAGE_SRC = '/image 12.png';

    return (
        <div
            // Ensures the chart has a decent height and style
            className="h-48 bg-black rounded-lg p-4 
                        border border-orange-500/50 
                        shadow-[0_0_8px_rgba(255,165,0,0.3)] 
                        flex items-center justify-center relative overflow-hidden"
        >
            {/* Image to replace the chart placeholder */}
            <img
                src={PLACEHOLDER_IMAGE_SRC}
                alt="Market Activity Chart Placeholder"
                // Classes to make the image fill the container and maintain aspect ratio
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
            />

            {/* Optional: Keep a text overlay for context, or remove it completely */}
            <span className="relative z-10 text-xl font-bold text-orange-500/80 pointer-events-none">
                {/* [Image Displayed] */}
            </span>
        </div>
    );
};