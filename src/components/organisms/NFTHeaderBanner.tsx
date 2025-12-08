import React from 'react';
import { Heading } from '@/components/atoms/Heading';

interface NFTHeaderBannerProps {
  minted: number;
  totalSupply: number;
  floorPrice: string;
}

export const NFTHeaderBanner: React.FC<NFTHeaderBannerProps> = ({
  minted,
  totalSupply,
  floorPrice,
}) => {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border border-orange-500/30
        shadow-[0_0_40px_rgba(255,126,53,0.25)]
        text-white
        max-w-6xl
        mx-auto
      "
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/HT.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(1.12) saturate(1.15)',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ff7e35,transparent_45%)] opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/75" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center space-y-4">
        <Heading
          level={1}
          className="text-white leading-none text-4xl md:text-5xl"
          style={{
            fontFamily: "'Inria Sans', sans-serif",
            fontWeight: 700,
            fontSize: '48px',
            lineHeight: '100%',
            letterSpacing: '0',
            background: '#FFFFFF',
          }}
        >
          Polynado Lifetime Pass
        </Heading>
        <p
          className="text-lg sm:text-xl font-semibold"
          style={{
            fontFamily: "'Inria Sans', sans-serif",
            fontWeight: 700,
            fontSize: '26px',
            lineHeight: '100%',
            letterSpacing: '0',
            textAlign: 'center',
        
          }}
        >
          Unlock your Infinite Edge.
        </p>
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-gray-200 leading-relaxed space-y-1">
          <span className="block">
            Own a piece of the future. Each NFT grants you permanent
          </span>
          <span className="block">
            access to AI-powered market intelligence, fair odds algorithms,
          </span>
          <span className="block">
            and exclusive features. No subscriptions. No limits. Forever.
          </span>
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          <div className="space-y-1">
            <p
              className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(255,140,60,0.45)]"
              style={{
                backgroundImage:
                  'linear-gradient(0deg, #D16300, #D16300), radial-gradient(63.11% 63.11% at 31.97% 19.67%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 69.79%, rgba(255, 255, 255, 0) 100%)',
              }}
            >
              {minted}
            </p>
            <p className="text-sm uppercase tracking-wide text-gray-200">
              Minted
            </p>
          </div>
          <div className="space-y-1">
            <p
              className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(255,140,60,0.45)]"
              style={{
                backgroundImage:
                  'linear-gradient(0deg, #D16300, #D16300), radial-gradient(63.11% 63.11% at 31.97% 19.67%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 69.79%, rgba(255, 255, 255, 0) 100%)',
              }}
            >
              {totalSupply}
            </p>
            <p className="text-sm uppercase tracking-wide text-gray-200">
              Total Supply
            </p>
          </div>
          <div className="space-y-1">
            <p
              className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(255,140,60,0.45)]"
              style={{
                backgroundImage:
                  'linear-gradient(0deg, #D16300, #D16300), radial-gradient(63.11% 63.11% at 31.97% 19.67%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 69.79%, rgba(255, 255, 255, 0) 100%)',
              }}
            >
              {floorPrice}
            </p>
            <p className="text-sm uppercase tracking-wide text-gray-200">
              Floor Price
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

