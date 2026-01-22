// src/components/organisms/HeroTerminal.tsx
import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Button } from '@/components/atoms/Button';

export const HeroTerminal: React.FC = () => {
  return (
    <section
      className="
        relative
        overflow-hidden
        border border-gray-700
        rounded-[15px]
        py-8 xl:py-12 fullhd:py-16
        px-6 sm:px-10 md:px-14 xl:px-20 fullhd:px-24
        text-center
        shadow-2xl
        mb-8 xl:mb-12 fullhd:mb-16
        max-w-[1236px] xl:max-w-[1400px] fullhd:max-w-[1600px]
        md:min-h-[354px] xl:min-h-[400px] fullhd:min-h-[450px]
        mx-auto
      "
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/HT.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Glow overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_center,#ff5f1f40_0%,transparent_55%)]" />

      {/* Background Overlay for better text readability */}
      <div className="absolute inset-0 rounded-[15px]" />

      {/* Content Container (Ensure content is above the overlay) */}
      <div className="relative text-white flex flex-col items-center space-y-4">
        {/* Access Badge - Looks good as is */}
        {/* <span className="inline-block px-4 py-1 text-xs sm:text-sm font-medium text-white border border-white/40 rounded-full bg-white/10 shadow-md">
          Access
        </span> */}

        {/* Main Title - **IMPROVED RESPONSIVENESS** (text-3xl sm:text-4xl lg:text-5xl xl:text-6xl fullhd:text-7xl) */}
        <Heading
          level={1}
          className="
            max-w-4xl xl:max-w-5xl fullhd:max-w-6xl mx-auto
            text-white 
            text-3xl sm:text-4xl lg:text-5xl xl:text-6xl fullhd:text-7xl
            font-extrabold 
            leading-tight
          "
        >
          The Bloomberg Terminal for Prediction Markets
        </Heading>

        {/* Description - **IMPROVED RESPONSIVENESS** (text-sm sm:text-base xl:text-lg fullhd:text-xl) */}
        <p className="text-gray-200 max-w-2xl xl:max-w-3xl fullhd:max-w-4xl mx-auto text-sm sm:text-base xl:text-lg fullhd:text-xl">
          AI-powered intelligence, real-time data, and fair odds modeling to find your edge on Polymarket.
        </p>

        {/* Buttons - Uses responsive stacking (flex-col sm:flex-row) */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="secondary"
            className="px-5 py-2 text-sm font-semibold relative overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
              color: "white",
              border: "none",
              boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
              position: 'relative',
            }}
          >
            Get Lifetime Access
          </Button>
          <Button
            variant="secondary"
            className="px-5 py-2 text-sm font-semibold border border-white/40 bg-white/10 text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
          >
            Explore Markets
          </Button>
        </div>
      </div>
    </section>
  );
};