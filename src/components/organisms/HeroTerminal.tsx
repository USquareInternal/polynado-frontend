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
        relative
        border border-gray-700
        rounded-[15px]
        py-8 px-6 sm:px-10 md:px-14
        text-center
        shadow-2xl
        mb-8
        max-w-[1236px]
        md:min-h-[354px]
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
        <span className="inline-block px-4 py-1 text-xs sm:text-sm font-medium text-white border border-white/40 rounded-full bg-white/10 shadow-md">
          Access
        </span>

        {/* Main Title - **IMPROVED RESPONSIVENESS** (text-3xl sm:text-4xl lg:text-5xl) */}
        <Heading
          level={1}
          className="
            max-w-4xl mx-auto
            text-white 
            text-3xl sm:text-4xl lg:text-5xl 
            font-extrabold 
            leading-tight
          "
        >
          The Bloomberg Terminal for Prediction Markets
        </Heading>

        {/* Description - **IMPROVED RESPONSIVENESS** (text-sm sm:text-base) */}
        <p className="text-gray-200 max-w-2xl mx-auto text-sm sm:text-base">
          AI-powered intelligence, real-time data, and fair odds modeling to find your edge on Polymarket.
        </p>

        {/* Buttons - Uses responsive stacking (flex-col sm:flex-row) */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="secondary"
            className="px-5 py-2 text-sm font-semibold"
            style={{ backgroundColor: "#f97316", color: "white", borderColor: "#f97316" }}
          >
            Get life time access
          </Button>
          <Button
            variant="secondary"
            className="px-5 py-2 text-sm font-semibold border border-white/40 bg-white/10 text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
          >
            Explore Market
          </Button>
        </div>
      </div>
    </section>
  );
};